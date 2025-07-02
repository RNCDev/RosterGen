//teams route
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PlayerDB, Team, Teams } from '@/types/PlayerTypes';
import { generateTeams } from '@/lib/teamGenerator';
import { getAttendingPlayersForEvent, getGroupByCode } from '@/lib/db';
import type { Group } from '@/types/PlayerTypes';

interface TeamData {
    forwards: PlayerDB[];
    defensemen: PlayerDB[];
}

interface TeamAssignmentRequest {
    redTeam: TeamData;
    whiteTeam: TeamData;
    groupCode: string;
}

interface TeamGenerationRequest {
    event_id?: number;
    group_code: string;
}

export async function POST(
    request: NextRequest
) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'generate') {
            // Generate teams based on event attendance
            const { event_id, group }: { event_id: number; group: Group } = await request.json();

            if (!group?.code || !event_id) {
                return NextResponse.json(
                    { error: 'group_code and event_id are required' },
                    { status: 400 }
                );
            }

            // Get players attending the specified event
            const attendingPlayers = await getAttendingPlayersForEvent(event_id);

            if (attendingPlayers.length < 2) {
                return NextResponse.json(
                    { error: 'You need at least two attending players to generate teams.' },
                    { status: 400 }
                );
            }

            const teams = generateTeams(attendingPlayers, group);
            
            // Add event metadata if provided
            // The teams object no longer directly contains event_id or generated_at
            // These are now returned as separate properties in the API response.
            return NextResponse.json({
                teams: teams, 
                event_id: event_id,
                generated_at: new Date(),
                player_count: attendingPlayers.length
            });

        } else {
            // Legacy team assignment validation
            const data: TeamAssignmentRequest = await request.json();

            // Validate that all players belong to the same group
            const allPlayers = [
                ...data.redTeam.forwards,
                ...data.redTeam.defensemen,
                ...data.whiteTeam.forwards,
                ...data.whiteTeam.defensemen
            ];

            const group = await getGroupByCode(data.groupCode);
            if (!group) {
                return NextResponse.json(
                    { error: 'Group not found' },
                    { status: 404 }
                );
            }

            const invalidGroupPlayers = allPlayers.filter(player => player.group_id !== group.id);
            if (invalidGroupPlayers.length > 0) {
                return NextResponse.json(
                    { error: 'Some players do not belong to the specified group' },
                    { status: 400 }
                );
            }

            return NextResponse.json({ success: true });
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Error in teams API:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}