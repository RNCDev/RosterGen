import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { PlayerInput } from '@/lib/db';

interface CreateGroupRequest {
    groupCode: string;
    players: PlayerInput[];
}

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

        await sql`BEGIN`;

        try {
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
                            ${player.firstName},
                            ${player.lastName},
                            ${player.skill},
                            ${player.defense},
                            ${player.attending},
                            ${groupCode}
                        )
                        RETURNING id
                    `;
                    return rows[0];
                })
            );

            await sql`COMMIT`;
            return NextResponse.json({
                success: true,
                insertedCount: insertedPlayers.length
            });
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
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
            // Delete players directly
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