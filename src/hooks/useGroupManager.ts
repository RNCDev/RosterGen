'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
    type Player, 
    type Group,
    type EventDB, 
    type EventWithStats, 
    type PlayerWithAttendance, 
    type AttendanceInput, 
    type EventInput 
} from '@/types/PlayerTypes';
import _ from 'lodash';

export function useGroupManager() {
    const [groupCodeInput, setGroupCodeInput] = useState<string>(''); // User's input
    const [activeGroup, setActiveGroup] = useState<Group | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [originalPlayers, setOriginalPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Event-related state
    const [events, setEvents] = useState<EventWithStats[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventWithStats | null>(null);
    const [attendanceData, setAttendanceData] = useState<PlayerWithAttendance[]>([]);
    const [eventsLoading, setEventsLoading] = useState<boolean>(false);
    const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);
    
    // Initial load from localStorage
    useEffect(() => {
        const savedGroupCode = localStorage.getItem('activeGroupCode');
        if (savedGroupCode) {
            setGroupCodeInput(savedGroupCode);
            handleLoadGroup(savedGroupCode);
        }
    }, []);

    const clearGroupState = () => {
        setActiveGroup(null);
        setPlayers([]);
        setOriginalPlayers([]);
        setEvents([]);
        setSelectedEvent(null);
        setAttendanceData([]);
        localStorage.removeItem('activeGroupCode');
    };
    
    const handleLoadGroup = useCallback(async (code: string) => {
        if (!code) {
            clearGroupState();
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // 1. Fetch the group by code
            const groupResponse = await fetch(`/api/groups?code=${code}`);
            if (!groupResponse.ok) {
                if (groupResponse.status === 404) {
                    throw new Error('Group not found. Check the code or create a new one.');
                }
                const errorData = await groupResponse.json();
                throw new Error(errorData.error || 'Failed to fetch group');
            }
            const groupData: Group = await groupResponse.json();
            setActiveGroup(groupData);
            setGroupCodeInput(groupData.code); // Sync input field with loaded code
            localStorage.setItem('activeGroupCode', groupData.code);

            // 2. Fetch players for the group
            const playersResponse = await fetch(`/api/players?groupId=${groupData.id}`);
            if (!playersResponse.ok) {
                // It's okay if a new group has no players yet (404), but other errors should fail.
                if (playersResponse.status !== 404) {
                    throw new Error('Failed to fetch players');
                }
            }
            const playersData: Player[] = playersResponse.ok ? await playersResponse.json() : [];
            setPlayers(playersData);
            setOriginalPlayers(playersData);

            // 3. Fetch events for the group
            await loadEvents(groupData.id);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load group');
            clearGroupState();
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadEvents = useCallback(async (groupId: number) => {
        if (!groupId) return;
        setEventsLoading(true);
        try {
            const response = await fetch(`/api/events?groupId=${groupId}`);
            if (!response.ok) throw new Error('Failed to fetch events');
            const eventsData: EventWithStats[] = await response.json();
            setEvents(eventsData);

            if (eventsData.length > 0) {
                // Auto-select the most recent event if none is selected
                const eventToSelect = selectedEvent 
                    ? eventsData.find(e => e.id === selectedEvent.id) || eventsData[0]
                    : eventsData[0];
                await selectEvent(eventToSelect);
            } else {
                setSelectedEvent(null);
                setAttendanceData([]);
            }
        } catch (err) {
            console.error('Failed to load events:', err);
            setError(err instanceof Error ? err.message : 'Failed to load events');
        } finally {
            setEventsLoading(false);
        }
    }, [selectedEvent]);

    const loadAttendanceForEvent = useCallback(async (eventId: number) => {
        setAttendanceLoading(true);
        try {
            const response = await fetch(`/api/attendance?eventId=${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch attendance');
            const data: PlayerWithAttendance[] = await response.json();
            setAttendanceData(data);
        } catch (err) {
            console.error('Failed to load attendance:', err);
            setError(err instanceof Error ? err.message : 'Failed to load attendance');
        } finally {
            setAttendanceLoading(false);
        }
    }, []);
    
    const selectEvent = useCallback(async (event: EventWithStats) => {
        setSelectedEvent(event);
        await loadAttendanceForEvent(event.id);
    }, [loadAttendanceForEvent]);

    const handleCreateGroup = async (newGroupCode: string): Promise<Group> => {
        const response = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: newGroupCode })
        });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to create group.');
        }
        const newGroup: Group = await response.json();
        await handleLoadGroup(newGroup.code);
        return newGroup;
    };
    
    const handleRenameGroup = useCallback(async (newCode: string) => {
        if (!activeGroup || !isGroupNameDirty) return;
        try {
            const response = await fetch('/api/groups', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId: activeGroup.id, newCode })
            });
            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to rename group');
            }
            const updatedGroup: Group = await response.json();
            setActiveGroup(updatedGroup);
            setGroupCodeInput(updatedGroup.code);
            localStorage.setItem('activeGroupCode', updatedGroup.code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to rename group');
            // Revert input to the last saved code
            setGroupCodeInput(activeGroup.code);
        }
    }, [activeGroup]);

    const handleDeleteGroup = async () => {
        if (!activeGroup) return;
        try {
            const response = await fetch(`/api/groups?groupId=${activeGroup.id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete group');
            setGroupCodeInput('');
            clearGroupState();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
        }
    };
    
    const handleAddPlayer = async (playerData: Omit<Player, 'id' | 'group_id'>) => {
        if (!activeGroup) throw new Error('No active group');
        const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...playerData, group_id: activeGroup.id })
        });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to add player');
        }
        await handleLoadGroup(activeGroup.code); // Reload all data
    };
    
    const handleCsvUpload = async (csvPlayers: Omit<Player, 'id' | 'group_id'>[]) => {
        if (!activeGroup) throw new Error('No active group');
        const response = await fetch('/api/players/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: activeGroup.id, players: csvPlayers })
        });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to upload CSV');
        }
        await handleLoadGroup(activeGroup.code); // Reload all data
    };

    const handleSaveChanges = async () => {
        if (!activeGroup || !isDirty) return;

        const playersToCreate = players
            .filter(p => typeof p.id === 'string' || p.id < 0)
            .map(({ id, ...rest }) => rest);
        
        const playersToUpdate = players.filter(p => {
            const original = originalPlayers.find(op => op.id === p.id);
            return original && !_.isEqual(p, original);
        });

        const originalPlayerIds = new Set(originalPlayers.map(p => p.id));
        const currentPlayerIds = new Set(players.map(p => p.id));
        const playersToDelete = [...originalPlayerIds].filter(id => !currentPlayerIds.has(id));

        try {
            const response = await fetch(`/api/players/bulk`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: activeGroup.id,
                    playersToCreate,
                    playersToUpdate,
                    playersToDelete
                })
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to save changes');
            }

            await handleLoadGroup(activeGroup.code);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error saving changes');
        }
    };

    const createEvent = useCallback(async (eventData: Omit<EventInput, 'group_id'>) => {
        if (!activeGroup) throw new Error('No active group selected');
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...eventData, group_id: activeGroup.id })
        });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to create event');
        }
        await loadEvents(activeGroup.id);
    }, [activeGroup, loadEvents]);

    const deleteEvent = useCallback(async (eventId: number) => {
        if (!activeGroup) return;
        try {
            const response = await fetch(`/api/events?eventId=${eventId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete event');
            await loadEvents(activeGroup.id); // Reload events
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete event');
        }
    }, [activeGroup, loadEvents]);

    const updateAttendance = useCallback(async (eventId: number, updates: AttendanceInput[]) => {
        if (!activeGroup) return;
        try {
            await fetch('/api/attendance?bulk=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            await loadEvents(activeGroup.id); // Refetch events for updated stats
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update attendance');
        }
    }, [activeGroup, loadEvents]);

    const duplicateEvent = useCallback(async (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string) => {
        if (!activeGroup) throw new Error('No active group selected');
        const response = await fetch('/api/events', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId, newName, newDate, newTime, newLocation })
        });
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(error || 'Failed to duplicate event');
        }
        await loadEvents(activeGroup.id);
    }, [activeGroup, loadEvents]);

    const isDirty = !_.isEqual(players, originalPlayers);
    const isGroupNameDirty = activeGroup ? activeGroup.code !== groupCodeInput : false;

    const handleClearGroup = () => {
        setGroupCodeInput('');
        clearGroupState();
    };

    return {
        groupCodeInput,
        setGroupCodeInput,
        activeGroup,
        players,
        setPlayers,
        loading,
        error,
        setError,
        isDirty,
        isGroupNameDirty,
        handleLoadGroup,
        handleClearGroup,
        handleCreateGroup,
        handleRenameGroup,
        handleDeleteGroup,
        handleAddPlayer,
        handleCsvUpload,
        // Events
        events,
        selectedEvent,
        attendanceData,
        eventsLoading,
        attendanceLoading,
        createEvent,
        updateAttendance,
        deleteEvent,
        selectEvent,
        handleSaveChanges,
        duplicateEvent
    };
}