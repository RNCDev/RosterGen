'use client';

import React from 'react';
import { Copy, Trash2, ShieldCheck, Trash } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';

// Function to convert 24-hour time format to 12-hour format
const formatTime12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

interface EventCardProps {
    event: EventWithStats;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onLoadSavedTeams: () => void;
    onDeleteSavedTeams: () => void;
}

const EventCard = React.memo(function EventCard({
    event,
    isSelected,
    onClick,
    onDelete,
    onDuplicate,
    onLoadSavedTeams,
    onDeleteSavedTeams
}: EventCardProps) {
    const confirmDialog = useConfirmDialog();
    const hasSavedTeams = event.saved_teams_data && Object.keys(JSON.parse(event.saved_teams_data)).length > 0;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmed = await confirmDialog.confirmDeletion(event.name, 'event');
        if (confirmed) {
            onDelete();
        }
    };

    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDuplicate();
    };
    
    const handleLoadTeams = (e: React.MouseEvent) => {
        e.stopPropagation();
        onLoadSavedTeams();
    };

    const handleDeleteSavedTeams = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmed = await confirmDialog.confirm({
            title: 'Delete Saved Teams',
            message: `Are you sure you want to delete the saved teams for "${event.name}"? This cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel'
        });
        if (confirmed) {
            onDeleteSavedTeams();
        }
    };

    const cardBaseClasses = "w-full rounded-lg border p-3 cursor-pointer transition-all duration-200 ease-in-out transform";
    const cardStateClasses = isSelected
        ? "bg-blue-900/95 border-blue-700 text-white shadow-lg -translate-y-1"
        : "bg-white/60 border-white/40 text-gray-800 hover:border-gray-300/80 hover:-translate-y-0.5";

    return (
        <div className="flex flex-col">
            <div onClick={onClick} className={`${cardBaseClasses} ${cardStateClasses} ${hasSavedTeams && isSelected ? 'rounded-b-none' : ''}`}>
                <div className="flex justify-between items-center">
                    <div className="flex-1">
                        <p className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {event.name}
                        </p>
                        <p className={`text-sm ${isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'UTC'
                            })}
                            {event.event_time && ` @ ${formatTime12Hour(event.event_time)}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleDuplicate}
                            className={`p-1.5 rounded-full transition-colors ${isSelected
                                    ? 'text-blue-300 hover:bg-blue-800/50'
                                    : 'text-gray-400 hover:bg-gray-200/80'
                                }`}
                            title="Duplicate Event"
                        >
                            <Copy size={16} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className={`p-1.5 rounded-full transition-colors ${isSelected
                                    ? 'text-blue-300 hover:bg-blue-800/50'
                                    : 'text-gray-400 hover:bg-gray-200/80'
                                }`}
                            title="Delete Event"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
            
            {hasSavedTeams && isSelected && (
                 <div className="animate-swing-in-and-settle bg-gradient-to-r from-yellow-600/70 via-yellow-500/70 to-yellow-600/70 border-t-2 border-yellow-500/90 rounded-b-lg px-3 py-2 shadow-md -mt-1 z-10">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handleLoadTeams}
                            className="flex items-center gap-2 text-black font-semibold text-sm px-2 py-1 rounded-md hover:bg-black/10 transition-all duration-200"
                        >
                            <ShieldCheck size={16} />
                            Load Saved Teams
                        </button>
                        <button
                            onClick={handleDeleteSavedTeams}
                            className="p-1.5 rounded-full text-black/80 hover:bg-black/10 hover:text-black transition-colors"
                            title="Delete Saved Teams"
                        >
                            <Trash size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

export default EventCard; 