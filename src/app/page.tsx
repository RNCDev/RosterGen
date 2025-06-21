'use client';

import { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import FloatingToggle from '@/components/FloatingToggle';
import ActionHeader from '@/components/ActionHeader';
import PlayersView from '@/components/PlayersView';
import EventsView from '@/components/EventsView';
import ErrorAlert from '@/components/ErrorAlert';
import AddPlayerDialog from '@/components/dialogs/AddPlayerDialog';
import UploadCsvDialog from '@/components/dialogs/UploadCsvDialog';
import CreateGroupDialog from '@/components/dialogs/CreateGroupDialog';
import { useGroupManager } from '@/hooks/useGroupManager';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'players' | 'events'>('players');
    const {
        groupCode,
        setGroupCode,
        loadedGroupCode,
        players,
        setPlayers,
        loading,
        setLoading,
        error,
        isDirty,
        handleLoadGroup,
        handleSaveGroup,
        handleClearGroup,
        handleDeleteGroup,
        setError,
        // New event-related properties
        events,
        selectedEvent,
        attendanceData,
        eventsLoading,
        attendanceLoading,
        createEvent,
        updateAttendance,
        deleteEvent,
        selectEvent,
    } = useGroupManager();
    
    // Dialog states
    const [isAddPlayerOpen, setAddPlayerOpen] = useState(false);
    const [isUploadCsvOpen, setUploadCsvOpen] = useState(false);
    const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
    
    // Bulk editing state
    const [isBulkEditing, setIsBulkEditing] = useState(false);

    const handleAddPlayer = async (newPlayerData: Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>) => {
        if (!groupCode) {
            setError("A group code must be set before adding players.");
            return;
        }
        
        const playerWithGroupCode = { ...newPlayerData, group_code: groupCode };

        // Optimistic UI update
        const tempId = Date.now();
        const playerToAdd = { ...playerWithGroupCode, id: tempId };
        setPlayers([...players, playerToAdd]);

        // API call
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerWithGroupCode) // Send the correct object
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error || "Failed to add player");
            }
            // Refresh data from server to get correct ID
            handleLoadGroup(groupCode); 
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred.');
            // Revert optimistic update
            setPlayers(players.filter(p => p.id !== tempId));
        }
    };

    const handleCsvUpload = async (csvPlayers: Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>[]) => {
        if (!groupCode) {
            setError("A group code must be set before uploading a CSV.");
            return;
        }

        if (isDirty && !window.confirm("You have unsaved changes that will be lost. Are you sure you want to overwrite the current roster?")) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/players/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupCode, players: csvPlayers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("API Error:", errorData);
                throw new Error(errorData.error || "Failed to upload CSV data");
            }

            // Reload the group to get the fresh data
            await handleLoadGroup(groupCode);
            setUploadCsvOpen(false); // Close dialog on success
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred during CSV upload.');
        } finally {
            setLoading(false);
        }
    };
    


    // New handler for creating a group
    const handleCreateGroup = async (newGroupCode: string) => {
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupCode: newGroupCode })
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || "Failed to create group.");
            }

            // On success, set the new group code, clear players, and close the dialog
            setGroupCode(newGroupCode);
            setPlayers([]);
            setError(null);
            setCreateGroupOpen(false);

        } catch (e: any) {
            console.error(e);
            // Re-throw to be caught by the dialog
            throw e;
        }
    };

    const attendingPlayerCount = players.filter((p: Player) => p.is_attending).length;

    const handleToggleBulkEdit = async () => {
        if (isBulkEditing && isDirty) {
            // If exiting bulk edit mode with unsaved changes, save first
            try {
                await handleSaveGroup();
                setIsBulkEditing(false);
            } catch (error) {
                // If save fails, don't exit bulk edit mode
                console.error('Failed to save changes:', error);
            }
        } else {
            setIsBulkEditing(!isBulkEditing);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Floating toggle for Players/Teams */}
            <FloatingToggle
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <ActionHeader
                activeTab={activeTab}
                groupCode={groupCode}
                onGroupCodeChange={setGroupCode}
                onLoadGroup={() => handleLoadGroup(groupCode)}
                onSaveGroup={handleSaveGroup}
                onClearGroup={handleClearGroup}
                onDeleteGroup={handleDeleteGroup}
                isDirty={isDirty}
                isLoading={loading}
                isBulkEditing={isBulkEditing}
                onToggleBulkEdit={handleToggleBulkEdit}
                onAddPlayer={() => setAddPlayerOpen(true)}
                onUploadCsv={() => setUploadCsvOpen(true)}
                onGenerateTeams={() => {}} // No longer needed
                playerCount={0} // Will be handled in EventsView
                totalPlayerCount={players.length}
            />

            <main className="flex-1 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                    <div className="relative">
                        {activeTab === 'players' ? (
                            <div key="players" className="animate-slide-in-left">
                                <PlayersView
                                    players={players}
                                    setPlayers={setPlayers}
                                    loading={loading}
                                    isBulkEditing={isBulkEditing}
                                    onCreateGroup={() => setCreateGroupOpen(true)}
                                    groupCode={loadedGroupCode}
                                    onAddPlayer={() => setAddPlayerOpen(true)}
                                    onUploadCsv={() => setUploadCsvOpen(true)}
                                    onToggleBulkEdit={handleToggleBulkEdit}
                                    onGenerateTeams={() => {}} // No longer needed
                                    isDirty={isDirty}
                                    isGenerating={false}
                                />
                            </div>
                        ) : (
                            <div key="events" className="animate-slide-in-right">
                                <EventsView
                                    events={events}
                                    selectedEvent={selectedEvent}
                                    attendanceData={attendanceData}
                                    onEventSelect={selectEvent}
                                    onCreateEvent={createEvent}
                                    onDeleteEvent={deleteEvent}
                                    onUpdateAttendance={updateAttendance}
                                    groupCode={loadedGroupCode}
                                    eventsLoading={eventsLoading}
                                    attendanceLoading={attendanceLoading}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <AddPlayerDialog
                isOpen={isAddPlayerOpen}
                onClose={() => setAddPlayerOpen(false)}
                onAddPlayer={handleAddPlayer}
            />
            
            <UploadCsvDialog
                isOpen={isUploadCsvOpen}
                onClose={() => setUploadCsvOpen(false)}
                onUpload={handleCsvUpload}
            />

            <CreateGroupDialog
                isOpen={isCreateGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                onCreate={handleCreateGroup}
            />
        </div>
    );
}