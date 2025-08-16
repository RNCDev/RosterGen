import { NextRequest } from 'next/server';
import { z } from 'zod';
import { updateEventSavedTeams, getEventById } from '@/lib/db';
import { sql } from '@vercel/postgres';
import { type Teams, type EventDB } from '@/types/PlayerTypes';
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
    teams: z.record(z.string(), z.object({
        forwards: z.array(z.any()),
        defensemen: z.array(z.any()),
        group_code: z.string().optional()
    })),
    teamNames: z.object({
        team1: z.string(),
        team2: z.string()
    })
});

const deleteTeamsSchema = z.object({
    eventId: z.number().int().positive(),
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

    const { eventId, teams, teamNames } = validation.data;

    // Verify the event exists
    const event = await getEventById(eventId);
    if (!event) {
        return ApiResponse.notFound('Event not found');
    }

    // Serialize teams data to JSON string
    const dataToStore = { teams, teamNames };
    const teamsJson = JSON.stringify(dataToStore);

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
        const savedData = JSON.parse(event.saved_teams_data);
        // For backwards compatibility with old format
        if (savedData.teams && savedData.teamNames) {
            return ApiResponse.success({ teams: savedData.teams, teamNames: savedData.teamNames });
        }
        return ApiResponse.success({ teams: savedData, teamNames: null });
    } catch (parseError) {
        console.error('Error parsing saved teams data:', parseError);
        return ApiResponse.internalError('Invalid saved teams data');
    }
});

/**
 * DELETE /api/events/teams
 * Clears saved team assignments for an event.
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = deleteTeamsSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid event ID', validation.error.flatten());
    }

    const { eventId } = validation.data;

    console.log(`Attempting to delete saved teams for event ID: ${eventId}`);

    // Directly update the database to clear saved_teams_data
    const { rows } = await sql<EventDB>`
        UPDATE events
        SET saved_teams_data = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${eventId}
        RETURNING *;
    `;

    const updatedEvent = rows[0];

    if (!updatedEvent) {
        console.error(`Failed to clear saved teams for event ID: ${eventId}. Event not found or update failed.`);
        return ApiResponse.notFound('Event not found or teams data not cleared');
    }

    console.log(`Successfully cleared saved teams for event ID: ${eventId}`);
    return ApiResponse.success({ message: 'Saved teams data cleared successfully' });
}); 