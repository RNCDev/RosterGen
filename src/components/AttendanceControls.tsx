'use client';

import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';

interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isBulkEditMode: boolean;
    isGeneratingTeams: boolean;
    onEnterBulkEditMode: () => void;
    onExitBulkEditMode: () => void;
    onSaveChanges: () => void;
    onLoadSavedTeams?: () => void;
    onGenerateTeams: () => void;
}

export default function AttendanceControls({
    selectedEvent,
    isBulkEditMode,
    isGeneratingTeams,
    onEnterBulkEditMode,
    onExitBulkEditMode,
    onSaveChanges,
    onLoadSavedTeams,
    onGenerateTeams
}: AttendanceControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
                Event Attendance for <span className="text-blue-600">{selectedEvent.name}</span>
            </h3>

            {isBulkEditMode ? (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={onExitBulkEditMode}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSaveChanges}>
                        Save Changes
                    </Button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={onEnterBulkEditMode}>
                        Bulk Edit
                    </Button>
                    {selectedEvent?.saved_teams_data && onLoadSavedTeams && (
                        <Button
                            variant="outline"
                            onClick={onLoadSavedTeams}
                            className="btn-secondary"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            Load Saved Teams
                        </Button>
                    )}
                    <Button
                        onClick={onGenerateTeams}
                        disabled={isGeneratingTeams}
                        className="btn-primary"
                    >
                        <ArrowRightLeft className={`w-4 h-4 mr-2 ${isGeneratingTeams ? 'animate-spin' : ''}`} />
                        {isGeneratingTeams ? 'Generating...' : 'Generate Teams'}
                    </Button>
                </div>
            )}
        </div>
    );
} 