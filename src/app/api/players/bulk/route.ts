import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { bulkInsertPlayers } from '@/lib/db';
import { sql } from '@vercel/postgres';

const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean(),
});

const bulkPlayersSchema = z.object({
    groupId: z.number().int().positive(),
    players: z.array(playerSchema),
});

/**
 * POST /api/players/bulk
 * Creates multiple players in a group, typically from a CSV upload.
 * This will first delete all existing players in the group.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = bulkPlayersSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data for bulk player creation', details: validation.error.flatten() }, { status: 400 });
        }

        const { groupId, players } = validation.data;

        // Use a transaction to ensure atomicity
        const client = await sql.connect();
        try {
            await client.query('BEGIN');
            // First, delete all existing players for the group
            await client.query('DELETE FROM players WHERE group_id = $1', [groupId]);
            
            // Then, bulk insert the new players
            const newPlayers = await bulkInsertPlayers(groupId, players);
            
            await client.query('COMMIT');
            
            return NextResponse.json(newPlayers, { status: 201 });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error; // Let the outer catch handle the response
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Failed to bulk create players:', error);
        return NextResponse.json({ 
            error: 'Internal Server Error', 
            message: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
} 