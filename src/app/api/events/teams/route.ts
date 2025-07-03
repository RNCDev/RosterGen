import { NextRequest } from 'next/server';
import { z } from 'zod';
import { updateEventSavedTeams, getEventById } from '@/lib/db';
import { type Teams } from '@/types/PlayerTypes';
import {
    ApiResponse,
    withErrorHandler,
    parseId
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const saveTeamsSchema = z.object({
    eventId: z.number().int().positive(),
    teams: z.record(z.object({
        forwards: z.array(z.any()),
        defensemen: z.array(z.any()),
        group_code: z.string().optional()
    }))
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * PUT /api/events/teams
 * Saves team assignments to an event.
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = saveTeamsSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid teams data', validation.error.flatten());
    }

    const { eventId, teams } = validation.data;

    // Verify the event exists
    const event = await getEventById(eventId);
    if (!event) {
        return ApiResponse.notFound('Event not found');
    }

    // Serialize teams data to JSON string
    const teamsJson = JSON.stringify(teams);

    // Update the event with saved teams data
    const updatedEvent = await updateEventSavedTeams(eventId, teamsJson);

    return ApiResponse.success({
        message: 'Teams saved successfully',
        event: updatedEvent
    });
});

/**
 * GET /api/events/teams?eventId=...
 * Loads saved team assignments from an event.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('eventId');

    if (!eventIdParam) {
        return ApiResponse.badRequest('eventId parameter is required');
    }

    const eventId = parseId(eventIdParam, 'Event ID');
    const event = await getEventById(eventId);
    
    if (!event) {
        return ApiResponse.notFound('Event not found');
    }

    if (!event.saved_teams_data) {
        return ApiResponse.notFound('No saved teams found for this event');
    }

    // Parse the JSON string back to Teams object
    try {
        const teams: Teams = JSON.parse(event.saved_teams_data);
        return ApiResponse.success({ teams });
    } catch (parseError) {
        console.error('Error parsing saved teams data:', parseError);
        return ApiResponse.internalError('Invalid saved teams data');
    }
}); 