'use client';

import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';

interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isGeneratingTeams: boolean;
    onGenerateTeams: () => void;
}

export default function AttendanceControls({
    selectedEvent,
    isGeneratingTeams,
    onGenerateTeams,
}: AttendanceControlsProps) {
    return (
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
                Attendance for <span className="text-blue-600">{selectedEvent.name}</span>
            </h3>

            <div className="flex items-center gap-2">
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