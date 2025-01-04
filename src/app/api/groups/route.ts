import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { type FormPlayer, type PlayerDB, toDatabase } from '@/types/PlayerTypes';

interface CreateGroupRequest {
    groupCode: string;
    players: FormPlayer[];
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode, players } = await request.json() as CreateGroupRequest;
        console.log('Creating new group:', groupCode, 'with players:', players);

        if (!groupCode || !Array.isArray(players)) {
            return NextResponse.json(
                { error: 'Missing required fields or invalid data' },
                { status: 400 }
            );
        }

        await sql`BEGIN`;

        try {
            // First, delete any existing players in this group
            await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
            `;

            // Insert each player
            const insertedPlayers = await Promise.all(
                players.map(async (formPlayer) => {
                    // Add groupCode to formPlayer data
                    const playerWithGroup = {
                        ...formPlayer,
                        groupCode
                    };

                    // Convert to database format
                    const dbPlayer = toDatabase(playerWithGroup);

                    // Validate required fields
                    if (!dbPlayer.first_name || !dbPlayer.last_name) {
                        throw new Error('First name and last name are required for all players');
                    }

                    const { rows } = await sql<PlayerDB>`
                        INSERT INTO players (
                            first_name,
                            last_name,
                            skill,
                            is_defense,
                            is_attending,
                            group_code
                        ) VALUES (
                            ${dbPlayer.first_name},
                            ${dbPlayer.last_name},
                            ${dbPlayer.skill},
                            ${dbPlayer.is_defense},
                            ${dbPlayer.is_attending},
                            ${dbPlayer.group_code}
                        )
                        RETURNING *
                    `;
                    return rows[0];
                })
            );

            await sql`COMMIT`;
            console.log('Successfully created group with players:', insertedPlayers);
            return NextResponse.json({
                success: true,
                insertedCount: insertedPlayers.length
            });
        } catch (error) {
            await sql`ROLLBACK`;
            console.error('Error in transaction:', error);
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

export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode } = await request.json();
        console.log('Attempting to delete group:', groupCode);

        if (!groupCode || groupCode === 'default') {
            return NextResponse.json(
                { error: 'Invalid group code' },
                { status: 400 }
            );
        }

        await sql`BEGIN`;

        try {
            // Delete all players in the group
            const { rowCount: playersDeleted } = await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted players count:', playersDeleted);

            await sql`COMMIT`;
            return NextResponse.json({
                success: true,
                deleted: {
                    players: playersDeleted
                }
            });
        } catch (error) {
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