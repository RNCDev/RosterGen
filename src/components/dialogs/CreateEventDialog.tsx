'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { type EventForm, formToEventInput, type Group, type EventInput } from '@/types/PlayerTypes';

interface CreateEventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateEvent: (eventData: Omit<EventInput, 'group_id'>) => Promise<void>;
    group: Group;
}

export default function CreateEventDialog({ 
    isOpen, 
    onClose, 
    onCreateEvent, 
    group 
}: CreateEventDialogProps) {
    const [eventForm, setEventForm] = useState<EventForm>({
        name: '',
        description: '',
        date: '',
        time: '',
        location: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!eventForm.name.trim() || !eventForm.date) {
            setError('Event name and date are required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const eventData = formToEventInput(eventForm, group.id);
            await onCreateEvent(eventData);
            
            // Reset form and close dialog
            setEventForm({
                name: '',
                description: '',
                date: '',
                time: '',
                location: ''
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof EventForm, value: string) => {
        setEventForm(prev => ({ ...prev, [field]: value }));
        setError(null);
    };

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD format for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md border border-white/40">
                <div className="flex items-center justify-between p-6 border-b border-gray-200/60">
                    <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* Event Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Event Name *
                        </label>
                        <input
                            type="text"
                            value={eventForm.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Friday Night Hockey"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={eventForm.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Optional event description..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Date *
                            </label>
                            <input
                                type="date"
                                value={eventForm.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                min={today}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Time
                            </label>
                            <input
                                type="time"
                                value={eventForm.time}
                                onChange={(e) => handleInputChange('time', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Location
                        </label>
                        <input
                            type="text"
                            value={eventForm.location}
                            onChange={(e) => handleInputChange('location', e.target.value)}
                            placeholder="e.g., Main Rink"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !eventForm.name.trim() || !eventForm.date}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Event'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 