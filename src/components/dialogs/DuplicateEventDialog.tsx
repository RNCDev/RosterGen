'use client';

import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import { Button } from '../ui/Button';
import { type EventWithStats } from '@/types/PlayerTypes';

interface DuplicateEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onDuplicate: (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string) => Promise<void>;
    event: EventWithStats | null;
}

export default function DuplicateEventDialog({
    isOpen,
    onClose,
    onDuplicate,
    event
}: DuplicateEventDialogProps) {
    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens/closes or event changes
    React.useEffect(() => {
        if (isOpen && event) {
            setNewName(`${event.name} (Copy)`);
            setNewDate('');
            setNewTime(event.event_time || '');
            setNewLocation(event.location || '');
        }
    }, [isOpen, event]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || !newName.trim() || !newDate) return;

        setIsSubmitting(true);
        try {
            await onDuplicate(
                event.id,
                newName.trim(),
                newDate,
                newTime || undefined,
                newLocation || undefined
            );
            onClose();
        } catch (error) {
            console.error('Failed to duplicate event:', error);
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
                        <Copy className="w-5 h-5" />
                        Duplicate Event
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
                        <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Name *
                        </label>
                        <input
                            type="text"
                            id="newName"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter event name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="newDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Date *
                        </label>
                        <input
                            type="date"
                            id="newDate"
                            value={newDate}
                            onChange={(e) => setNewDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="newTime" className="block text-sm font-medium text-gray-700 mb-1">
                            Event Time
                        </label>
                        <input
                            type="time"
                            id="newTime"
                            value={newTime}
                            onChange={(e) => setNewTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="newLocation" className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>
                        <input
                            type="text"
                            id="newLocation"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter location"
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Original Event:</strong> {event.name}
                        </p>
                        <p className="text-sm text-blue-700">
                            {new Date(event.event_date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric'
                            })}
                        </p>
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
                            disabled={isSubmitting || !newName.trim() || !newDate}
                        >
                            {isSubmitting ? 'Duplicating...' : 'Duplicate Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 