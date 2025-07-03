import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
    getPlayersByGroup,
    createPlayer, 
    deletePlayer, 
    updatePlayer 
} from '@/lib/db';
import {
    ApiResponse,
    createApiHandler,
    withErrorHandler
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const playerSchema = z.object({
    id: z.number().optional(), // Optional for creation
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().min(1, 'Last name is required'),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    group_id: z.number().int().positive(),
});

const createPlayerSchema = playerSchema.omit({ id: true });
const updatePlayerSchema = playerSchema.required({ id: true });
const deletePlayerSchema = z.object({
    id: z.number().int().positive()
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/players?groupId=...
 * Fetches all active players for a given group ID.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const groupIdParam = searchParams.get('groupId');

    if (!groupIdParam) {
        return ApiResponse.badRequest('Group ID is required');
    }

    const groupId = parseInt(groupIdParam, 10);
    if (isNaN(groupId) || groupId <= 0) {
        return ApiResponse.badRequest('Group ID must be a positive integer');
    }

    const players = await getPlayersByGroup(groupId);
    return ApiResponse.success(players);
});

/**
 * POST /api/players
 * Creates a single player for a group.
 */
export const POST = createApiHandler({
    bodySchema: createPlayerSchema,
    allowedMethods: ['POST']
})(async ({ body }) => {
    const newPlayer = await createPlayer(body);
    return ApiResponse.created(newPlayer);
});

/**
 * PUT /api/players
 * Updates a single player.
 */
export const PUT = createApiHandler({
    bodySchema: updatePlayerSchema,
    allowedMethods: ['PUT']
})(async ({ body }) => {
    const playerData = { ...body, is_active: true };
    const updatedPlayer = await updatePlayer(playerData);
    return ApiResponse.success(updatedPlayer);
});

/**
 * DELETE /api/players
 * Soft deletes a single player by their ID.
 */
export const DELETE = createApiHandler({
    bodySchema: deletePlayerSchema,
    allowedMethods: ['DELETE']
})(async ({ body }) => {
    const success = await deletePlayer(body.id);
    
    if (!success) {
        return ApiResponse.notFound('Player not found or not deleted');
    }

    return ApiResponse.noContent();
});