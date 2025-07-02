import { NextRequest, NextResponse } from 'next/server';
import { updateEventSavedTeams, getEventById } from '@/lib/db';
import { type Teams } from '@/types/PlayerTypes';

export async function PUT(request: NextRequest) {
    try {
        const { eventId, teams }: { eventId: number; teams: Teams } = await request.json();

        if (!eventId || !teams) {
            return NextResponse.json(
                { error: 'eventId and teams are required' },
                { status: 400 }
            );
        }

        // Verify the event exists
        const event = await getEventById(eventId);
        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Serialize teams data to JSON string
        const teamsJson = JSON.stringify(teams);

        // Update the event with saved teams data
        const updatedEvent = await updateEventSavedTeams(eventId, teamsJson);

        return NextResponse.json({
            message: 'Teams saved successfully',
            event: updatedEvent
        });

    } catch (error) {
        console.error('Error saving teams to event:', error);
        return NextResponse.json(
            { error: 'Failed to save teams to event' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        if (!eventId) {
            return NextResponse.json(
                { error: 'eventId parameter is required' },
                { status: 400 }
            );
        }

        const event = await getEventById(parseInt(eventId));
        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        if (!event.saved_teams_data) {
            return NextResponse.json(
                { error: 'No saved teams found for this event' },
                { status: 404 }
            );
        }

        // Parse the JSON string back to Teams object
        try {
            const teams: Teams = JSON.parse(event.saved_teams_data);
            return NextResponse.json({ teams });
        } catch (parseError) {
            console.error('Error parsing saved teams data:', parseError);
            return NextResponse.json(
                { error: 'Invalid saved teams data' },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Error loading teams from event:', error);
        return NextResponse.json(
            { error: 'Failed to load teams from event' },
            { status: 500 }
        );
    }
} 