'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Calendar, 
    Users, 
    Plus, 
    Trash2, 
    ArrowRightLeft,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from 'lucide-react';
import { 
    type EventWithStats, 
    type EventDB, 
    type PlayerWithAttendance, 
    type AttendanceInput,
    type Teams
} from '@/types/PlayerTypes';
import CreateEventDialog from './dialogs/CreateEventDialog';
import TeamsView from './TeamsView';
import { Button } from './ui/Button';

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
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

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

    const paginatedAttendance = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return localAttendance.slice(start, end);
    }, [localAttendance, currentPage]);

    const totalPages = Math.ceil(localAttendance.length / PAGE_SIZE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
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
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
            {/* Left Column: Events List & Actions */}
            <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
                <div className="space-y-2">
                     <h2 className="text-lg font-semibold text-gray-800">Events</h2>
                     <p className="text-sm text-gray-600">Select an event to view attendance.</p>
                </div>

                <Button onClick={() => setCreateEventOpen(true)} className="w-full justify-center btn-primary">
                    <Plus size={16} className="mr-2"/> Create Event
                </Button>
                
                <div className="space-y-3">
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
            </div>

             {/* Right Column: Attendance */}
            <div className="flex-1 space-y-4">
                 {selectedEvent ? (
                    <>
                        {!showTeams ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Event Attendance for <span className="text-blue-600">{selectedEvent.name}</span>
                                    </h3>

                                    {isBulkEditMode ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setIsBulkEditMode(false);
                                                    setStagedChanges(new Map());
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleSaveChanges}
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" onClick={handleEnterBulkEditMode}>
                                                Bulk Edit
                                            </Button>
                                            <Button
                                                onClick={handleGenerateTeams}
                                                disabled={isGeneratingTeams}
                                                className="btn-primary"
                                            >
                                                <ArrowRightLeft className={`w-4 h-4 mr-2 ${isGeneratingTeams ? 'animate-spin' : ''}`} />
                                                {isGeneratingTeams ? 'Generating...' : 'Generate Teams'}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <AttendanceTable
                                    players={paginatedAttendance}
                                    onAttendanceToggle={handleAttendanceToggle}
                                    isBulkEditMode={isBulkEditMode}
                                    stagedChanges={stagedChanges}
                                    onStagedChange={handleStagedChange}
                                />

                                {/* Pagination */}
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        Showing {Math.min(localAttendance.length > 0 ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0, localAttendance.length)}
                                        - {Math.min(currentPage * PAGE_SIZE, localAttendance.length)} of {localAttendance.length} players
                                    </div>
                                     {totalPages > 1 && (
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                                <ChevronsLeft className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
                                            <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                                                <ChevronsRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                     )}
                                </div>
                            </>
                        ) : (
                             <TeamsView 
                                teams={teams}
                                teamNames={teamNames} 
                                setTeamNames={setTeamNames} 
                                onGenerateTeams={handleGenerateTeams}
                                attendingPlayerCount={localAttendance.filter(p => p.is_attending_event).length}
                                isGenerating={isGeneratingTeams}
                                onBack={() => setShowTeams(false)}
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
                groupCode={groupCode}
            />
        </div>
    );
}

// Compact Event Card
function EventCard({ event, isSelected, onClick, onDelete }: { event: EventWithStats; isSelected: boolean; onClick: () => void; onDelete: () => void; }) {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div 
            onClick={onClick}
            className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'
            }`}
        >
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>{event.name}</p>
                    <p className="text-sm text-gray-500">{new Date(event.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                </div>
                <button
                    onClick={handleDelete}
                    className={`p-1 rounded-md transition-colors ${
                        isSelected 
                            ? 'text-blue-600 hover:bg-blue-100 hover:text-blue-800' 
                            : 'text-gray-400 hover:bg-red-100 hover:text-red-600'
                    }`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                    <span>{event.attending_count} / {event.total_players} Attending</span>
                    <span>{event.attendance_rate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${event.attendance_rate}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}

function AttendanceTable({
    players,
    onAttendanceToggle,
    isBulkEditMode,
    stagedChanges,
    onStagedChange,
}: {
    players: PlayerWithAttendance[];
    onAttendanceToggle: (playerId: number) => void;
    isBulkEditMode: boolean;
    stagedChanges: Map<number, boolean>;
    onStagedChange: (playerId: number, isAttending: boolean) => void;
}) {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th className="px-4 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Player</th>
                        <th className="px-4 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">Position</th>
                        <th className="px-4 py-1 text-center font-medium text-gray-500 uppercase tracking-wider">Skill</th>
                        <th className="px-4 py-1 text-center font-medium text-gray-500 uppercase tracking-wider">Attending</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                    {players.map((player) => (
                        <tr key={player.id} className="h-10 hover:bg-gray-50/30 transition-colors">
                            <td className="px-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <span className="font-medium text-gray-900">{player.first_name} {player.last_name}</span>
                                </div>
                            </td>
                            <td>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                }`}>
                                    {player.is_defense ? 'Defense' : 'Forward'}
                                </span>
                            </td>
                            <td>
                                <div className="flex justify-start items-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                        {player.skill}
                                    </span>
                                </div>
                            </td>
                            <td className="text-center">
                                 {isBulkEditMode ? (
                                    <input
                                        type="checkbox"
                                        checked={stagedChanges.get(player.id) ?? false}
                                        onChange={(e) => onStagedChange(player.id, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                ) : (
                                    <button
                                        onClick={() => onAttendanceToggle(player.id)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                            player.is_attending_event
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {player.is_attending_event ? 'Attending' : 'Not Attending'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}