'use client';

import React from 'react';
import { Copy, Trash2, ShieldCheck, Trash, Pencil } from 'lucide-react';
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
    onEdit: () => void;
    onLoadSavedTeams: () => void;
    onDeleteSavedTeams: () => void;
}

const EventCard = React.memo(function EventCard({
    event,
    isSelected,
    onClick,
    onDelete,
    onDuplicate,
    onEdit,
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
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
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

    const cardBaseClasses = "w-full rounded-lg border p-5 cursor-pointer transition-all duration-200 ease-in-out transform";
    const cardStateClasses = isSelected
        ? "bg-blue-900/95 border-blue-700 text-white shadow-lg -translate-y-1"
        : "bg-white/60 border-white/40 text-gray-800 hover:border-gray-300/80 hover:-translate-y-0.5";

    return (
        <div className="flex flex-col">
            <div onClick={onClick} className={`${cardBaseClasses} ${cardStateClasses} ${hasSavedTeams && isSelected ? 'rounded-b-none' : ''}`}>
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <p className={`font-bold text-xl mb-2 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {event.name}
                        </p>
                        <p className={`text-base ${isSelected ? 'text-blue-200' : 'text-gray-600'}`}>
                            {new Date(event.event_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'UTC'
                            })}
                            {event.event_time && ` @ ${formatTime12Hour(event.event_time)}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleEdit}
                            className={`p-2 rounded-full transition-colors ${isSelected
                                    ? 'text-blue-300 hover:bg-blue-800/50'
                                    : 'text-gray-400 hover:bg-gray-200/80'
                                }`}
                            title="Edit Event"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={handleDuplicate}
                            className={`p-2 rounded-full transition-colors ${isSelected
                                    ? 'text-blue-300 hover:bg-blue-800/50'
                                    : 'text-gray-400 hover:bg-gray-200/80'
                                }`}
                            title="Duplicate Event"
                        >
                            <Copy size={18} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className={`p-2 rounded-full transition-colors ${isSelected
                                    ? 'text-blue-300 hover:bg-blue-800/50'
                                    : 'text-gray-400 hover:bg-gray-200/80'
                                }`}
                            title="Delete Event"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>
            
            {hasSavedTeams && isSelected && (
                 <div className="bg-blue-50/90 border-t border-blue-200/60 rounded-b-lg px-5 py-3 shadow-sm">
                    <div className="flex justify-between items-center">
                        <button 
                            onClick={handleLoadTeams}
                            className="flex items-center gap-2 text-blue-800 font-semibold text-sm px-3 py-2 rounded-md hover:bg-blue-100/60 transition-all duration-200"
                        >
                            <ShieldCheck size={16} />
                            Load Saved Teams
                        </button>
                        <button
                            onClick={handleDeleteSavedTeams}
                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100/60 hover:text-blue-800 transition-colors"
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