import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { bulkSavePlayers } from '../../../../../lib/db';
import { sql } from '@vercel/postgres';
import { PlayerInput } from '@/types/PlayerTypes';

const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
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
export async function POST(request: Request) {
    try {
        const { groupId, players } = await request.json();

        if (!groupId || !Array.isArray(players)) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await bulkSavePlayers(groupId, players, [], []);

        return NextResponse.json({ message: 'Players created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Error in bulk insert:', error);
        return NextResponse.json({ error: 'Failed to create players' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { groupId, playersToCreate, playersToUpdate, playersToDelete } = await request.json();

        if (!groupId) {
            return NextResponse.json({ error: 'Missing groupId' }, { status: 400 });
        }

        await bulkSavePlayers(groupId, playersToCreate, playersToUpdate, playersToDelete);

        return NextResponse.json({ message: 'Roster updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error in bulk update:', error);
        return NextResponse.json({ error: 'Failed to update roster' }, { status: 500 });
    }
} 