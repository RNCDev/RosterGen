import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTeamSnapClient } from '@/lib/teamsnap-api';

interface TeamSnapMember {
  id: string;
  first_name: string;
  last_name: string;
}

interface TeamSnapAvailability {
  member_id: string;
  status: 'yes' | 'no' | 'maybe' | null;
  status_code: number;
}

interface AttendanceResult {
  playerName: string;
  isAttending: boolean;
}

/**
 * POST /api/teamsnap/sync-attendance
 * Fetches attendance data from TeamSnap for a specific event
 * This is an interim endpoint that returns data without updating the database
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('teamsnap_access_token');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with TeamSnap' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { teamId, eventId } = body;

    if (!teamId || !eventId) {
      return NextResponse.json(
        { error: 'Missing required parameters: teamId and eventId' },
        { status: 400 }
      );
    }

    const teamSnapClient = getTeamSnapClient();

    // Fetch team members
    const membersResponse = await teamSnapClient.getTeamMembers(
      teamId,
      accessToken.value
    );

    // Fetch event availability
    const availabilityResponse = await teamSnapClient.getEventAvailability(
      eventId,
      accessToken.value
    );

    // Extract members from the collection
    const members: TeamSnapMember[] = membersResponse.collection
      .filter((item: any) => item.type === 'member')
      .map((member: any) => ({
        id: member.id,
        first_name: member.data.first_name || '',
        last_name: member.data.last_name || ''
      }));

    // Extract availability data
    const availabilities: TeamSnapAvailability[] = availabilityResponse.collection
      .filter((item: any) => item.type === 'availability')
      .map((avail: any) => ({
        member_id: avail.data.member_id,
        status: avail.data.status,
        status_code: avail.data.status_code
      }));

    // Create a map for quick lookup
    const availabilityMap = new Map(
      availabilities.map(a => [a.member_id, a])
    );

    // Combine member and availability data
    const attendanceResults: AttendanceResult[] = members.map(member => {
      const availability = availabilityMap.get(member.id);
      const playerName = `${member.first_name} ${member.last_name}`.trim();
      
      // TeamSnap uses status_code: 1 for "yes", 0 for "no", null for no response
      const isAttending = availability?.status_code === 1;

      return {
        playerName,
        isAttending
      };
    });

    // Filter out members without names (likely non-player members)
    const validResults = attendanceResults.filter(r => r.playerName.length > 0);

    return NextResponse.json({
      success: true,
      attendance: validResults,
      summary: {
        total: validResults.length,
        attending: validResults.filter(r => r.isAttending).length,
        notAttending: validResults.filter(r => !r.isAttending).length
      }
    });

  } catch (error) {
    console.error('TeamSnap sync error:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'TeamSnap authentication expired. Please reconnect.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to sync attendance from TeamSnap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
