'use client';

import React, { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { Button } from '../ui/Button';
import { type EventWithStats, type EventInput } from '@/types/PlayerTypes';

interface EditEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onEditEvent: (eventId: number, eventData: Partial<Omit<EventInput, 'group_id'>>) => Promise<void>;
    event: EventWithStats | null;
}

export default function EditEventDialog({
    isOpen,
    onClose,
    onEditEvent,
    event
}: EditEventDialogProps) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [teamsnapEventId, setTeamsnapEventId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && event) {
            setName(event.name);
            setDate(new Date(event.event_date).toISOString().split('T')[0]);
            setTime(event.event_time || '');
            setLocation(event.location || '');
            setTeamsnapEventId(event.teamsnap_event_id || '');
        }
    }, [isOpen, event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || !name.trim() || !date) return;

        setIsSubmitting(true);
        try {
            const eventData: Partial<Omit<EventInput, 'group_id'>> = {
                name: name.trim(),
                event_date: date,
                event_time: time || undefined,
                location: location || undefined,
                teamsnap_event_id: teamsnapEventId || undefined,
            };
            await onEditEvent(event.id, eventData);
            onClose();
        } catch (error) {
            console.error('Failed to edit event:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Pencil className="w-5 h-5" />
                        Edit Event
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Time
                        </label>
                        <input
                            type="time"
                            id="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="teamsnapEventId" className="block text-sm font-medium text-gray-700 mb-1">
                            TeamSnap Event ID (Optional)
                        </label>
                        <input
                            type="text"
                            id="teamsnapEventId"
                            value={teamsnapEventId}
                            onChange={(e) => setTeamsnapEventId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting || !name.trim() || !date}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
