// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

// Define interface for incoming player data
interface PlayerInput {
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
    group_code?: string;
}

interface CreateGroupRequest {
    groupCode: string;
    players: PlayerInput[];
}

// POST - Create a new group with copied players
export async function POST(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode, players } = await request.json() as CreateGroupRequest;
        console.log('Creating new group:', groupCode, 'with players:', players.length);

        if (!groupCode || !players) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            // Insert all players with the new group code
            const insertedPlayers = await Promise.all(
                players.map(async (player: PlayerInput) => {
                    const { rows } = await sql`
                        INSERT INTO players (
                            first_name,
                            last_name,
                            skill,
                            is_defense,
                            is_attending,
                            group_code
                        ) VALUES (
                            ${player.first_name},
                            ${player.last_name},
                            ${player.skill},
                            ${player.is_defense},
                            ${player.is_attending},
                            ${groupCode}
                        )
                        RETURNING id
                    `;
                    return rows[0];
                })
            );

            await sql`COMMIT`;
            console.log('Successfully created new group with players');
            return NextResponse.json({
                success: true,
                insertedCount: insertedPlayers.length
            });
        } catch (error) {
            console.error('Error during group creation, rolling back:', error);
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create group' },
            { status: 500 }
        );
    }
}

// DELETE - Delete group and all associated data
export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode } = await request.json();
        console.log('Attempting to delete group:', groupCode);

        if (!groupCode || groupCode === 'default') {
            console.log('Invalid group code detected:', groupCode);
            return NextResponse.json(
                { error: 'Invalid group code' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            // First, get all team IDs for this group
            const { rows: teams } = await sql<{ id: number }>`
                SELECT id FROM teams WHERE group_code = ${groupCode}
            `;
            console.log('Found teams:', teams);

            // Delete player_team_assignments first (due to foreign key)
            if (teams.length > 0) {
                const teamIds = teams.map((team: { id: number }) => team.id);
                const { rowCount: assignmentsDeleted } = await sql`
                    DELETE FROM player_team_assignments
                    WHERE team_id = ANY(${teamIds}::int[])
                `;
                console.log('Deleted assignments count:', assignmentsDeleted);
            }

            // Delete teams
            const { rowCount: teamsDeleted } = await sql`
                DELETE FROM teams 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted teams count:', teamsDeleted);

            // Delete players
            const { rowCount: playersDeleted } = await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted players count:', playersDeleted);

            await sql`COMMIT`;
            console.log('Successfully deleted group and all associated data');
            return NextResponse.json({
                success: true,
                deleted: {
                    assignments: teamsDeleted > 0,
                    teams: teamsDeleted,
                    players: playersDeleted
                }
            });
        } catch (error) {
            console.error('Error during deletion, rolling back:', error);
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete group' },
            { status: 500 }
        );
    }
}