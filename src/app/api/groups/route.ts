import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

// Zod schema for a player received from the client
// Does not include server-generated fields like `id`
const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean(),
});

/**
 * GET /api/groups?groupCode=...
 * Retrieves all players for a given group code.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('groupCode');

    if (!groupCode) {
        return NextResponse.json({ error: 'Group code is required' }, { status: 400 });
    }

    try {
        const { rows } = await sql`
            SELECT * FROM players 
            WHERE group_code = ${groupCode}
            ORDER BY last_name, first_name;
        `;
        return NextResponse.json(rows);
    } catch (error) {
        console.error(`Failed to fetch group ${groupCode}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


/**
 * POST /api/groups
 * Creates or completely overwrites a group with a new list of players.
 * This is the primary "Save" operation for a group.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = z.object({
            groupCode: z.string().trim().min(1, 'Group code cannot be empty.'),
            players: z.array(playerSchema),
        }).safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.flatten() }, { status: 400 });
        }
        
        const { groupCode, players } = validation.data;

        const newPlayers = await sql.begin(async (tx: any) => {
            // 1. Delete all existing players for this group
            await tx`DELETE FROM players WHERE group_code = ${groupCode};`;

            // 2. Insert all the new players
            if (players.length === 0) {
                return []; // Return empty array if no players to insert
            }
            
            // Build a single, dynamic INSERT statement for all players
            const values = players.flatMap(p => [p.first_name, p.last_name, p.skill, p.is_defense, p.is_attending, groupCode]);
            const placeholders = players.map((_, i) => 
                `($${i * 6 + 1}, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6})`
            ).join(', ');

            const query = `
                INSERT INTO players (first_name, last_name, skill, is_defense, is_attending, group_code)
                VALUES ${placeholders}
                RETURNING *;
            `;

            const { rows } = await tx.query(query, values);
            return rows;
        });

        return NextResponse.json(newPlayers, { status: 201 });

    } catch (error) {
        console.error('Failed to save group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}