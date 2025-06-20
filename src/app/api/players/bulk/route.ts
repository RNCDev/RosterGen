import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean(),
});

const bulkPlayersSchema = z.object({
    groupCode: z.string().trim().min(1),
    players: z.array(playerSchema),
});

/**
 * POST /api/players/bulk
 * Creates multiple players in a group from a CSV upload.
 * This will replace all existing players in the group.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = bulkPlayersSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data for bulk player creation', details: validation.error.flatten() }, { status: 400 });
        }

        const { groupCode, players } = validation.data;

        // Start a transaction
        const client = await sql.connect();
        await client.query('BEGIN');

        try {
            // Delete existing players for the group
            await client.query('DELETE FROM players WHERE group_code = $1', [groupCode]);

            // Insert new players
            for (const player of players) {
                await client.query(
                    'INSERT INTO players (first_name, last_name, skill, is_defense, is_attending, group_code) VALUES ($1, $2, $3, $4, $5, $6)',
                    [player.first_name, player.last_name, player.skill, player.is_defense, player.is_attending, groupCode]
                );
            }

            await client.query('COMMIT');
            client.release();

            // Fetch and return the newly created players
            const { rows } = await sql`SELECT * FROM players WHERE group_code = ${groupCode}`;
            return NextResponse.json(rows, { status: 201 });

        } catch (error) {
            await client.query('ROLLBACK');
            client.release();
            throw error; // Re-throw to be caught by outer catch block
        }
    } catch (error) {
        console.error('Failed to bulk create players:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ 
                error: 'Invalid data for bulk update', 
                details: error.flatten(),
                received: error.message 
            }, { status: 400 });
        }
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        }, { status: 500 });
    }
} 