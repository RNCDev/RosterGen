'use client';

import React from 'react';
import { Users, Copy, Trash2 } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';

interface EventCardProps {
    event: EventWithStats;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
}

export default function EventCard({ 
    event, 
    isSelected, 
    onClick, 
    onDelete, 
    onDuplicate 
}: EventCardProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card from being selected
        if (window.confirm(`Are you sure you want to delete the event "${event.name}"?`)) {
            onDelete();
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card from being selected
        onDuplicate();
    };

    const cardBaseClasses = "w-full rounded-lg border p-3 cursor-pointer transition-all duration-200 ease-in-out transform";
    const cardStateClasses = isSelected
        ? "bg-blue-900/95 border-blue-700 text-white shadow-lg -translate-y-1"
        : "bg-white/60 border-white/40 text-gray-800 hover:border-gray-300/80 hover:-translate-y-0.5";

    return (
        <div onClick={onClick} className={`${cardBaseClasses} ${cardStateClasses}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                        {event.name}
                    </p>
                    <p className={`text-sm ${isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            timeZone: 'UTC' 
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleDuplicate}
                        className={`p-1.5 rounded-full transition-colors ${
                            isSelected 
                                ? 'text-blue-300 hover:bg-blue-800/50' 
                                : 'text-gray-400 hover:bg-gray-200/80'
                        }`}
                        title="Duplicate Event"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className={`p-1.5 rounded-full transition-colors ${
                            isSelected 
                                ? 'text-blue-300 hover:bg-blue-800/50' 
                                : 'text-gray-400 hover:bg-gray-200/80'
                        }`}
                        title="Delete Event"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
            <div className={`my-3 h-px ${isSelected ? 'bg-blue-700/50' : 'bg-gray-200/80'}`}></div>
            <div className="flex justify-between items-center text-sm">
                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                    <Users size={14} />
                    <span>{event.attending_count || 0} Attending</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                    <span className="font-semibold text-green-400">{event.forwards_count || 0} F</span>
                    <span className="font-semibold text-purple-400">{event.defensemen_count || 0} D</span>
                </div>
            </div>
        </div>
    );
} 