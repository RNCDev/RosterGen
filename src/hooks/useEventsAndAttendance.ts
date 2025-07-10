'use client';

import { useState, useCallback } from 'react';
import { 
  type EventWithStats, 
  type PlayerWithAttendance, 
  type AttendanceInput, 
  type EventInput,
  type Teams
} from '@/types/PlayerTypes';

export interface EventsAndAttendanceState {
  events: EventWithStats[];
  selectedEvent: EventWithStats | null;
  attendanceData: PlayerWithAttendance[];
  eventsLoading: boolean;
  attendanceLoading: boolean;
  setEvents: (events: EventWithStats[]) => void;
  setSelectedEvent: (event: EventWithStats | null) => void;
  setAttendanceData: (data: PlayerWithAttendance[]) => void;
  loadEvents: (groupId: number) => Promise<void>;
  loadAttendanceForEvent: (eventId: number) => Promise<void>;
  selectEvent: (event: EventWithStats) => Promise<void>;
  createEvent: (eventData: Omit<EventInput, 'group_id'>, groupId: number) => Promise<void>;
  deleteEvent: (eventId: number, groupId: number) => Promise<void>;
  updateAttendance: (eventId: number, updates: AttendanceInput[], groupId: number) => Promise<void>;
  toggleAttendance: (playerId: number, eventId: number, groupId: number) => Promise<void>;
  duplicateEvent: (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string, groupId?: number) => Promise<void>;
  handleSaveTeamsForEvent: (eventId: number, teams: Teams, teamNames: { team1: string, team2: string }, groupId: number, onTeamDataChangeSuccess?: () => void) => Promise<void>;
  handleLoadTeamsForEvent: (eventId: number) => Promise<{ teams: Teams, teamNames: { team1: string, team2: string } | null }>;
  handleDeleteSavedTeams: (eventId: number, groupId: number, onTeamDataChangeSuccess?: () => void) => Promise<void>;
  clearEvents: () => void;
}

export function useEventsAndAttendance(setError: (error: string | null) => void): EventsAndAttendanceState {
  const [events, setEvents] = useState<EventWithStats[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithStats | null>(null);
  const [attendanceData, setAttendanceData] = useState<PlayerWithAttendance[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [attendanceLoading, setAttendanceLoading] = useState<boolean>(false);

  const loadEvents = useCallback(async (groupId: number) => {
    if (!groupId) return;
    setEventsLoading(true);
    try {
      const response = await fetch(`/api/events?groupId=${groupId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const eventsData: EventWithStats[] = await response.json();
      setEvents(eventsData);

      if (eventsData.length > 0) {
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
  }, [selectedEvent, setError]);

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
  }, [setError]);

  const selectEvent = useCallback(async (event: EventWithStats) => {
    setSelectedEvent(event);
    await loadAttendanceForEvent(event.id);
  }, [loadAttendanceForEvent]);

  const createEvent = useCallback(async (eventData: Omit<EventInput, 'group_id'>, groupId: number) => {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...eventData, group_id: groupId })
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create event');
    }
    await loadEvents(groupId);
  }, [loadEvents]);

  const deleteEvent = useCallback(async (eventId: number, groupId: number) => {
    try {
      const response = await fetch(`/api/events?eventId=${eventId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete event');
      await loadEvents(groupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  }, [loadEvents, setError]);

  const updateAttendance = useCallback(async (eventId: number, updates: AttendanceInput[], groupId: number) => {
    const originalAttendanceData = [...attendanceData];
    
    // Optimistic update
    const optimisticUpdate = attendanceData.map(player => {
      const update = updates.find(u => u.player_id === player.id);
      if (update) {
        return {
          ...player,
          is_attending_event: update.is_attending
        };
      }
      return player;
    });
    
    setAttendanceData(optimisticUpdate);
    
    try {
      await fetch('/api/attendance?bulk=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      await loadEvents(groupId);
    } catch (err) {
      setAttendanceData(originalAttendanceData);
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
      throw err;
    }
  }, [attendanceData, loadEvents, setError]);

  const toggleAttendance = useCallback(async (playerId: number, eventId: number, groupId: number) => {
    const player = attendanceData.find(p => p.id === playerId);
    if (!player) return;
    
    const updates: AttendanceInput[] = [{
      player_id: playerId,
      event_id: eventId,
      is_attending: !player.is_attending_event
    }];
    
    await updateAttendance(eventId, updates, groupId);
  }, [attendanceData, updateAttendance]);

  const duplicateEvent = async (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string, groupId?: number) => {
    try {
      const response = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          newName,
          newDate,
          newTime,
          newLocation
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate event');
      }

      if (groupId) {
        await loadEvents(groupId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate event');
    }
  };

  const handleSaveTeamsForEvent = async (
    eventId: number, 
    teams: Teams, 
    teamNames: { team1: string, team2: string }, 
    groupId: number,
    onTeamDataChangeSuccess?: () => void
  ): Promise<void> => {
    try {
      const response = await fetch('/api/events/teams', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, teams, teamNames })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save teams');
      }

      await loadEvents(groupId);
      if (onTeamDataChangeSuccess) {
        onTeamDataChangeSuccess();
      }
    } catch (err) {
      console.error('Error saving teams:', err);
      throw err;
    }
  };

  const handleLoadTeamsForEvent = useCallback(async (eventId: number): Promise<{ teams: Teams, teamNames: { team1: string, team2: string } | null }> => {
    try {
      const response = await fetch(`/api/events/teams?eventId=${eventId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load teams for event');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams for event');
      throw err;
    }
  }, [setError]);

  const handleDeleteSavedTeams = useCallback(async (eventId: number, groupId: number, onTeamDataChangeSuccess?: () => void) => {
    try {
      const response = await fetch('/api/events/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete saved teams');
      }
      await loadEvents(groupId);
      if (onTeamDataChangeSuccess) {
        onTeamDataChangeSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete saved teams');
    }
  }, [loadEvents, setError]);

  const clearEvents = () => {
    setEvents([]);
    setSelectedEvent(null);
    setAttendanceData([]);
  };

  return {
    events,
    selectedEvent,
    attendanceData,
    eventsLoading,
    attendanceLoading,
    setEvents,
    setSelectedEvent,
    setAttendanceData,
    loadEvents,
    loadAttendanceForEvent,
    selectEvent,
    createEvent,
    deleteEvent,
    updateAttendance,
    toggleAttendance,
    duplicateEvent,
    handleSaveTeamsForEvent,
    handleLoadTeamsForEvent,
    handleDeleteSavedTeams,
    clearEvents,
  };
} 