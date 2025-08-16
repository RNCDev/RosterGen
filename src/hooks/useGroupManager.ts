'use client';

import { useEffect, useCallback } from 'react';
import { useGroupState } from './useGroupState';
import { usePlayerManagement } from './usePlayerManagement';
import { useEventsAndAttendance } from './useEventsAndAttendance';
import { type Player, type PlayerInput, type EventInput } from '@/types/PlayerTypes';

export function useGroupManager(onTeamDataChangeSuccess?: () => void) {
    const groupState = useGroupState();
    const playerState = usePlayerManagement();
    const eventsState = useEventsAndAttendance(groupState.setError);

    const loadPlayersAndEvents = useCallback(async (groupId: number) => {
        try {
            // Load players first
            const playersResponse = await fetch(`/api/players?groupId=${groupId}`);
            if (playersResponse.ok) {
                const playersData: Player[] = await playersResponse.json();
                playerState.setPlayers(playersData);
                playerState.setOriginalPlayers(playersData);
            } else if (playersResponse.status !== 404) {
                throw new Error('Failed to fetch players');
            }
            
            // Then load events
            const eventsData = await eventsState.loadEvents(groupId);

            // If events are found, select the first one by default
            if (eventsData && eventsData.length > 0) {
                await eventsState.selectEvent(eventsData[0]);
            } else {
                // No events found - clear selected event and attendance data
                eventsState.setSelectedEvent(null);
                eventsState.setAttendanceData([]);
            }

        } catch (err) {
            groupState.setError(err instanceof Error ? err.message : 'Failed to load data');
        }
    }, [
        playerState.setPlayers, 
        playerState.setOriginalPlayers, 
        eventsState.loadEvents,
        eventsState.selectEvent,
        eventsState.setSelectedEvent,
        eventsState.setAttendanceData,
        groupState.setError
    ]);

    // Load players when group changes
    useEffect(() => {
        if (groupState.activeGroup) {
            loadPlayersAndEvents(groupState.activeGroup.id);
        } else {
            playerState.clearPlayers();
            eventsState.clearEvents();
        }
    }, [
        groupState.activeGroup, 
        loadPlayersAndEvents, 
        playerState.clearPlayers, 
        eventsState.clearEvents
    ]);

    // Helper function to reload all data
    const reloadData = async () => {
        if (groupState.activeGroup) {
            await loadPlayersAndEvents(groupState.activeGroup.id);
        }
    };

    // Wrapped functions that include necessary parameters
    const handleAddPlayer = async (playerData: Omit<PlayerInput, 'group_id'>) => {
        if (!groupState.activeGroup) throw new Error('No active group');
        await playerState.handleAddPlayer(
            { ...playerData, is_active: true }, 
            groupState.activeGroup.id, 
            reloadData
        );
    };

    const handleCsvUpload = async (csvPlayers: Omit<PlayerInput, 'group_id'>[]) => {
        if (!groupState.activeGroup) throw new Error('No active group');
        const playersWithActive = csvPlayers.map(p => ({ ...p, is_active: true }));
        await playerState.handleCsvUpload(
            playersWithActive, 
            groupState.activeGroup.id, 
            reloadData
        );
    };

    const handleSaveChanges = async () => {
        if (!groupState.activeGroup) return;
        await playerState.handleSaveChanges(groupState.activeGroup.id, reloadData);
    };

    const createEvent = async (eventData: any) => {
        if (!groupState.activeGroup) throw new Error('No active group selected');
        await eventsState.createEvent(eventData, groupState.activeGroup.id);
    };

    const deleteEvent = async (eventId: number) => {
        if (!groupState.activeGroup) return;
        await eventsState.deleteEvent(eventId, groupState.activeGroup.id);
    };

    const updateAttendance = async (eventId: number, updates: any[]) => {
        if (!groupState.activeGroup) return;
        await eventsState.updateAttendance(eventId, updates, groupState.activeGroup.id);
    };

    const toggleAttendance = async (playerId: number, eventId: number) => {
        if (!groupState.activeGroup) return;
        await eventsState.toggleAttendance(playerId, eventId, groupState.activeGroup.id);
    };

    const duplicateEvent = async (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string, newTeamSnapEventId?: string) => {
        if (!groupState.activeGroup) return;
        await eventsState.duplicateEvent(eventId, newName, newDate, newTime, newLocation, newTeamSnapEventId, groupState.activeGroup.id);
    };

    const handleSaveTeamsForEvent = async (eventId: number, teams: any, teamNames: any) => {
        if (!groupState.activeGroup) return;
        await eventsState.handleSaveTeamsForEvent(
            eventId, 
            teams, 
            teamNames, 
            groupState.activeGroup.id,
            onTeamDataChangeSuccess
        );
    };

    const handleDeleteSavedTeams = async (eventId: number) => {
        if (!groupState.activeGroup) return;
        await eventsState.handleDeleteSavedTeams(
            eventId, 
            groupState.activeGroup.id,
            onTeamDataChangeSuccess
        );
    };

    const editEvent = async (eventId: number, eventData: Partial<Omit<EventInput, 'group_id'>>) => {
        if (!groupState.activeGroup) return;
        await eventsState.editEvent(eventId, eventData, groupState.activeGroup.id);
    };

    return {
        // Group state
        groupCodeInput: groupState.groupCodeInput,
        setGroupCodeInput: groupState.setGroupCodeInput,
        activeGroup: groupState.activeGroup,
        loading: groupState.loading,
        error: groupState.error,
        setError: groupState.setError,
        isGroupNameDirty: groupState.isGroupNameDirty,
        handleLoadGroup: groupState.handleLoadGroup,
        handleClearGroup: () => groupState.handleClearGroup(playerState.clearPlayers),
        handleCreateGroup: groupState.handleCreateGroup,
        handleRenameGroup: groupState.handleRenameGroup,
        handleDeleteGroup: groupState.handleDeleteGroup,
        handleUpdateTeamAliases: groupState.handleUpdateTeamAliases,
        handleUpdateTeamSnapId: groupState.handleUpdateTeamSnapId,
        teamAlias1: groupState.teamAlias1,
        teamAlias2: groupState.teamAlias2,
        teamSnapTeamId: groupState.teamSnapTeamId,
        setTeamAlias1: groupState.setTeamAlias1,
        setTeamAlias2: groupState.setTeamAlias2,
        setTeamSnapTeamId: groupState.setTeamSnapTeamId,

        // Player state
        players: playerState.players,
        setPlayers: playerState.setPlayers,
        isDirty: playerState.isDirty,
        handleAddPlayer,
        handleCsvUpload,
        handleSaveChanges,

        // Events and attendance state
        events: eventsState.events,
        selectedEvent: eventsState.selectedEvent,
        attendanceData: eventsState.attendanceData,
        eventsLoading: eventsState.eventsLoading,
        attendanceLoading: eventsState.attendanceLoading,
        selectEvent: eventsState.selectEvent,
        createEvent,
        deleteEvent,
        updateAttendance,
        toggleAttendance,
        duplicateEvent,
        editEvent,
        handleSaveTeamsForEvent,
        handleLoadTeamsForEvent: eventsState.handleLoadTeamsForEvent,
        handleDeleteSavedTeams,
    };
}