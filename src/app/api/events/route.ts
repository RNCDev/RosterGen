import { NextRequest } from 'next/server';
import { z } from 'zod';
import { 
    createEvent, 
    getEventsByGroup, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    duplicateEvent
} from '@/lib/db';
import { type EventInput } from '@/types/PlayerTypes';
import {
    ApiResponse,
    withErrorHandler,
    parseId
} from '@/lib/api-utils';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const duplicateEventSchema = z.object({
    eventId: z.number().int().positive(),
    newName: z.string().trim().min(1),
    newDate: z.string().min(1),
    newTime: z.string().optional(),
    newLocation: z.string().optional(),
});

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/events?groupId=... OR ?eventId=...
 * Fetches events by group ID or a single event by event ID.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const groupIdParam = searchParams.get('groupId');
    const eventIdParam = searchParams.get('eventId');

    if (!groupIdParam && !eventIdParam) {
        return ApiResponse.badRequest('Either groupId or eventId parameter is required');
    }

    if (eventIdParam) {
        const eventId = parseId(eventIdParam, 'Event ID');
        const event = await getEventById(eventId);
        
        if (!event) {
            return ApiResponse.notFound('Event not found');
        }
        
        return ApiResponse.success(event);
    }
    
    if (groupIdParam) {
        const groupId = parseId(groupIdParam, 'Group ID');
        const events = await getEventsByGroup(groupId);
        return ApiResponse.success(events);
    }
    
    return ApiResponse.badRequest('Either groupId or eventId parameter is required');
});

/**
 * POST /api/events
 * Creates a new event.
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.event_date || !body.group_id) {
        return ApiResponse.badRequest('Name, event_date, and group_id are required');
    }
    
    // Create properly typed event data
    const eventData: EventInput = {
        name: body.name.trim(),
        description: body.description || undefined,
        event_date: typeof body.event_date === 'string' ? new Date(body.event_date) : body.event_date,
        event_time: body.event_time || undefined,
        location: body.location || undefined,
        group_id: parseInt(body.group_id),
        is_active: body.is_active !== undefined ? body.is_active : true
    };
    
    const newEvent = await createEvent(eventData);
    return ApiResponse.created(newEvent);
});

/**
 * PUT /api/events?eventId=...
 * Updates an existing event.
 */
export const PUT = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('eventId');
    
    if (!eventIdParam) {
        return ApiResponse.badRequest('eventId parameter is required');
    }
    
    const eventId = parseId(eventIdParam, 'Event ID');
    const body = await request.json();
    
    // Create properly typed update data
    const updateData: Partial<EventInput> = {};
    
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description;
    if (body.event_date !== undefined) {
        updateData.event_date = typeof body.event_date === 'string' ? new Date(body.event_date) : body.event_date;
    }
    if (body.event_time !== undefined) updateData.event_time = body.event_time;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    
    const updatedEvent = await updateEvent(eventId, updateData);
    return ApiResponse.success(updatedEvent);
});

/**
 * DELETE /api/events?eventId=...
 * Deletes an event.
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('eventId');
    
    if (!eventIdParam) {
        return ApiResponse.badRequest('eventId parameter is required');
    }
    
    const eventId = parseId(eventIdParam, 'Event ID');
    const deleted = await deleteEvent(eventId);
    
    if (!deleted) {
        return ApiResponse.notFound('Event not found');
    }

    return ApiResponse.success({ message: 'Event deleted successfully' });
});

/**
 * PATCH /api/events
 * Duplicates an existing event with new name and date.
 */
export const PATCH = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const validation = duplicateEventSchema.safeParse(body);

    if (!validation.success) {
        return ApiResponse.badRequest('Invalid data', validation.error.flatten());
    }

    const { eventId, newName, newDate, newTime, newLocation } = validation.data;
    
    // Get the original event to copy its details
    const originalEvent = await getEventById(eventId);
    if (!originalEvent) {
        return ApiResponse.notFound('Event not found');
    }

    // Create the duplicated event
    const duplicatedEvent = await duplicateEvent(eventId, {
        name: newName,
        event_date: new Date(newDate),
        event_time: newTime || originalEvent.event_time,
        location: newLocation || originalEvent.location,
        description: originalEvent.description,
        group_id: originalEvent.group_id
    });

    return ApiResponse.created(duplicatedEvent);
}); 