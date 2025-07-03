//teams route
import { NextRequest } from 'next/server';
import { z } from 'zod';
import type { PlayerDB, Team, Teams, Group } from '@/types/PlayerTypes';
import { generateTeams } from '@/lib/teamGenerator';
import { getAttendingPlayersForEvent, getGroupByCode } from '@/lib/db';
import {
    ApiResponse,
    withErrorHandler
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const teamGenerationSchema = z.object({
    event_id: z.number().int().positive(),
    group: z.any() // Accept any group object - will validate existence of required fields manually
});

const teamAssignmentSchema = z.object({
    redTeam: z.object({
        forwards: z.array(z.any()),
        defensemen: z.array(z.any())
    }),
    whiteTeam: z.object({
        forwards: z.array(z.any()),
        defensemen: z.array(z.any())
    }),
    groupCode: z.string().min(1)
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/teams?action=generate
 * Generates balanced teams based on event attendance
 * 
 * POST /api/teams
 * Validates team assignments (legacy functionality)
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'generate') {
        return await handleTeamGeneration(request);
    } else {
        return await handleTeamAssignmentValidation(request);
    }
});

// =============================================================================
// HANDLER FUNCTIONS
// =============================================================================

async function handleTeamGeneration(request: NextRequest) {
    const body = await request.json();
    const validation = teamGenerationSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid team generation data', validation.error.flatten());
    }

    const { event_id, group } = validation.data;

    // Validate that group has required properties
    if (!group?.code || !event_id) {
        return ApiResponse.badRequest('group_code and event_id are required');
    }

    // Ensure group has team aliases (with defaults)
    const groupForGeneration = {
        ...group,
        'team-alias-1': group['team-alias-1'] || 'Red',
        'team-alias-2': group['team-alias-2'] || 'White'
    };

    // Get players attending the specified event
    const attendingPlayers = await getAttendingPlayersForEvent(event_id);

    if (attendingPlayers.length < 2) {
        return ApiResponse.badRequest('You need at least two attending players to generate teams.');
    }

    // Generate teams using the group data
    const teams = generateTeams(attendingPlayers, groupForGeneration);
    
    return ApiResponse.success({
        teams: teams,
        event_id: event_id,
        generated_at: new Date(),
        player_count: attendingPlayers.length
    });
}

async function handleTeamAssignmentValidation(request: NextRequest) {
    const body = await request.json();
    const validation = teamAssignmentSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid team assignment data', validation.error.flatten());
    }

    const { redTeam, whiteTeam, groupCode } = validation.data;

    // Get the group to validate against
    const group = await getGroupByCode(groupCode);
    if (!group) {
        return ApiResponse.notFound('Group not found');
    }

    // Validate that all players belong to the same group
    const allPlayers = [
        ...redTeam.forwards,
        ...redTeam.defensemen,
        ...whiteTeam.forwards,
        ...whiteTeam.defensemen
    ];

    const invalidGroupPlayers = allPlayers.filter(player => player.group_id !== group.id);
    if (invalidGroupPlayers.length > 0) {
        return ApiResponse.badRequest('Some players do not belong to the specified group');
    }

    return ApiResponse.success({ 
        success: true,
        message: 'Team assignment is valid'
    });
}