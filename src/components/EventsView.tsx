'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, Plus, Trash2, ArrowRightLeft } from 'lucide-react';
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
    const [isCreateEventOpen, setCreateEventOpen] = useState(false);
    const [showTeams, setShowTeams] = useState(false);
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });
    const [teamNames, setTeamNames] = useState({
        team1: 'Red',
        team2: 'White'
    });
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);

    // Reset teams and team view when selected event changes
    useEffect(() => {
        setShowTeams(false);
        setTeams({
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        });
    }, [selectedEvent?.id]);

    const handleAttendanceToggle = async (playerId: number, currentStatus: boolean | undefined) => {
        if (!selectedEvent) return;

        const updates: AttendanceInput[] = [{
            player_id: playerId,
            event_id: selectedEvent.id,
            is_attending: !currentStatus
        }];

        try {
            await onUpdateAttendance(selectedEvent.id, updates);
        } catch (error) {
            console.error('Failed to update attendance:', error);
        }
    };

    const handleGenerateTeams = async () => {
        if (!selectedEvent) return;

        setIsGeneratingTeams(true);
        
        try {
            const response = await fetch('/api/teams?action=generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    event_id: selectedEvent.id, 
                    group_code: groupCode 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate teams');
            }

            const data = await response.json();
            setTeams(data.teams);
            
            // Add a slight delay for the loading animation
            setTimeout(() => {
                setIsGeneratingTeams(false);
                setShowTeams(true);
            }, 800);

        } catch (error) {
            console.error('Failed to generate teams:', error);
            setIsGeneratingTeams(false);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (time: string | null) => {
        if (!time) return '';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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
            {/* Header */}
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

            {eventsLoading ? (
                <div className="text-center py-8">
                    <div className="w-8 h-8 mx-auto mb-4 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading events...</p>
                </div>
            ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Events List */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                        {events.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 mb-2">No events yet</p>
                                <p className="text-sm text-gray-500">Create your first event to get started</p>
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

                    {/* Selected Event Details */}
                    <div className="space-y-4">
                        {selectedEvent ? (
                            <>
                                {!showTeams ? (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">Event Attendance</h3>
                                            {attendanceData.filter(p => p.is_attending_event).length >= 2 && (
                                                <button
                                                    onClick={handleGenerateTeams}
                                                    disabled={isGeneratingTeams}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                                                >
                                                    {isGeneratingTeams ? (
                                                        <>
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ArrowRightLeft className="w-4 h-4" />
                                                            Generate Teams
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                        {attendanceLoading ? (
                                            <div className="text-center py-8">
                                                <div className="w-6 h-6 mx-auto mb-2 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                                                <p className="text-sm text-gray-600">Loading attendance...</p>
                                            </div>
                                        ) : (
                                            <AttendanceList
                                                players={attendanceData}
                                                onAttendanceToggle={handleAttendanceToggle}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900">Generated Teams</h3>
                                            <button
                                                onClick={() => {
                                                    setShowTeams(false);
                                                    // Reset teams state when going back to attendance
                                                    setTeams({
                                                        red: { forwards: [], defensemen: [] },
                                                        white: { forwards: [], defensemen: [] },
                                                    });
                                                }}
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
                                            attendingPlayerCount={attendanceData.filter(p => p.is_attending_event).length}
                                            isGenerating={isGeneratingTeams}
                                        />
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">Select an event to view attendance</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <CreateEventDialog
                isOpen={isCreateEventOpen}
                onClose={() => setCreateEventOpen(false)}
                onCreateEvent={onCreateEvent}
                groupCode={groupCode}
            />
        </div>
    );
}

interface EventCardProps {
    event: EventWithStats;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
}

function EventCard({ event, isSelected, onClick, onDelete }: EventCardProps) {
    const formatDate = (date: Date | string) => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (time: string | null) => {
        if (!time) return '';
        return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div 
            className={`p-4 rounded-lg cursor-pointer transition-all border ${
                isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50 border-gray-200'
            }`}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{event.name}</h4>
                    {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.event_date)}</span>
                    {event.event_time && (
                        <>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{formatTime(event.event_time)}</span>
                        </>
                    )}
                </div>
                {event.location && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                    </div>
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="text-sm">
                        <span className="font-semibold text-green-600">
                            {event.attending_count || 0}
                        </span>
                        <span className="text-gray-500"> / {event.total_players || 0} attending</span>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                            {event.attendance_rate || 0}%
                        </div>
                    </div>
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all"
                        style={{ width: `${event.attendance_rate || 0}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

interface AttendanceListProps {
    players: PlayerWithAttendance[];
    onAttendanceToggle: (playerId: number, currentStatus: boolean | undefined) => void;
}

function AttendanceList({ players, onAttendanceToggle }: AttendanceListProps) {
    return (
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {players.map(player => (
                <div 
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                >
                    <div className="flex-1">
                        <div className="font-medium text-gray-900">
                            {player.first_name} {player.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {player.is_defense ? 'Defense' : 'Forward'} • Skill: {player.skill}
                        </div>
                    </div>
                    <button
                        onClick={() => onAttendanceToggle(player.id, player.is_attending_event)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            player.is_attending_event
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {player.is_attending_event ? 'Attending' : 'Not Attending'}
                    </button>
                </div>
            ))}
        </div>
    );
} 