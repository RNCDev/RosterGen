'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
import { 
    type EventWithStats, 
    type EventDB, 
    type PlayerWithAttendance, 
    type AttendanceInput,
    type Teams
} from '@/types/PlayerTypes';
import CreateEventDialog from './dialogs/CreateEventDialog';
import TeamsView from './TeamsView';

interface EventsViewProps {
    events: EventWithStats[];
    selectedEvent: EventDB | null;
    attendanceData: PlayerWithAttendance[];
    onEventSelect: (event: EventDB) => void;
    onCreateEvent: (eventData: any) => Promise<EventDB>;
    onDeleteEvent: (eventId: number) => Promise<void>;
    onUpdateAttendance: (eventId: number, updates: AttendanceInput[]) => Promise<void>;
    groupCode: string;
    eventsLoading: boolean;
    attendanceLoading: boolean;
}

export default function EventsView({
    events,
    selectedEvent,
    attendanceData,
    onEventSelect,
    onCreateEvent,
    onDeleteEvent,
    onUpdateAttendance,
    groupCode,
    eventsLoading,
    attendanceLoading
}: EventsViewProps) {
    const [localAttendance, setLocalAttendance] = useState<PlayerWithAttendance[]>(attendanceData);
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });
    const [teamNames, setTeamNames] = useState({ team1: 'Red', team2: 'White' });
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);

    // State for bulk edit mode
    const [isBulkEditMode, setIsBulkEditMode] = useState(false);
    const [stagedChanges, setStagedChanges] = useState<Map<number, boolean>>(new Map());

    useEffect(() => {
        setLocalAttendance(attendanceData);
    }, [attendanceData]);

    useEffect(() => {
        // When the selected event changes, hide the teams view and reset teams data
        setShowTeams(false);
        setTeams({
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        });
    }, [selectedEvent?.id]);

    const handleAttendanceToggle = async (playerId: number) => {
        if (!selectedEvent) return;
        
        // Optimistic update
        const originalState = [...localAttendance];
        const playerIndex = originalState.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;

        const updatedPlayer = {
            ...originalState[playerIndex],
            is_attending_event: !originalState[playerIndex].is_attending_event
        };
        
        const newState = [...originalState];
        newState[playerIndex] = updatedPlayer;
        setLocalAttendance(newState);

        // API call
        const updates: AttendanceInput[] = [{
            player_id: playerId,
            event_id: selectedEvent.id,
            is_attending: updatedPlayer.is_attending_event
        }];

        try {
            await onUpdateAttendance(selectedEvent.id, updates);
        } catch (error) {
            console.error('Failed to update attendance, reverting:', error);
            // Revert on error
            setLocalAttendance(originalState);
        }
    };

    const handleGenerateTeams = async () => {
        if (!selectedEvent) return;
        setIsGeneratingTeams(true);
        try {
            const response = await fetch(`/api/teams?action=generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    event_id: selectedEvent.id, 
                    group_code: groupCode 
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

    const handleEnterBulkEditMode = () => {
        const initialStagedChanges = new Map<number, boolean>();
        localAttendance.forEach(player => {
            initialStagedChanges.set(player.id, player.is_attending_event ?? false);
        });
        setStagedChanges(initialStagedChanges);
        setIsBulkEditMode(true);
    };

    const handleStagedChange = (playerId: number, isAttending: boolean) => {
        setStagedChanges(new Map(stagedChanges.set(playerId, isAttending)));
    };

    const handleSaveChanges = async () => {
        if (!selectedEvent) return;

        const changes: AttendanceInput[] = [];
        const originalAttendance = new Map(
            localAttendance.map(p => [p.id, p.is_attending_event ?? false])
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
    
    if (!groupCode) {
        return (
            <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Group Selected</h3>
                <p className="text-gray-500">Please load or create a group to view events.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Events</h2>
                    <p className="text-gray-600">Manage events and track attendance for {groupCode}</p>
                </div>
                <button
                    onClick={() => setCreateEventOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Event
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Events List (1/3 width) */}
                <div className="lg:col-span-1 space-y-3">
                    <h3 className="font-semibold text-gray-900 px-1">Upcoming Events</h3>
                    {eventsLoading ? (
                         <div className="text-center py-8">
                            <div className="w-6 h-6 mx-auto mb-2 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <p className="text-xs text-gray-500">Loading events...</p>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2 text-sm font-medium">No events found</p>
                            <p className="text-xs text-gray-500">Click 'Create Event' to start</p>
                        </div>
                    ) : (
                        events.map(event => (
                            <EventCard
                                key={event.id}
                                event={event}
                                isSelected={selectedEvent?.id === event.id}
                                onClick={() => onEventSelect(event)}
                                onDelete={() => onDeleteEvent(event.id)}
                            />
                        ))
                    )}
                </div>

                {/* Main Content Area (2/3 width) */}
                <div className="lg:col-span-2 space-y-4">
                    {selectedEvent ? (
                        <>
                            {!showTeams ? (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Event Attendance</h3>

                                        {isBulkEditMode ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setIsBulkEditMode(false);
                                                        setStagedChanges(new Map());
                                                    }}
                                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveChanges}
                                                    className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={handleEnterBulkEditMode}
                                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                                >
                                                    Bulk Edit
                                                </button>
                                                {localAttendance.filter(p => p.is_attending_event).length >= 2 && (
                                                    <button
                                                        onClick={handleGenerateTeams}
                                                        disabled={isGeneratingTeams}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isGeneratingTeams ? (
                                                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                                                        ) : (
                                                            <><ArrowRightLeft className="w-4 h-4" />Generate Teams</>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {attendanceLoading ? (
                                        <div className="text-center py-8">
                                            <div className="w-6 h-6 mx-auto mb-2 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                            <p className="text-sm text-gray-600">Loading attendance...</p>
                                        </div>
                                    ) : (
                                        <AttendanceList
                                            players={localAttendance}
                                            onAttendanceToggle={handleAttendanceToggle}
                                            isBulkEditMode={isBulkEditMode}
                                            stagedChanges={stagedChanges}
                                            onStagedChange={handleStagedChange}
                                        />
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Generated Teams</h3>
                                        <button
                                            onClick={() => setShowTeams(false)}
                                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Back to Attendance
                                        </button>
                                    </div>
                                    <TeamsView 
                                        teams={teams}
                                        teamNames={teamNames}
                                        setTeamNames={setTeamNames}
                                        onGenerateTeams={handleGenerateTeams}
                                        attendingPlayerCount={localAttendance.filter(p => p.is_attending_event).length}
                                        isGenerating={isGeneratingTeams}
                                    />
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
                            <div className="text-center">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">Select an event</p>
                                <p className="text-sm text-gray-500">Choose an event from the list to view its attendance.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CreateEventDialog
                isOpen={isCreateEventOpen}
                onClose={() => setCreateEventOpen(false)}
                onCreateEvent={onCreateEvent}
                groupCode={groupCode}
            />
        </div>
    );
}

// Compact Event Card
function EventCard({ event, isSelected, onClick, onDelete }: { event: EventWithStats; isSelected: boolean; onClick: () => void; onDelete: () => void; }) {
    return (
        <div 
            className={`p-2 rounded-lg cursor-pointer transition-all border ${
                isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300' 
                    : 'bg-white hover:bg-gray-50 border-gray-200'
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-sm text-gray-800">{event.name}</h4>
                    <p className="text-xs text-gray-500">
                        {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-0.5 opacity-50 hover:opacity-100"
                    title="Delete Event"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-gray-100">
                 <div className="flex justify-between items-center text-[11px] leading-tight">
                    <span className="font-medium text-gray-600">
                        {event.attending_count || 0} / {event.total_players || 0} Attending
                    </span>
                    <span className="font-bold text-green-600">
                        {event.attendance_rate || 0}%
                    </span>
                </div>
                <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${event.attendance_rate || 0}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

// Larger Attendance List
function AttendanceList({ players, onAttendanceToggle, isBulkEditMode, stagedChanges, onStagedChange }: { players: PlayerWithAttendance[]; onAttendanceToggle: (playerId: number) => void; isBulkEditMode: boolean; stagedChanges: Map<number, boolean>; onStagedChange: (playerId: number, isAttending: boolean) => void; }) {
    return (
        <div className="space-y-1 max-h-[70vh] overflow-y-auto bg-white/50 p-2 rounded-lg border">
            {players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-2 rounded-md even:bg-gray-50/80">
                    <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${player.is_attending_event ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <div>
                            <span className="font-medium text-gray-800">{player.first_name} {player.last_name}</span>
                            <span className="text-xs text-gray-500 ml-2">({player.skill})</span>
                        </div>
                    </div>

                    {isBulkEditMode ? (
                        <input
                            type="checkbox"
                            checked={stagedChanges.get(player.id) ?? false}
                            onChange={(e) => onStagedChange(player.id, e.target.checked)}
                            className="w-5 h-5 rounded text-blue-500 focus:ring-blue-500"
                        />
                    ) : (
                        <button
                            onClick={() => onAttendanceToggle(player.id)}
                            className={`px-3 py-1 text-xs rounded-full transition-colors ${
                                player.is_attending_event 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                        >
                            {player.is_attending_event ? 'Attending' : 'Not Attending'}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}