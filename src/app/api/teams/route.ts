//teams route
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PlayerDB, Team, Teams } from '@/types/PlayerTypes';
import { generateTeams } from '@/lib/teamGenerator';
import { getAttendingPlayersForEvent, getPlayers } from '@/lib/db';

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
            // Generate teams based on event attendance or group attendance
            const { event_id, group_code }: TeamGenerationRequest = await request.json();

            if (!group_code) {
                return NextResponse.json(
                    { error: 'group_code is required' },
                    { status: 400 }
                );
            }

            let attendingPlayers: PlayerDB[];

            if (event_id) {
                // Get players attending a specific event
                attendingPlayers = await getAttendingPlayersForEvent(event_id);
            } else {
                // Get all players with legacy is_attending = true
                const allPlayers = await getPlayers(group_code);
                attendingPlayers = allPlayers.filter(player => player.is_attending);
            }

            if (attendingPlayers.length < 2) {
                return NextResponse.json(
                    { error: 'You need at least two attending players to generate teams.' },
                    { status: 400 }
                );
            }

            const teams = generateTeams(attendingPlayers, group_code, !!event_id);
            
            // Add event metadata if provided
            const teamsWithMetadata: Teams = {
                ...teams,
                event_id: event_id,
                generated_at: new Date()
            };

            return NextResponse.json({ 
                teams: teamsWithMetadata, 
                event_id,
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

            const invalidGroupPlayers = allPlayers.filter(player => player.group_code !== data.groupCode);
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