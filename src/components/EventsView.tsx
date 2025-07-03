'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { 
    type EventWithStats, 
    type PlayerWithAttendance, 
    type AttendanceInput,
    type Teams,
    type Group,
    type EventInput
} from '@/types/PlayerTypes';
import CreateEventDialog from './dialogs/CreateEventDialog';
import DuplicateEventDialog from './dialogs/DuplicateEventDialog';
import TeamsView from './TeamsView';
import EventsList from './EventsList';
import AttendanceTable from './AttendanceTable';
import AttendanceControls from './AttendanceControls';
import PlayerPagination from './PlayerPagination';

interface EventsViewProps {
    events: EventWithStats[];
    selectedEvent: EventWithStats | null;
    attendanceData: PlayerWithAttendance[];
    onEventSelect: (event: EventWithStats) => void;
    onCreateEvent: (eventData: Omit<EventInput, 'group_id'>) => Promise<void>;
    onDeleteEvent: (eventId: number) => Promise<void>;
    onUpdateAttendance: (eventId: number, updates: AttendanceInput[]) => Promise<void>;
    onToggleAttendance: (playerId: number, eventId: number) => Promise<void>;
    onDuplicateEvent: (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string) => Promise<void>;
    group: Group | null;
    eventsLoading: boolean;
    attendanceLoading: boolean;
    teamAlias1: string;
    setTeamAlias1: React.Dispatch<React.SetStateAction<string>>;
    teamAlias2: string;
    setTeamAlias2: React.Dispatch<React.SetStateAction<string>>;
    onUpdateTeamAliases: (alias1: string, alias2: string) => Promise<void>;
    onSaveTeamsForEvent: (eventId: number, teams: Teams) => Promise<void>;
    onLoadTeamsForEvent: (eventId: number) => Promise<Teams>;
}

