import { useState } from 'react';
import { type PlayerWithAttendance, type AttendanceInput } from '@/types/PlayerTypes';

export interface AttendanceManagementState {
    isBulkEditMode: boolean;
    stagedChanges: Map<number, boolean>;
    setIsBulkEditMode: (mode: boolean) => void;
    setStagedChanges: (changes: Map<number, boolean>) => void;
    handleEnterBulkEditMode: (attendanceData: PlayerWithAttendance[]) => void;
    handleExitBulkEditMode: () => void;
    handleStagedChange: (playerId: number, isAttending: boolean) => void;
    handleSaveChanges: (
        selectedEventId: number,
        attendanceData: PlayerWithAttendance[],
        onUpdateAttendance: (eventId: number, updates: AttendanceInput[]) => Promise<void>
    ) => Promise<void>;
}

export function useAttendanceManagement(): AttendanceManagementState {
    const [isBulkEditMode, setIsBulkEditMode] = useState(false);
    const [stagedChanges, setStagedChanges] = useState<Map<number, boolean>>(new Map());

    const handleEnterBulkEditMode = (attendanceData: PlayerWithAttendance[]) => {
        const initialStagedChanges = new Map<number, boolean>();
        attendanceData.forEach(player => {
            initialStagedChanges.set(player.id, player.is_attending_event ?? false);
        });
        setStagedChanges(initialStagedChanges);
        setIsBulkEditMode(true);
    };

    const handleExitBulkEditMode = () => {
        setIsBulkEditMode(false);
        setStagedChanges(new Map());
    };

    const handleStagedChange = (playerId: number, isAttending: boolean) => {
        setStagedChanges(new Map(stagedChanges.set(playerId, isAttending)));
    };

    const handleSaveChanges = async (
        selectedEventId: number,
        attendanceData: PlayerWithAttendance[],
        onUpdateAttendance: (eventId: number, updates: AttendanceInput[]) => Promise<void>
    ) => {
        const changes: AttendanceInput[] = [];
        const originalAttendance = new Map(
            attendanceData.map(p => [p.id, p.is_attending_event ?? false])
        );

        for (const [playerId, isAttending] of stagedChanges.entries()) {
            if (originalAttendance.get(playerId) !== isAttending) {
                changes.push({
                    player_id: playerId,
                    event_id: selectedEventId,
                    is_attending: isAttending,
                });
            }
        }

        if (changes.length > 0) {
            await onUpdateAttendance(selectedEventId, changes);
        }

        handleExitBulkEditMode();
    };

    return {
        isBulkEditMode,
        stagedChanges,
        setIsBulkEditMode,
        setStagedChanges,
        handleEnterBulkEditMode,
        handleExitBulkEditMode,
        handleStagedChange,
        handleSaveChanges
    };
} 