import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTeamSnapClient } from '@/lib/teamsnap-api';
import { sql } from '@vercel/postgres';
import { ApiResponse, withErrorHandler } from '@/lib/api-utils';

interface TeamSnapPlayer {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: string;
}

interface TeamSnapAvailability {
  id: string;
  status_code: number; // 1 = Yes, 0 = No, null = No Response
  member_id: string;
  event_id: string;
  notes?: string;
}

interface SyncRequest {
  eventId: number;
  teamSnapEventId?: string;
}

interface RosterPlayer {
  id: number;
  first_name: string;
  last_name: string;
}

/**
 * POST /api/teamsnap/sync
 * Sync attendance data from TeamSnap for a specific event
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const body: SyncRequest = await request.json();
  const { eventId, teamSnapEventId } = body;

  if (!eventId) {
    return ApiResponse.badRequest('Event ID is required');
  }

  // Check authentication
  const cookieStore = cookies();
  const accessToken = cookieStore.get('teamsnap_access_token');
  
  if (!accessToken) {
    return NextResponse.json(
      { error: 'TeamSnap authentication required' },
      { status: 401 }
    );
  }

  try {
    const teamSnapClient = getTeamSnapClient();
    
    // Get the group and TeamSnap team ID from the event
    const eventResult = await sql`
      SELECT e.*, g.teamsnap_team_id, g.id as group_id
      FROM events e
      JOIN groups g ON e.group_id = g.id
      WHERE e.id = ${eventId}
    `;

    if (eventResult.rows.length === 0) {
      return ApiResponse.notFound('Event not found');
    }

    const event = eventResult.rows[0];
    const teamSnapTeamId = event.teamsnap_team_id;

    if (!teamSnapTeamId) {
      return ApiResponse.badRequest('TeamSnap team ID not configured for this group');
    }

    // Use the provided TeamSnap event ID or try to find it
    let tsEventId = teamSnapEventId;
    
    if (!tsEventId) {
      // Try to find the TeamSnap event by matching date/time
      const teamSnapEvents = await teamSnapClient.getTeamEvents(teamSnapTeamId, accessToken.value);
      
      // You might need to match by date/time or name
      // For now, we'll require the TeamSnap event ID to be provided
      return ApiResponse.badRequest('TeamSnap event ID is required');
    }

    // Get team members from TeamSnap
    const teamSnapMembers = await teamSnapClient.getTeamMembers(teamSnapTeamId, accessToken.value);
    
    // Get availability data from TeamSnap
    const teamSnapAvailability = await teamSnapClient.getEventAvailability(tsEventId, accessToken.value);
    
    // Get players from our database
    const playersResult = await sql<RosterPlayer>`
      SELECT id, first_name, last_name 
      FROM players 
      WHERE group_id = ${event.group_id} 
      AND is_active = true
    `;
    
    const ourPlayers = playersResult.rows;
    
    // Map TeamSnap members to our players by name matching
    const playerMapping = new Map<string, number>();
    const unmatchedTeamSnapPlayers: string[] = [];
    
    // Extract member data from TeamSnap response
    const members = teamSnapMembers.collection?.items || [];
    const availabilities = teamSnapAvailability.collection?.items || [];
    
    // Process members
    members.forEach((memberItem: any) => {
      const memberData = memberItem.data || [];
      const firstName = memberData.find((d: any) => d.name === 'first_name')?.value || '';
      const lastName = memberData.find((d: any) => d.name === 'last_name')?.value || '';
      const memberId = memberData.find((d: any) => d.name === 'id')?.value;
      
      if (!memberId) return;
      
      // Try to find matching player in our system
      const matchedPlayer = ourPlayers.find((p: RosterPlayer) => 
        p.first_name.toLowerCase() === firstName.toLowerCase() && 
        p.last_name.toLowerCase() === lastName.toLowerCase()
      );
      
      if (matchedPlayer) {
        playerMapping.set(memberId, matchedPlayer.id);
      } else {
        unmatchedTeamSnapPlayers.push(`${firstName} ${lastName}`);
      }
    });
    
    // Process availability data
    let syncedCount = 0;
    const attendanceUpdates: Array<{player_id: number, is_attending: boolean, notes?: string}> = [];
    
    availabilities.forEach((availItem: any) => {
      const availData = availItem.data || [];
      const memberId = availData.find((d: any) => d.name === 'member_id')?.value;
      const statusCode = availData.find((d: any) => d.name === 'status_code')?.value;
      const notes = availData.find((d: any) => d.name === 'notes')?.value;
      
      if (!memberId || statusCode === undefined) return;
      
      const ourPlayerId = playerMapping.get(memberId);
      if (ourPlayerId) {
        // TeamSnap: 1 = Yes, 0 = No, null = No Response
        // Our system: true = attending, false = not attending
        const isAttending = statusCode === 1;
        
        attendanceUpdates.push({
          player_id: ourPlayerId,
          is_attending: isAttending,
          notes: notes || undefined
        });
        syncedCount++;
      }
    });
    
    // Bulk update attendance in our database
    if (attendanceUpdates.length > 0) {
      // Use a transaction to update all attendance records
      const client = await sql.connect();
      try {
        await client.query('BEGIN');
        
        for (const update of attendanceUpdates) {
          await client.query(
            `INSERT INTO attendance (player_id, event_id, is_attending, notes, response_date)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (player_id, event_id) 
             DO UPDATE SET 
                is_attending = EXCLUDED.is_attending, 
                notes = EXCLUDED.notes,
                response_date = CURRENT_TIMESTAMP`,
            [update.player_id, eventId, update.is_attending, update.notes]
          );
        }
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }
    
    return ApiResponse.success({
      message: 'Sync completed successfully',
      totalPlayers: ourPlayers.length,
      syncedPlayers: syncedCount,
      unmatchedPlayers: unmatchedTeamSnapPlayers.length > 0 ? unmatchedTeamSnapPlayers : undefined
    });
    
  } catch (error) {
    console.error('TeamSnap sync error:', error);
    
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'TeamSnap authentication expired. Please reconnect.' },
        { status: 401 }
      );
    }
    
    return ApiResponse.internalError('Failed to sync with TeamSnap');
  }
});
