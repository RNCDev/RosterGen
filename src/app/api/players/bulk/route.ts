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
    email: z.string().email().or(z.literal('')).nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
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
        const body = await request.json();
        const validation = bulkPlayersSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data provided', issues: validation.error.issues }, { status: 400 });
        }

        const { groupId, players } = validation.data;

        await bulkSavePlayers(groupId, players, [], []);

        return NextResponse.json({ message: 'Players created successfully' }, { status: 201 });

    } catch (error) {
        console.error('Error in bulk insert:', error);
        return NextResponse.json({ error: 'Failed to create players' }, { status: 500 });
    }
}

const playerWithIdSchema = playerSchema.extend({
    id: z.number().int().positive(),
});

const bulkUpdateSchema = z.object({
    groupId: z.number().int().positive(),
    playersToCreate: z.array(playerSchema).optional(),
    playersToUpdate: z.array(playerWithIdSchema).optional(),
    playersToDelete: z.array(z.number().int().positive()).optional(),
});

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const validation = bulkUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data provided', issues: validation.error.issues }, { status: 400 });
        }

        const { groupId, playersToCreate = [], playersToUpdate = [], playersToDelete = [] } = validation.data;

        await bulkSavePlayers(groupId, playersToCreate, playersToUpdate, playersToDelete);

        return NextResponse.json({ message: 'Roster updated successfully' }, { status: 200 });

    } catch (error) {
        console.error('Error in bulk update:', error);
        return NextResponse.json({ error: 'Failed to update roster' }, { status: 500 });
    }
} 