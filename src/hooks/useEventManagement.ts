import { useState, useEffect, useCallback } from 'react';
import { type EventWithStats, type Teams, type Group } from '@/types/PlayerTypes';

export interface EventManagementState {
    isCreateEventOpen: boolean;
    isDuplicateEventOpen: boolean;
    isEditEventOpen: boolean;
    eventToDuplicate: EventWithStats | null;
    eventToEdit: EventWithStats | null;
    showTeams: boolean;
    teams: Teams;
    isGeneratingTeams: boolean;
    teamNames: { team1: string, team2: string };
    setCreateEventOpen: (open: boolean) => void;
    setDuplicateEventOpen: (open: boolean) => void;
    setEditEventOpen: (open: boolean) => void;
    setEventToDuplicate: (event: EventWithStats | null) => void;
    setEventToEdit: (event: EventWithStats | null) => void;
    setShowTeams: (show: boolean) => void;
    setTeams: (teams: Teams) => void;
    setTeamNames: (names: { team1: string, team2: string }) => void;
    setIsGeneratingTeams: (generating: boolean) => void;
    handleDuplicateEvent: (event: EventWithStats) => void;
    handleGenerateTeams: (selectedEvent: EventWithStats, group: Group, currentTeamNames: { team1: string, team2: string }) => Promise<void>;
    resetTeamsState: () => void;
}

export function useEventManagement(
    selectedEventId?: number
): EventManagementState {
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [isDuplicateEventOpen, setDuplicateEventOpen] = useState(false);
    const [isEditEventOpen, setEditEventOpen] = useState(false);
    const [eventToDuplicate, setEventToDuplicate] = useState<EventWithStats | null>(null);
    const [eventToEdit, setEventToEdit] = useState<EventWithStats | null>(null);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Teams>({});
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
    const [teamNames, setTeamNames] = useState({ team1: 'Red', team2: 'White' });

    // Reset teams view completely when a new event is selected
    useEffect(() => {
        setShowTeams(false);
        setTeams({});
    }, [selectedEventId]);

    const handleDuplicateEvent = (event: EventWithStats) => {
        setEventToDuplicate(event);
        setDuplicateEventOpen(true);
    };

    const handleGenerateTeams = useCallback(async (selectedEvent: EventWithStats, group: Group, currentTeamNames: { team1: string, team2: string }) => {
        setIsGeneratingTeams(true);
        try {
            // Add validation logging
            console.log('Team generation request:', {
                event_id: selectedEvent.id,
                group: group,
                team_names: currentTeamNames,
            });

            // Validate required data before making the request
            if (!selectedEvent?.id) {
                throw new Error('No event selected for team generation');
            }
            if (!group?.code) {
                throw new Error('Group is missing required code property');
            }

            const response = await fetch(`/api/teams?action=generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_id: selectedEvent.id,
                    group: group,
                    team_names: currentTeamNames,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Team generation API error:', errorText);
                throw new Error(`Failed to generate teams: ${errorText}`);
            }

            const data = await response.json();
            setTeams(data.teams);

            setTimeout(() => {
                setIsGeneratingTeams(false);
                setShowTeams(true);
            }, 800); // Small delay for animation

        } catch (error) {
            console.error('Failed to generate teams:', error);
            setIsGeneratingTeams(false);
            // You might want to show a toast or error message to the user here
        }
    }, []);

    const resetTeamsState = () => {
        setShowTeams(false);
        setTeams({});
    };

    return {
        isCreateEventOpen,
        isDuplicateEventOpen,
        isEditEventOpen,
        eventToDuplicate,
        eventToEdit,
        showTeams,
        teams,
        isGeneratingTeams,
        teamNames,
        setCreateEventOpen,
        setDuplicateEventOpen,
        setEditEventOpen,
        setEventToDuplicate,
        setEventToEdit,
        setShowTeams,
        setTeams,
        setTeamNames,
        setIsGeneratingTeams,
        handleDuplicateEvent,
        handleGenerateTeams,
        resetTeamsState
    };
} 