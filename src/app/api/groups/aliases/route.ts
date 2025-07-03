import { NextRequest } from 'next/server';
import { z } from 'zod';
import { updateGroupTeamAliases } from '@/lib/db';
import {
    ApiResponse,
    withErrorHandler
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const updateAliasesSchema = z.object({
    groupId: z.number().int().positive(),
    teamAlias1: z.string().trim().min(1, 'Team alias 1 is required'),
    teamAlias2: z.string().trim().min(1, 'Team alias 2 is required')
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * PUT /api/groups/aliases
 * Updates team alias names for a group.
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = updateAliasesSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid alias data', validation.error.flatten());
    }

    const { groupId, teamAlias1, teamAlias2 } = validation.data;

    const updatedGroup = await updateGroupTeamAliases(groupId, teamAlias1, teamAlias2);

    if (!updatedGroup) {
        return ApiResponse.notFound('Group not found or update failed');
    }

    return ApiResponse.success(updatedGroup);
}); 