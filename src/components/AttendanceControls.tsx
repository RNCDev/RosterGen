'use client';

import React, { useState } from 'react';
import { ArrowRightLeft, RefreshCw } from 'lucide-react';
import { type EventWithStats } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import { TeamSnapSyncDialog } from '@/components/dialogs/TeamSnapSyncDialog';
import { Toast, useToast } from '@/components/ui/toast';
import { useTeamSnapAuth } from '@/hooks/useTeamSnapAuth';

interface AttendanceControlsProps {
    selectedEvent: EventWithStats;
    isGeneratingTeams: boolean;
    onGenerateTeams: () => void;
    onAttendanceUpdate?: () => void;
    teamSnapTeamId?: string | null;
}

export default function AttendanceControls({
    selectedEvent,
    isGeneratingTeams,
    onGenerateTeams,
    onAttendanceUpdate,
    teamSnapTeamId,
}: AttendanceControlsProps) {
    const [showTeamSnapDialog, setShowTeamSnapDialog] = useState(false);
    const [isSyncingAttendance, setIsSyncingAttendance] = useState(false);
    const { isAuthenticated } = useTeamSnapAuth();
    const toastState = useToast();

    const handleTeamSnapUpdate = async () => {
        // For now, just show a dialog to get TeamSnap URL/IDs
        // In the interim, we'll fetch and display in toast
        setShowTeamSnapDialog(true);
    };

    const handleSyncFromDialog = async (eventId: string) => {
        setIsSyncingAttendance(true);
        
        try {
            const response = await fetch('/api/teamsnap/sync-attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventId })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to sync attendance');
            }

            const data = await response.json();
            
            // Format the attendance data for display
            const attendingPlayers = data.attendance
                .filter((p: any) => p.isAttending)
                .map((p: any) => p.playerName)
                .join(', ');
            
            const notAttendingPlayers = data.attendance
                .filter((p: any) => !p.isAttending)
                .map((p: any) => p.playerName)
                .join(', ');

            // Show the results in a toast
            const message = `TeamSnap Sync: ${data.summary.attending} attending, ${data.summary.notAttending} not attending (${data.summary.total} total)`;
            toastState.toast({
                message,
                type: 'success',
                duration: 10000, // Show for 10 seconds
            });
            
            // Log detailed info to console for now
            console.log('TeamSnap Attendance Data:', {
                attending: attendingPlayers.split(', '),
                notAttending: notAttendingPlayers.split(', '),
                summary: data.summary
            });

            setShowTeamSnapDialog(false);
            
            // In the future, this would trigger the actual database update
            if (onAttendanceUpdate) {
                // onAttendanceUpdate();
            }
        } catch (error) {
            toastState.toast({
                message: error instanceof Error ? error.message : 'Failed to sync attendance from TeamSnap',
                type: 'error',
            });
        } finally {
            setIsSyncingAttendance(false);
        }
    };

    return (
        <>
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
                    {isAuthenticated && selectedEvent?.teamsnap_event_id && (
                        <Button
                            onClick={handleTeamSnapUpdate}
                            disabled={isSyncingAttendance}
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncingAttendance ? 'animate-spin' : ''}`} />
                            {isSyncingAttendance ? 'Syncing...' : 'Update from TeamSnap'}
                        </Button>
                    )}
                </div>
            </div>

            <TeamSnapSyncDialog
                open={showTeamSnapDialog}
                onOpenChange={setShowTeamSnapDialog}
                eventId={selectedEvent.id}
                teamSnapTeamId={teamSnapTeamId || null}
                onSync={handleSyncFromDialog}
            />

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