export default function EventsView({
    events,
    selectedEvent,
    attendanceData,
    onEventSelect,
    onCreateEvent,
    onDeleteEvent,
    onUpdateAttendance,
    onToggleAttendance,
    onDuplicateEvent,
    group,
    eventsLoading,
    attendanceLoading,
    teamAlias1,
    setTeamAlias1,
    teamAlias2,
    setTeamAlias2,
    onUpdateTeamAliases,
    onSaveTeamsForEvent,
    onLoadTeamsForEvent
}: EventsViewProps) {
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [isDuplicateEventOpen, setDuplicateEventOpen] = useState(false);
    const [eventToDuplicate, setEventToDuplicate] = useState<EventWithStats | null>(null);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Teams>({});
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

    // State for bulk edit mode
    const [isBulkEditMode, setIsBulkEditMode] = useState(false);
    const [stagedChanges, setStagedChanges] = useState<Map<number, boolean>>(new Map());

    useEffect(() => {
        // When the selected event or team aliases change, hide the teams view and reset teams data
        setShowTeams(false);
        setTeams({}); // Reset teams to empty object
    }, [selectedEvent?.id, teamAlias1, teamAlias2]);

    const handleAttendanceToggle = async (playerId: number) => {
        if (!selectedEvent) return;
        
        try {
            await onToggleAttendance(playerId, selectedEvent.id);
        } catch (error) {
            // Error handling is now managed in useGroupManager
            console.error('Failed to update attendance:', error);
        }
    };

    const handleGenerateTeams = async () => {
        if (!selectedEvent || !group) return;
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

    const handleLoadSavedTeams = async () => {
        if (!selectedEvent) return;
        try {
            const savedTeams = await onLoadTeamsForEvent(selectedEvent.id);
            setTeams(savedTeams);
            setShowTeams(true);
        } catch (error) {
            console.error('Failed to load saved teams:', error);
            // You could show a user-friendly error message here
        }
    };

    const handleEnterBulkEditMode = () => {
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

    const handleSaveChanges = async () => {
        if (!selectedEvent) return;

        const changes: AttendanceInput[] = [];
        const originalAttendance = new Map(
            attendanceData.map(p => [p.id, p.is_attending_event ?? false])
        );

        for (const [playerId, isAttending] of stagedChanges.entries()) {
            if (originalAttendance.get(playerId) !== isAttending) {
                changes.push({
                    player_id: playerId,
                    event_id: selectedEvent.id,
                    is_attending: isAttending,
                });
            }
        }

        if (changes.length > 0) {
            await onUpdateAttendance(selectedEvent.id, changes);
        }

        setIsBulkEditMode(false);
        setStagedChanges(new Map());
    };

    const paginatedAttendance = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return attendanceData.slice(start, end);
    }, [attendanceData, currentPage]);

    const totalPages = Math.ceil(attendanceData.length / PAGE_SIZE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleDuplicateEvent = (event: EventWithStats) => {
        setEventToDuplicate(event);
        setDuplicateEventOpen(true);
    };

    const handleDuplicateSubmit = async (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string) => {
        await onDuplicateEvent(eventId, newName, newDate, newTime, newLocation);
        setDuplicateEventOpen(false);
        setEventToDuplicate(null);
    };
    
    if (!group) {
        return (
            <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Group Selected</h3>
                <p className="text-gray-500">Please load or create a group to view events.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
            {/* Left Column: Events List & Actions */}
            <EventsList
                events={events}
                selectedEvent={selectedEvent}
                eventsLoading={eventsLoading}
                onEventSelect={onEventSelect}
                onCreateEvent={() => setCreateEventOpen(true)}
                onDeleteEvent={onDeleteEvent}
                onDuplicateEvent={handleDuplicateEvent}
            />

            {/* Right Column: Attendance */}
            <div className="flex-1 space-y-4">
                {selectedEvent ? (
                    <>
                        {!showTeams ? (
                            <>
                                <AttendanceControls
                                    selectedEvent={selectedEvent}
                                    isBulkEditMode={isBulkEditMode}
                                    isGeneratingTeams={isGeneratingTeams}
                                    onEnterBulkEditMode={handleEnterBulkEditMode}
                                    onExitBulkEditMode={handleExitBulkEditMode}
                                    onSaveChanges={handleSaveChanges}
                                    onLoadSavedTeams={handleLoadSavedTeams}
                                    onGenerateTeams={handleGenerateTeams}
                                />

                                <AttendanceTable
                                    players={paginatedAttendance}
                                    onAttendanceToggle={handleAttendanceToggle}
                                    isBulkEditMode={isBulkEditMode}
                                    stagedChanges={stagedChanges}
                                    onStagedChange={handleStagedChange}
                                />

                                <PlayerPagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={attendanceData.length}
                                    itemsPerPage={PAGE_SIZE}
                                    onPageChange={handlePageChange}
                                    itemName="players"
                                />
                            </>
                        ) : (
                            <TeamsView 
                                teams={teams}
                                teamNames={{ team1: teamAlias1, team2: teamAlias2 }}
                                setTeamNames={({ team1, team2 }) => {
                                    setTeamAlias1(team1);
                                    setTeamAlias2(team2);
                                }}
                                onGenerateTeams={handleGenerateTeams}
                                attendingPlayerCount={attendanceData.filter(p => p.is_attending_event).length}
                                isGenerating={isGeneratingTeams}
                                onBack={() => setShowTeams(false)}
                                onSaveTeamNames={onUpdateTeamAliases}
                                selectedEvent={selectedEvent}
                                onSaveTeamsForEvent={onSaveTeamsForEvent}
                            />
                        )}
                    </>
                ) : (
                    <div className="text-center py-24 bg-gray-50/50 rounded-lg">
                        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Select an Event</h3>
                        <p className="text-gray-500">Choose an event from the list to see who's playing.</p>
                    </div>
                )}
            </div>

            <CreateEventDialog
                isOpen={isCreateEventOpen}
                onClose={() => setCreateEventOpen(false)}
                onCreateEvent={onCreateEvent}
                group={group}
            />

            <DuplicateEventDialog
                isOpen={isDuplicateEventOpen}
                onClose={() => setDuplicateEventOpen(false)}
                onDuplicate={handleDuplicateSubmit}
                event={eventToDuplicate}
            />
        </div>
    );
}