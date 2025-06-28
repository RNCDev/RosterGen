import { NextRequest, NextResponse } from 'next/server';
import { 
    createEvent, 
    getEventsByGroup, 
    getEventById, 
    updateEvent, 
    deleteEvent,
    duplicateEvent
} from '@/lib/db';
import { type EventInput } from '@/types/PlayerTypes';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const groupId = searchParams.get('groupId');
        const eventId = searchParams.get('eventId');

        if (!groupId && !eventId) {
            return NextResponse.json(
                { error: 'Either groupId or eventId parameter is required' },
                { status: 400 }
            );
        }

        if (eventId) {
            const event = await getEventById(parseInt(eventId));
            if (!event) {
                return NextResponse.json(
                    { error: 'Event not found' },
                    { status: 404 }
                );
            }
            return NextResponse.json(event);
        }

        if (groupId) {
            const events = await getEventsByGroup(parseInt(groupId));
            return NextResponse.json(events);
        }

    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const eventData: EventInput = await request.json();

        // Validate required fields
        if (!eventData.name || !eventData.event_date || !eventData.group_id) {
            return NextResponse.json(
                { error: 'Name, event_date, and group_id are required' },
                { status: 400 }
            );
        }

        // Ensure event_date is a proper Date object
        if (typeof eventData.event_date === 'string') {
            eventData.event_date = new Date(eventData.event_date);
        }

        const newEvent = await createEvent(eventData);
        return NextResponse.json(newEvent, { status: 201 });

    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        const eventData: Partial<EventInput> = await request.json();

        // Ensure event_date is a proper Date object if provided
        if (eventData.event_date && typeof eventData.event_date === 'string') {
            eventData.event_date = new Date(eventData.event_date);
        }

        const updatedEvent = await updateEvent(parseInt(eventId), eventData);
        return NextResponse.json(updatedEvent);

    } catch (error) {
        console.error('Error updating event:', error);
        return NextResponse.json(
            { error: 'Failed to update event' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        const deleted = await deleteEvent(parseInt(eventId));
        
        if (!deleted) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Event deleted successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json(
            { error: 'Failed to delete event' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/events
 * Duplicates an existing event with new name and date.
 */
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = z.object({
            eventId: z.number().int().positive(),
            newName: z.string().trim().min(1),
            newDate: z.string().min(1), // ISO date string
            newTime: z.string().optional(), // Optional time
            newLocation: z.string().optional(), // Optional location
        }).safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid data', details: validation.error.flatten() }, { status: 400 });
        }

        const { eventId, newName, newDate, newTime, newLocation } = validation.data;
        
        // Get the original event to copy its details
        const originalEvent = await getEventById(eventId);
        if (!originalEvent) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Create the duplicated event
        const duplicatedEvent = await duplicateEvent(eventId, {
            name: newName,
            event_date: newDate,
            event_time: newTime || originalEvent.event_time,
            location: newLocation || originalEvent.location,
            description: originalEvent.description,
            group_id: originalEvent.group_id
        });

        return NextResponse.json(duplicatedEvent, { status: 201 });

    } catch (error) {
        console.error('Error in PATCH /api/events:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 