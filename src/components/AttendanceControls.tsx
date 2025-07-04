'use client';

import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';

interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isGeneratingTeams: boolean;
    onLoadSavedTeams?: () => void;
    onGenerateTeams: () => void;
    onDeleteSavedTeams: (eventId: number) => Promise<void>;
}

export default function AttendanceControls({
    selectedEvent,
    isGeneratingTeams,
    onLoadSavedTeams,
    onGenerateTeams,
    onDeleteSavedTeams,
}: AttendanceControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
                Event Attendance for <span className="text-blue-600">{selectedEvent.name}</span>
            </h3>

            <div className="flex items-center gap-2">
                {selectedEvent?.saved_teams_data && (
                    <Button
                        variant="outline"
                        onClick={() => onDeleteSavedTeams(selectedEvent.id)}
                        className="btn-secondary"
                    >
                        Delete Saved Teams
                    </Button>
                )}
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
        </div>
    );
} 