import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
    getPlayersByGroup,
    createPlayer, 
    deletePlayer, 
    updatePlayer 
} from '@/lib/db';

// Zod schema for validating a single player
const playerSchema = z.object({
    id: z.number().optional(), // Optional for creation
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    group_id: z.number().int().positive(),
});

/**
 * GET /api/players?groupId=...
 * Fetches all active players for a given group ID.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
        return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    try {
        const players = await getPlayersByGroup(parseInt(groupId));
        return NextResponse.json(players);
    } catch (error) {
        console.error(`Failed to fetch players for group ${groupId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/players
 * Creates a single player for a group.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const singlePlayerCheck = playerSchema.safeParse(body);
        if (!singlePlayerCheck.success) {
            return NextResponse.json({ error: 'Invalid player data', details: singlePlayerCheck.error.flatten() }, { status: 400 });
        }

        const newPlayer = await createPlayer(singlePlayerCheck.data);
        return NextResponse.json(newPlayer, { status: 201 });

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
 * Soft deletes a single player by their ID.
 */
export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        const validation = z.object({ id: z.number().int().positive() }).safeParse({ id });

        if (!validation.success) {
            return NextResponse.json({ error: 'A valid player ID is required' }, { status: 400 });
        }

        const success = await deletePlayer(validation.data.id);
        
        if (!success) {
            return NextResponse.json({ error: 'Player not found or not deleted' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error('Failed to delete player:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}