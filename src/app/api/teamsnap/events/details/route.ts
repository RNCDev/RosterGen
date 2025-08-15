import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getTeamSnapClient } from '@/lib/teamsnap-api';

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

    if (!eventId) {
      return NextResponse.json(
        { error: 'Missing required parameter: eventId' },
        { status: 400 }
      );
    }

    const teamSnapClient = getTeamSnapClient();

    // Fetch event details
    const eventResponse = await teamSnapClient.makeApiRequest(
      `/events/${eventId}`,
      accessToken.value
    );

    // Fetch event availability
    const availabilityResponse = await teamSnapClient.getEventAvailability(
      eventId,
      accessToken.value
    );

    // Extract event data
    const eventItem = eventResponse.collection[0];
    const eventData = eventItem.data;

    // Extract availability data
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

    const players = memberResponses.map((res: { collection: Array<{ data: { first_name?: string; last_name?: string } }> }, index: number) => {
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

    // Build event details object
    const eventDetails: TeamSnapEventDetails = {
      id: eventId,
      name: eventData.name || 'Unnamed Event',
      description: eventData.description,
      start_date: eventData.start_date,
      end_date: eventData.end_date,
      location: eventData.location_name,
      location_details: eventData.location_details,
      address: eventData.address,
      notes: eventData.notes,
      link: eventData.link,
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

    return NextResponse.json(
      { 
        error: 'Failed to fetch event details from TeamSnap',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
