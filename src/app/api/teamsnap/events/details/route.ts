import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTeamSnapClient } from '@/lib/teamsnap-api';
import { sql } from '@vercel/postgres';

interface TeamSnapEventDetails {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  location_details?: string;
  address?: string;
  notes?: string;
  link?: string;
  players: Array<{
    id: string;
    name: string;
    availability: 'yes' | 'no' | 'maybe' | null;
    availability_code: number;
  }>;
}

/**
 * GET /api/teamsnap/events/details
 * Fetches detailed event information from TeamSnap for a specific event
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('teamsnap_access_token');
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated with TeamSnap' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const groupId = searchParams.get('groupId'); // Add groupId parameter

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing required parameter: eventId' },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        { error: 'Missing required parameter: groupId' },
        { status: 400 }
      );
    }

    const teamSnapClient = getTeamSnapClient();

    // Get the TeamSnap team ID from the group
    let teamSnapTeamId: string | null = null;
    try {
      const groupResult = await sql`
        SELECT teamsnap_team_id 
        FROM groups 
        WHERE id = ${parseInt(groupId)}
      `;
      
      if (groupResult.rows.length > 0) {
        teamSnapTeamId = groupResult.rows[0].teamsnap_team_id;
        console.log(`Found TeamSnap team ID: ${teamSnapTeamId} for group: ${groupId}`);
      } else {
        console.warn(`No group found with ID: ${groupId}`);
      }
    } catch (dbError) {
      console.warn('Failed to fetch group from database:', dbError);
    }

    // Fetch event details
    console.log(`Fetching event details for event ID: ${eventId}`);
    const eventResponse = await teamSnapClient.makeApiRequest(
      `/events/${eventId}`,
      accessToken.value
    );
    console.log('Event details response:', JSON.stringify(eventResponse, null, 2));

    // Extract event data - handle the correct TeamSnap API structure
    if (!eventResponse.collection || !eventResponse.collection.items || eventResponse.collection.items.length === 0) {
      return NextResponse.json(
        { error: 'No event data found in TeamSnap response' },
        { status: 404 }
      );
    }

    const eventItem = eventResponse.collection.items[0];
    const eventData = eventItem.data;
    
    if (!eventData) {
      return NextResponse.json(
        { error: 'Event data structure is invalid' },
        { status: 500 }
      );
    }

    console.log('Extracted event data:', JSON.stringify(eventData, null, 2));
    
    // Also log the team ID from the event data for comparison
    if (eventData && eventData.team_id) {
      console.log(`Event data contains team_id: ${eventData.team_id}`);
    }

    // Try to fetch event availability, but don't fail if it doesn't work
    let players: Array<{
      id: string;
      name: string;
      availability: 'yes' | 'no' | 'maybe' | null;
      availability_code: number;
    }> = [];
    
    try {
      console.log(`Fetching availability for event ID: ${eventId}`);
      const availabilityResponse = await teamSnapClient.getEventAvailability(
        eventId,
        accessToken.value
      );
      console.log('Availability response:', JSON.stringify(availabilityResponse, null, 2));

      // Check if this is actually an event response with availability data
      if (availabilityResponse.collection && availabilityResponse.collection.length > 0) {
        const availabilities = availabilityResponse.collection
          .filter((item: { type: string }) => item.type === 'availability')
          .map((avail: { data: { member_id: string; status: string; status_code: number } }) => ({
            member_id: avail.data.member_id,
            status: avail.data.status,
            status_code: avail.data.status_code
          }));

        // Fetch member details for each availability entry
        const memberPromises = availabilities.map((avail: { member_id: string }) =>
          teamSnapClient.getMemberDetails(avail.member_id, accessToken.value)
        );
        const memberResponses = await Promise.all(memberPromises);

        players = memberResponses.map((res: { collection: Array<{ data: { first_name?: string; last_name?: string } }> }, index: number) => {
          const memberItem = res.collection[0];
          const memberData = memberItem.data;
          const memberId = availabilities[index].member_id;
          const availability = availabilities[index];

          return {
            id: memberId,
            name: `${memberData.first_name || ''} ${memberData.last_name || ''}`.trim(),
            availability: availability.status,
            availability_code: availability.status_code
          };
        }).filter(player => player.name.length > 0);
      } else {
        console.log('No availability data found in response, trying to get team members instead...');
        
                 // Try to get team members if availability data isn't available
         try {
           const teamId = teamSnapTeamId || eventData.team_id;
           if (!teamId) {
             console.warn('No TeamSnap team ID available, skipping team members fetch');
             return;
           }
           const teamMembersResponse = await teamSnapClient.getTeamMembersDirect(teamId, accessToken.value);
          console.log('Team members response:', JSON.stringify(teamMembersResponse, null, 2));
          
          if (teamMembersResponse.collection && teamMembersResponse.collection.length > 0) {
            players = teamMembersResponse.collection
              .filter((item: { type: string }) => item.type === 'member')
              .map((member: { data: { first_name?: string; last_name?: string; id: string } }) => ({
                id: member.data.id,
                name: `${member.data.first_name || ''} ${member.data.last_name || ''}`.trim(),
                availability: null, // No availability data available
                availability_code: 0
              }))
              .filter((player: { name: string }) => player.name.length > 0);
          }
        } catch (teamMembersError) {
          console.warn('Failed to fetch team members:', teamMembersError);
        }
      }
      
    } catch (availabilityError) {
      console.warn('Failed to fetch availability data, trying team members instead:', availabilityError);
      
             // Try to get team members as a fallback
       try {
         const teamId = teamSnapTeamId || eventData.team_id;
         if (!teamId) {
           console.warn('No TeamSnap team ID available, skipping team members fetch');
           return;
         }
         const teamMembersResponse = await teamSnapClient.getTeamMembersDirect(teamId, accessToken.value);
        console.log('Team members fallback response:', JSON.stringify(teamMembersResponse, null, 2));
        
        if (teamMembersResponse.collection && teamMembersResponse.collection.length > 0) {
          players = teamMembersResponse.collection
            .filter((item: { type: string }) => item.type === 'member')
            .map((member: { data: { first_name?: string; last_name?: string; id: string } }) => ({
              id: member.data.id,
              name: `${member.data.first_name || ''} ${member.data.last_name || ''}`.trim(),
              availability: null, // No availability data available
              availability_code: 0
            }))
                          .filter((player: { name: string }) => player.name.length > 0);
        }
      } catch (teamMembersError) {
        console.warn('Failed to fetch team members as fallback:', teamMembersError);
        // Continue without player data - the event details will still be shown
      }
    }

    // Build event details object - map from TeamSnap API structure
    const eventDetails: TeamSnapEventDetails = {
      id: eventId,
      name: eventData.name || 'Unnamed Event',
      description: eventData.notes || null,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: eventData.location_name,
      location_details: eventData.additional_location_details,
      address: undefined, // TeamSnap doesn't provide address in this endpoint
      notes: eventData.notes,
      link: undefined, // TeamSnap doesn't provide external links in this endpoint
      players
    };

    return NextResponse.json({
      success: true,
      event: eventDetails
    });

  } catch (error) {
    console.error('TeamSnap event details error:', error);
    
    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      return NextResponse.json(
        { error: 'TeamSnap authentication expired. Please reconnect.' },
        { status: 401 }
      );
    }

    // Check if it's a "NOT FOUND" error
    if (error instanceof Error && error.message.includes('NOT FOUND')) {
      return NextResponse.json(
        { 
          error: 'Event not found in TeamSnap',
          details: 'The event ID may be incorrect or the event may have been deleted from TeamSnap.',
          suggestion: 'Please verify the TeamSnap Event ID is correct and the event still exists.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch event details from TeamSnap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
