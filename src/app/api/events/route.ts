import { NextRequest, NextResponse } from 'next/server';
import { 
    createEvent, 
    getEventsByGroup, 
    getEventById, 
    updateEvent, 
    deleteEvent 
} from '@/lib/db';
import { type EventInput } from '@/types/PlayerTypes';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const groupCode = searchParams.get('group_code');
        const eventId = searchParams.get('event_id');

        if (!groupCode && !eventId) {
            return NextResponse.json(
                { error: 'Either group_code or event_id parameter is required' },
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

        if (groupCode) {
            const events = await getEventsByGroup(groupCode);
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
        if (!eventData.name || !eventData.event_date || !eventData.group_code) {
            return NextResponse.json(
                { error: 'Name, event_date, and group_code are required' },
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
        const eventId = searchParams.get('event_id');

        if (!eventId) {
            return NextResponse.json(
                { error: 'event_id parameter is required' },
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
        const eventId = searchParams.get('event_id');

        if (!eventId) {
            return NextResponse.json(
                { error: 'event_id parameter is required' },
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