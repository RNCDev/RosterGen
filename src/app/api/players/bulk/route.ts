import { NextRequest } from 'next/server';
import { z } from 'zod';
import { bulkInsertPlayers } from '@/lib/db';
import { type PlayerInput } from '@/types/PlayerTypes';
import {
    ApiResponse,
    withErrorHandler
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const playerSchema = z.object({
    first_name: z.string().trim().min(1, 'First name is required'),
    last_name: z.string().trim().min(1, 'Last name is required'),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    email: z.string().email().or(z.literal('')).nullable().optional(),
    phone: z.string().max(20).nullable().optional(),
});

const bulkPlayersSchema = z.object({
    groupId: z.number().int().positive(),
    players: z.array(playerSchema),
});

const playerWithIdSchema = playerSchema.extend({
    id: z.number().int().positive(),
    group_id: z.number().int().positive(),
    is_active: z.boolean(),
});

const bulkUpdateSchema = z.object({
    groupId: z.number().int().positive(),
    playersToCreate: z.array(playerSchema).optional().default([]),
    playersToUpdate: z.array(playerWithIdSchema).optional().default([]),
    playersToDelete: z.array(z.number().int().positive()).optional().default([]),
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/players/bulk
 * Creates multiple players in a group, typically from a CSV upload.
 * This will first delete all existing players in the group.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = bulkPlayersSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid players data', validation.error.flatten());
    }

    const { groupId, players } = validation.data;

    await bulkInsertPlayers(groupId, players, [], []);

    return ApiResponse.created({ 
        message: 'Players created successfully',
        count: players.length
    });
});

/**
 * PUT /api/players/bulk
 * Updates multiple players with bulk create/update/delete operations.
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = bulkUpdateSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid bulk update data', validation.error.flatten());
    }

    const { groupId, playersToCreate, playersToUpdate, playersToDelete } = validation.data;

    await bulkInsertPlayers(groupId, playersToCreate, playersToUpdate, playersToDelete);

    return ApiResponse.success({ 
        message: 'Roster updated successfully',
        operations: {
            created: playersToCreate.length,
            updated: playersToUpdate.length,
            deleted: playersToDelete.length
        }
    });
}); 