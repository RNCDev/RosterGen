'use client';

import React from 'react';
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
import { useEventManagement } from '@/hooks/useEventManagement';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import { usePlayerPagination } from '@/hooks/usePlayerPagination';

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
    onDeleteSavedTeams: (eventId: number) => Promise<void>;
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
    onLoadTeamsForEvent,
    onDeleteSavedTeams,
}: EventsViewProps) {
    // Extract state management to custom hooks
    const eventManagement = useEventManagement(selectedEvent?.id, teamAlias1, teamAlias2);
    const { handleUpdateSingleAttendance } = useAttendanceManagement();
    const paginationState = usePlayerPagination(attendanceData, 20);

    const handleAttendanceToggle = async (playerId: number) => {
        if (!selectedEvent) return;
        
        try {
            await handleUpdateSingleAttendance(
                playerId,
                selectedEvent.id,
                !(attendanceData.find(p => p.id === playerId)?.is_attending_event ?? false),
                onToggleAttendance
            );
        } catch (error) {
            // Error handling is now managed in useGroupManager
            console.error('Failed to update attendance:', error);
        }
    };

    const handleLoadSavedTeams = async () => {
        if (!selectedEvent) return;
        try {
            const savedTeams = await onLoadTeamsForEvent(selectedEvent.id);
            eventManagement.setTeams(savedTeams);
            eventManagement.setShowTeams(true);
        } catch (error) {
            console.error('Failed to load saved teams:', error);
            // You could show a user-friendly error message here
        }
    };

    const handleDuplicateSubmit = async (eventId: number, newName: string, newDate: string, newTime?: string, newLocation?: string) => {
        await onDuplicateEvent(eventId, newName, newDate, newTime, newLocation);
        eventManagement.setDuplicateEventOpen(false);
        eventManagement.setEventToDuplicate(null);
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
                onCreateEvent={() => eventManagement.setCreateEventOpen(true)}
                onDeleteEvent={onDeleteEvent}
                onDuplicateEvent={eventManagement.handleDuplicateEvent}
            />

            {/* Right Column: Attendance */}
            <div className="flex-1 space-y-4">
                {selectedEvent ? (
                    <>
                        {!eventManagement.showTeams ? (
                            <>
                                <AttendanceControls
                                    selectedEvent={selectedEvent}
                                    isGeneratingTeams={eventManagement.isGeneratingTeams}
                                    onLoadSavedTeams={handleLoadSavedTeams}
                                    onGenerateTeams={() => group && eventManagement.handleGenerateTeams(selectedEvent, group)}
                                    onDeleteSavedTeams={onDeleteSavedTeams}
                                />

                                <AttendanceTable
                                    players={paginationState.paginatedItems}
                                    onAttendanceToggle={handleAttendanceToggle}
                                />

                                <PlayerPagination
                                    currentPage={paginationState.currentPage}
                                    totalPages={paginationState.totalPages}
                                    totalItems={attendanceData.length}
                                    itemsPerPage={paginationState.rowsPerPage}
                                    onPageChange={paginationState.handlePageChange}
                                    itemName="players"
                                />
                            </>
                        ) : (
                            <TeamsView 
                                teams={eventManagement.teams}
                                teamNames={{ team1: teamAlias1, team2: teamAlias2 }}
                                setTeamNames={({ team1, team2 }) => {
                                    setTeamAlias1(team1);
                                    setTeamAlias2(team2);
                                }}
                                onGenerateTeams={() => group && eventManagement.handleGenerateTeams(selectedEvent, group)}
                                attendingPlayerCount={attendanceData.filter(p => p.is_attending_event).length}
                                isGenerating={eventManagement.isGeneratingTeams}
                                onBack={() => eventManagement.setShowTeams(false)}
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
                isOpen={eventManagement.isCreateEventOpen}
                onClose={() => eventManagement.setCreateEventOpen(false)}
                onCreateEvent={onCreateEvent}
                group={group}
            />

            <DuplicateEventDialog
                isOpen={eventManagement.isDuplicateEventOpen}
                onClose={() => eventManagement.setDuplicateEventOpen(false)}
                onDuplicate={handleDuplicateSubmit}
                event={eventManagement.eventToDuplicate}
            />
        </div>
    );
}