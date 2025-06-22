import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { bulkUpdatePlayers, createPlayer, deletePlayer, updatePlayer } from '@/lib/db';

// Zod schema for validating a single player
const playerSchema = z.object({
    id: z.number().optional(), // Optional for creation
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean().default(true),
    group_code: z.string().trim().min(1),
});

const bulkUpdatePayloadSchema = z.object({
    groupCode: z.string().trim().min(1),
    playersToCreate: z.array(playerSchema.omit({ id: true })).optional(),
    playersToUpdate: z.array(playerSchema.required({ id: true })).optional(),
    playersToDelete: z.array(z.number().int()).optional(),
});

/**
 * POST /api/players
 * Handles bulk updates and single player creation.
 * If the payload matches the bulk update schema, it performs a bulk update.
 * Otherwise, it attempts to create a single player.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Check if this is a bulk update request
        const bulkUpdateCheck = bulkUpdatePayloadSchema.safeParse(body);
        if (bulkUpdateCheck.success) {
            const { groupCode, playersToCreate = [], playersToUpdate = [], playersToDelete = [] } = bulkUpdateCheck.data;
            
            const fullPlayersToUpdate = playersToUpdate.map(p => ({ ...p, is_active: true }));

            await bulkUpdatePlayers(groupCode, playersToCreate, fullPlayersToUpdate, playersToDelete);

            return NextResponse.json({ message: 'Bulk update successful' }, { status: 200 });
        }
        
        // Fallback to single player creation
        const singlePlayerCheck = playerSchema.safeParse(body);
        if (singlePlayerCheck.success) {
            const newPlayer = await createPlayer(singlePlayerCheck.data);
            return NextResponse.json(newPlayer, { status: 201 });
        }

        // If neither schema matches, return an error
        return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });

    } catch (error) {
        console.error('Error in POST /api/players:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.flatten() }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/players
 * Updates a single player.
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = playerSchema.required({ id: true }).safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid player data', details: validation.error.flatten() }, { status: 400 });
        }
        
        const playerData = { ...validation.data, is_active: true };
        const updatedPlayer = await updatePlayer(playerData);
        return NextResponse.json(updatedPlayer);
        
    } catch (error) {
        console.error('Failed to update player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * DELETE /api/players
 * Deletes a single player by their ID.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { id, groupCode } = await request.json();
        const validation = z.object({
            id: z.number().int().positive(),
            groupCode: z.string().trim().min(1)
        }).safeParse({ id, groupCode });

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid player ID or group code' }, { status: 400 });
        }

        const success = await deletePlayer(validation.data.id, validation.data.groupCode);
        
        if (!success) {
            return NextResponse.json({ error: 'Player not found or not deleted' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error('Failed to delete player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}