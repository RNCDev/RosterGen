'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, RefreshCw, Eye } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import { Toast, useToast } from '@/components/ui/toast';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isGeneratingTeams: boolean;
    onGenerateTeams: () => void;
    onAttendanceUpdate?: () => void;
    teamSnapTeamId?: string | null;
    groupId: number;
    onShowTeamSnapAttendance: () => void;
}

export default function AttendanceControls({
    selectedEvent,
    isGeneratingTeams,
    onGenerateTeams,
    onAttendanceUpdate,
    teamSnapTeamId,
    groupId,
    onShowTeamSnapAttendance,
}: AttendanceControlsProps) {
    const [isSyncingAttendance, setIsSyncingAttendance] = useState(false);
    const { isAuthenticated } = useTeamSnapAuth();
    const toastState = useToast();

    const handleTeamSnapUpdate = () => {
        toastState.toast({
            message: 'Sync test - button clicked!',
            type: 'success'
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
                    {isAuthenticated && selectedEvent?.teamsnap_event_id && (
                        <>
                            <Button
                                onClick={onShowTeamSnapAttendance}
                                variant="outline"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                TeamSnap Attendance
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <Toast
                open={toastState.open}
                message={toastState.message}
                type={toastState.type}
                duration={toastState.duration}
                onClose={toastState.dismiss}
            />
        </>
    );
}