'use client';

import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import EventCard from '@/components/EventCard';

interface EventsListProps {
    events: EventWithStats[];
    selectedEvent: EventWithStats | null;
    eventsLoading: boolean;
    onEventSelect: (event: EventWithStats) => void;
    onCreateEvent: () => void;
    onDeleteEvent: (eventId: number) => void;
    onDuplicateEvent: (event: EventWithStats) => void;
    onEditEvent: (event: EventWithStats) => void;
    onLoadSavedTeams: (eventId: number) => void;
    onDeleteSavedTeams: (eventId: number) => void;
}

export default function EventsList({
    events,
    selectedEvent,
    eventsLoading,
    onEventSelect,
    onCreateEvent,
    onDeleteEvent,
    onDuplicateEvent,
    onEditEvent,
    onLoadSavedTeams,
    onDeleteSavedTeams
}: EventsListProps) {
    return (
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-gray-800">Events</h2>
                <p className="text-sm text-gray-600">Select an event to view attendance.</p>
            </div>

            <Button onClick={onCreateEvent} className="w-full justify-center btn-primary">
                <Plus size={16} className="mr-2" /> Create Event
            </Button>

            <div className="space-y-3">
                {eventsLoading ? (
                    <div className="text-center py-8">
                        <div className="w-6 h-6 mx-auto mb-2 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-xs text-gray-500">Loading events...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2 text-sm font-medium">No events found</p>
                        <p className="text-xs text-gray-500">Click 'Create Event' to start</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            isSelected={selectedEvent?.id === event.id}
                            onClick={() => onEventSelect(event)}
                            onDelete={() => onDeleteEvent(event.id)}
                            onDuplicate={() => onDuplicateEvent(event)}
                            onEdit={() => onEditEvent(event)}
                            onLoadSavedTeams={() => onLoadSavedTeams(event.id)}
                            onDeleteSavedTeams={() => onDeleteSavedTeams(event.id)}
                        />
                    ))
                )}
            </div>
        </div>
    );
} 