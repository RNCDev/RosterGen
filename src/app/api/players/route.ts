import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

// Zod schema for validating a single player
const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean(),
    group_code: z.string().trim().min(1),
});

// Zod schema for updating a single player (includes ID)
const playerUpdateSchema = playerSchema.extend({
    id: z.number().int(),
});

/**
 * POST /api/players
 * Creates a new single player in a group.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = playerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid player data', details: validation.error.flatten() }, { status: 400 });
        }
        
        const { first_name, last_name, skill, is_defense, is_attending, group_code } = validation.data;

        const { rows } = await sql`
            INSERT INTO players (first_name, last_name, skill, is_defense, is_attending, group_code)
            VALUES (${first_name}, ${last_name}, ${skill}, ${is_defense}, ${is_attending}, ${group_code})
            RETURNING *;
        `;
        
        return NextResponse.json(rows[0], { status: 201 });
    } catch (error) {
        console.error('Failed to create player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/players
 * Handles bulk updates of players for a given group code.
 * This is used for the "Save All" and "Bulk Edit" features.
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { groupCode, players } = z.object({
            groupCode: z.string().trim().min(1),
            players: z.array(playerUpdateSchema)
        }).parse(body);

        const updatedPlayers = await sql.begin(async (tx: any) => {
            const results = [];
            for (const player of players) {
                const { rows } = await tx`
                    UPDATE players
                    SET 
                        first_name = ${player.first_name},
                        last_name = ${player.last_name},
                        skill = ${player.skill},
                        is_defense = ${player.is_defense},
                        is_attending = ${player.is_attending}
                    WHERE id = ${player.id} AND group_code = ${groupCode}
                    RETURNING *;
                `;
                results.push(rows[0]);
            }
            return results;
        });

        return NextResponse.json(updatedPlayers);
    } catch (error) {
        console.error('Failed to bulk update players:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data for bulk update', details: error.flatten() }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/players
 * Deletes a single player by their ID.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        const validation = z.number().int().positive().safeParse(id);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid player ID' }, { status: 400 });
        }

        const { rowCount } = await sql`
            DELETE FROM players WHERE id = ${validation.data};
        `;
        
        if (rowCount === 0) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error('Failed to delete player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}