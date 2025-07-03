import { useState, useEffect } from 'react';
import { type EventWithStats, type Teams, type Group } from '@/types/PlayerTypes';

export interface EventManagementState {
    isCreateEventOpen: boolean;
    isDuplicateEventOpen: boolean;
    eventToDuplicate: EventWithStats | null;
    showTeams: boolean;
    teams: Teams;
    isGeneratingTeams: boolean;
    setCreateEventOpen: (open: boolean) => void;
    setDuplicateEventOpen: (open: boolean) => void;
    setEventToDuplicate: (event: EventWithStats | null) => void;
    setShowTeams: (show: boolean) => void;
    setTeams: (teams: Teams) => void;
    setIsGeneratingTeams: (generating: boolean) => void;
    handleDuplicateEvent: (event: EventWithStats) => void;
    handleGenerateTeams: (selectedEvent: EventWithStats, group: Group) => Promise<void>;
    resetTeamsState: () => void;
}

export function useEventManagement(
    selectedEventId?: number,
    teamAlias1?: string,
    teamAlias2?: string
): EventManagementState {
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [isDuplicateEventOpen, setDuplicateEventOpen] = useState(false);
    const [eventToDuplicate, setEventToDuplicate] = useState<EventWithStats | null>(null);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Teams>({});
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);

    // Reset teams when selected event or team aliases change
    useEffect(() => {
        setShowTeams(false);
        setTeams({});
    }, [selectedEventId, teamAlias1, teamAlias2]);

    const handleDuplicateEvent = (event: EventWithStats) => {
        setEventToDuplicate(event);
        setDuplicateEventOpen(true);
    };

    const handleGenerateTeams = async (selectedEvent: EventWithStats, group: Group) => {
        setIsGeneratingTeams(true);
        try {
            const response = await fetch(`/api/teams?action=generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    event_id: selectedEvent.id, 
                    group: group 
                }),
            });

            if (!response.ok) throw new Error(await response.text());
            
            const data = await response.json();
            setTeams(data.teams);
            
            setTimeout(() => {
                setIsGeneratingTeams(false);
                setShowTeams(true);
            }, 800); // Small delay for animation

        } catch (error) {
            console.error('Failed to generate teams:', error);
            setIsGeneratingTeams(false);
        }
    };

    const resetTeamsState = () => {
        setShowTeams(false);
        setTeams({});
    };

    return {
        isCreateEventOpen,
        isDuplicateEventOpen,
        eventToDuplicate,
        showTeams,
        teams,
        isGeneratingTeams,
        setCreateEventOpen,
        setDuplicateEventOpen,
        setEventToDuplicate,
        setShowTeams,
        setTeams,
        setIsGeneratingTeams,
        handleDuplicateEvent,
        handleGenerateTeams,
        resetTeamsState
    };
} 