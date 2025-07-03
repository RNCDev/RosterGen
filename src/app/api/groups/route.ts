import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
    getGroupByCode, 
    createGroup,
    deleteGroup,
    renameGroup,
} from '@/lib/db';
import {
    ApiResponse,
    createApiHandler,
    QuerySchemas,
    withErrorHandler
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const createGroupSchema = z.object({
    code: z.string().trim().min(1, 'Group code is required and must be a non-empty string.')
});

const updateGroupSchema = z.object({
    groupId: z.number().int().positive(),
    newCode: z.string().trim().min(1)
});

const groupCodeQuerySchema = z.object({
    code: z.string().min(1, 'Group code is required')
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/groups?code=...
 * Retrieves a single group by its unique code.
 */
export const GET = createApiHandler({
    querySchema: groupCodeQuerySchema,
    allowedMethods: ['GET']
})(async ({ query }) => {
    const group = await getGroupByCode(query.code);
    
    if (!group) {
        return ApiResponse.notFound('Group not found');
    }
    
    return ApiResponse.success(group);
});

/**
 * POST /api/groups
 * Creates a new group.
 */
export const POST = createApiHandler({
    bodySchema: createGroupSchema,
    allowedMethods: ['POST']
})(async ({ body }) => {
    // Check if the group code is already in use
    const existingGroup = await getGroupByCode(body.code);
    if (existingGroup) {
        return ApiResponse.conflict('A group with this code already exists.');
    }

    const newGroup = await createGroup(body.code);
    return ApiResponse.created(newGroup);
});

/**
 * PUT /api/groups
 * Renames a group.
 */
export const PUT = createApiHandler({
    bodySchema: updateGroupSchema,
    allowedMethods: ['PUT']
})(async ({ body }) => {
    // Check if the new group code is already in use by another group
    const existingGroup = await getGroupByCode(body.newCode);
    if (existingGroup && existingGroup.id !== body.groupId) {
        return ApiResponse.conflict(`Group code "${body.newCode}" is already in use.`);
    }

    const updatedGroup = await renameGroup(body.groupId, body.newCode);
    return ApiResponse.success(updatedGroup);
});

/**
 * DELETE /api/groups?groupId=...
 * Deletes an entire group by its ID.
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const groupIdParam = searchParams.get('groupId');
    
    if (!groupIdParam) {
        return ApiResponse.badRequest('Group ID is required');
    }
    
    const groupId = parseInt(groupIdParam, 10);
    if (isNaN(groupId) || groupId <= 0) {
        return ApiResponse.badRequest('Group ID must be a positive integer');
    }
    
    const success = await deleteGroup(groupId);
    
    if (!success) {
        return ApiResponse.notFound('Group not found or could not be deleted');
    }

    return ApiResponse.noContent();
});