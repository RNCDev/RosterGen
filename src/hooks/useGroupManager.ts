'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    type Player, 
    type EventDB, 
    type EventWithStats, 
    type PlayerWithAttendance, 
    type AttendanceInput, 
    type EventInput 
} from '@/types/PlayerTypes';
import _ from 'lodash';

export function useGroupManager() {
    const [groupCode, setGroupCode] = useState<string>('');
    const [loadedGroupCode, setLoadedGroupCode] = useState<string>('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [originalPlayers, setOriginalPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // New event-related state
    const [events, setEvents] = useState<EventWithStats[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventDB | null>(null);
    const [attendanceData, setAttendanceData] = useState<PlayerWithAttendance[]>([]);
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);
    const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);

    // Using a callback for handleLoadGroup to use it in useEffect
    const handleLoadGroup = useCallback(async (code: string) => {
        if (!code) {
            setPlayers([]);
            setOriginalPlayers([]);
            setLoadedGroupCode('');
            setEvents([]);
            setSelectedEvent(null);
            setAttendanceData([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/groups?groupCode=${code}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch players');
            }
            const data: Player[] = await response.json();
            setPlayers(data);
            setOriginalPlayers(data); // Set original state after fetching
            setLoadedGroupCode(code);
            localStorage.setItem('groupCode', code);
            
            // Load events for this group
            await loadEvents(code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
            setPlayers([]);
            setOriginalPlayers([]);
            setLoadedGroupCode('');
            setEvents([]);
            setSelectedEvent(null);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load events for a group
    const loadEvents = useCallback(async (code: string) => {
        if (!code) return;
        
        setEventsLoading(true);
        try {
            const response = await fetch(`/api/events?group_code=${code}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch events');
            }
            const eventsData: EventWithStats[] = await response.json();
            setEvents(eventsData);
            
            // Auto-select most recent upcoming event
            const upcomingEvent = eventsData.find(e => new Date(e.event_date) >= new Date());
            if (upcomingEvent && !selectedEvent) {
                setSelectedEvent(upcomingEvent);
                await loadAttendanceForEvent(upcomingEvent.id);
            }
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setEventsLoading(false);
        }
    }, [selectedEvent]);

    // Load attendance for a specific event
    const loadAttendanceForEvent = useCallback(async (eventId: number) => {
        setAttendanceLoading(true);
        try {
            const response = await fetch(`/api/attendance?event_id=${eventId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch attendance');
            }
            const attendanceData: PlayerWithAttendance[] = await response.json();
            setAttendanceData(attendanceData);
        } catch (err) {
            console.error('Failed to load attendance:', err);
            setError(err instanceof Error ? err.message : 'Failed to load attendance');
        } finally {
            setAttendanceLoading(false);
        }
    }, []);

    // Create a new event
    const createEvent = useCallback(async (eventData: EventInput) => {
        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create event');
            }
            
            const newEvent: EventDB = await response.json();
            setEvents(prev => [newEvent as EventWithStats, ...prev]);
            setSelectedEvent(newEvent);
            
            // Load attendance for the new event
            await loadAttendanceForEvent(newEvent.id);
            
            return newEvent;
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to create event';
            setError(error);
            throw new Error(error);
        }
    }, [loadAttendanceForEvent]);

    // Update attendance for an event
    const updateAttendance = useCallback(async (eventId: number, updates: AttendanceInput[]) => {
        try {
            const response = await fetch('/api/attendance?bulk=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update attendance');
            }
            
            // After a successful update, refetch the events to get updated stats
            await loadEvents(loadedGroupCode);
            
            // Also refetch the attendance for the currently selected event
            if (selectedEvent && selectedEvent.id === eventId) {
                await loadAttendanceForEvent(eventId);
            }

        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to update attendance';
            setError(error);
            throw new Error(error);
        }
    }, [loadedGroupCode, selectedEvent, loadEvents, loadAttendanceForEvent]);

    // Delete an event
    const deleteEvent = useCallback(async (eventId: number) => {
        try {
            const response = await fetch(`/api/events?event_id=${eventId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete event');
            }
            
            setEvents(prev => prev.filter(e => e.id !== eventId));
            
            // If we deleted the selected event, clear selection
            if (selectedEvent?.id === eventId) {
                setSelectedEvent(null);
                setAttendanceData([]);
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Failed to delete event';
            setError(error);
            throw new Error(error);
        }
    }, [selectedEvent]);

    // Update selected event and load its attendance
    const selectEvent = useCallback(async (event: EventDB) => {
        setSelectedEvent(event);
        await loadAttendanceForEvent(event.id);
    }, [loadAttendanceForEvent]);

    const isDirty = !_.isEqual(players, originalPlayers);
    const isGroupNameDirty = loadedGroupCode.trim() !== '' && groupCode.trim() !== '' && groupCode !== loadedGroupCode;

    const handleSaveGroup = useCallback(async () => {
        if (!loadedGroupCode) {
            setError('A group must be loaded before saving changes.');
            return;
        }

        setLoading(true);
        setError(null);

        // Determine which players need to be created, updated, or deleted
        const playersToUpdate = players.filter(p => {
            const original = originalPlayers.find(op => op.id === p.id);
            return original && !_.isEqual(p, original);
        });

        const playersToCreate = players.filter(p => !originalPlayers.some(op => op.id === p.id));
        const playersToDelete = originalPlayers.filter(op => !players.some(p => p.id === op.id)).map(p => p.id);
        
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupCode: loadedGroupCode,
                    playersToUpdate,
                    playersToCreate,
                    playersToDelete,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to save changes");
            }
            
            // Refresh state from server
            await handleLoadGroup(loadedGroupCode);

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred while saving.');
        } finally {
            setLoading(false);
        }
    }, [loadedGroupCode, players, originalPlayers, handleLoadGroup]);

    const handleRenameGroup = useCallback(async () => {
        if (!isGroupNameDirty) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/groups', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldGroupCode: loadedGroupCode, newGroupCode: groupCode }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to rename group.");
            }

            // On success, update the loaded code and local storage
            setLoadedGroupCode(groupCode);
            localStorage.setItem('groupCode', groupCode);
            await handleLoadGroup(groupCode); // Reload to confirm changes

        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred during rename.');
            // Revert input field to the original name on failure
            setGroupCode(loadedGroupCode);
        } finally {
            setLoading(false);
        }
    }, [groupCode, loadedGroupCode, isGroupNameDirty, handleLoadGroup]);

    const handleToggleBulkEdit = useCallback(async (isEditing: boolean, doSave: boolean) => {
        if (isEditing && doSave) {
            await handleSaveGroup();
        }
    }, [handleSaveGroup]);

    // Load initial group code from localStorage
    useEffect(() => {
        const savedGroupCode = localStorage.getItem('groupCode');
        if (savedGroupCode) {
            setGroupCode(savedGroupCode);
            handleLoadGroup(savedGroupCode);
        } else {
            setLoading(false);
        }
    }, [handleLoadGroup]);

    const handleClearGroup = () => {
        setGroupCode('');
        setLoadedGroupCode('');
        setPlayers([]);
        setOriginalPlayers([]);
        setEvents([]);
        setSelectedEvent(null);
        setAttendanceData([]);
        localStorage.removeItem('groupCode');
        setError(null);
    };

    const handleDeleteGroup = async () => {
        if (!loadedGroupCode) return;

        try {
            const response = await fetch(`/api/groups?groupCode=${loadedGroupCode}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete group');
            }
            handleClearGroup();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
        }
    };

    return {
        groupCode,
        setGroupCode,
        loadedGroupCode,
        players,
        setPlayers,
        originalPlayers,
        loading,
        error,
        isDirty,
        isGroupNameDirty,
        handleLoadGroup,
        handleSaveGroup,
        handleClearGroup,
        handleDeleteGroup,
        setError,
        setLoading,
        // New event-related returns
        events,
        selectedEvent,
        attendanceData,
        eventsLoading,
        attendanceLoading,
        loadEvents,
        createEvent,
        updateAttendance,
        deleteEvent,
        selectEvent,
        handleToggleBulkEdit,
        handleRenameGroup,
    };
}