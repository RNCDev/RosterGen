import { useState } from 'react';
import { type PlayerWithAttendance, type AttendanceInput } from '@/types/PlayerTypes';

export interface AttendanceManagementState {
    handleUpdateSingleAttendance: (
        playerId: number,
        eventId: number,
        isAttending: boolean,
        onUpdate: (playerId: number, eventId: number, isAttending: boolean, notes?: string) => Promise<void>
    ) => Promise<void>;
}

export function useAttendanceManagement(): AttendanceManagementState {

    const handleUpdateSingleAttendance = async (
        playerId: number,
        eventId: number,
        isAttending: boolean,
        onUpdate: (playerId: number, eventId: number, isAttending: boolean, notes?: string) => Promise<void>
    ) => {
        await onUpdate(playerId, eventId, isAttending);
    };

    return {
        handleUpdateSingleAttendance,
    };
} 