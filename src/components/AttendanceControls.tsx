'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, RefreshCw, Eye } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/use-toast';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';


interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isGeneratingTeams: boolean;
    onGenerateTeams: () => void;
    onAttendanceUpdate?: () => void;
    teamSnapTeamId?: string | null;
    groupId: number;
    showTeamSnapInline?: boolean;
    onToggleTeamSnapInline?: () => void;
}

export default function AttendanceControls({
    selectedEvent,
    isGeneratingTeams,
    onGenerateTeams,
    onAttendanceUpdate,
    teamSnapTeamId,
    groupId,
    showTeamSnapInline = false,
    onToggleTeamSnapInline,
}: AttendanceControlsProps) {
    const [isSyncingAttendance, setIsSyncingAttendance] = useState(false);
    const { isAuthenticated } = useTeamSnapAuth();
    const { toast } = useToast();

    const handleTeamSnapUpdate = () => {
        toast({
            title: 'Sync test',
            description: 'Button clicked!',
        });
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                    Attendance for <span className="text-blue-600">{selectedEvent.name}</span>
                </h3>
                <div className="flex gap-3">
                    <Button
                        onClick={onGenerateTeams}
                        disabled={isGeneratingTeams}
                        className="btn-primary"
                    >
                        <ArrowRightLeft className={`w-4 h-4 mr-2 ${isGeneratingTeams ? 'animate-spin' : ''}`} />
                        {isGeneratingTeams ? 'Generating...' : 'Generate Teams'}
                    </Button>
                    {isAuthenticated && selectedEvent?.teamsnap_event_id && onToggleTeamSnapInline && (
                        <Button
                            onClick={onToggleTeamSnapInline}
                            variant={showTeamSnapInline ? "default" : "outline"}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            {showTeamSnapInline ? 'Hide' : 'Show'} TeamSnap Attendance
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}