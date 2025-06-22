'use client';

import { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import ActionHeader from '@/components/ActionHeader';
import PlayersView from '@/components/PlayersView';
import EventsView from '@/components/EventsView';
import ErrorAlert from '@/components/ErrorAlert';
import AddPlayerDialog from '@/components/dialogs/AddPlayerDialog';
import UploadCsvDialog from '@/components/dialogs/UploadCsvDialog';
import CreateGroupDialog from '@/components/dialogs/CreateGroupDialog';
import { useGroupManager } from '@/hooks/useGroupManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, Users } from 'lucide-react';

// A simple welcome screen component to guide new users.
const WelcomeScreen = ({ onCreateGroup }: { onCreateGroup: () => void }) => (
    <div className="text-center">
        <Users size={48} className="mx-auto text-gray-400" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Welcome to RosterGen</h2>
        <p className="mt-2 text-gray-500">
            To get started, load an existing group using the code above, or create a new one.
        </p>
        <Button onClick={onCreateGroup} className="mt-6">
            Create New Group
        </Button>
    </div>
);

export default function Home() {
    const {
        groupCode,
        setGroupCode,
        loadedGroupCode,
        players,
        setPlayers,
        loading,
        error,
        isDirty,
        handleLoadGroup,
        handleSaveGroup,
        handleClearGroup,
        handleDeleteGroup,
        setError,
        events,
        selectedEvent,
        attendanceData,
        eventsLoading,
        attendanceLoading,
        createEvent,
        updateAttendance,
        deleteEvent,
        selectEvent,
        handleToggleBulkEdit,
        isGroupNameDirty,
        handleRenameGroup,
    } = useGroupManager();
    
    // Dialog states
    const [isAddPlayerOpen, setAddPlayerOpen] = useState(false);
    const [isUploadCsvOpen, setUploadCsvOpen] = useState(false);
    const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);
    
    // Bulk editing state for PlayersView
    const [isBulkEditing, setIsBulkEditing] = useState(false);

    const handleAddPlayer = async (newPlayerData: Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>) => {
        if (!loadedGroupCode) {
            setError("A group must be loaded before adding players.");
            return;
        }
        
        const playerWithGroupCode = { ...newPlayerData, group_code: loadedGroupCode };

        // Optimistic UI update
        const tempId = Date.now();
        const playerToAdd = { ...playerWithGroupCode, id: tempId };
        setPlayers([...players, playerToAdd]);

        // API call
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerWithGroupCode)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to add player");
            }
            // Refresh data from server to get correct ID
            await handleLoadGroup(loadedGroupCode); 
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred.');
            // Revert optimistic update
            setPlayers(players.filter(p => p.id !== tempId));
        }
    };

    const handleCsvUpload = async (csvPlayers: Omit<Player, 'id' | 'group_code' | 'created_at' | 'updated_at'>[]) => {
        if (!loadedGroupCode) {
            setError("A group must be loaded before uploading a CSV.");
            return;
        }

        if (isDirty && !window.confirm("You have unsaved changes that will be lost. Are you sure you want to overwrite the current roster?")) {
            return;
        }

        try {
            const response = await fetch('/api/players/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupCode: loadedGroupCode, players: csvPlayers }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to upload CSV data");
            }

            await handleLoadGroup(loadedGroupCode);
            setUploadCsvOpen(false);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred during CSV upload.');
        }
    };

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

            setGroupCode(newGroupCode);
            await handleLoadGroup(newGroupCode); // Load the newly created group
            setCreateGroupOpen(false);

        } catch (e: any) {
            throw e; // Re-throw to be caught by the dialog
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ActionHeader
                groupCode={groupCode}
                onGroupCodeChange={setGroupCode}
                onLoadGroup={() => handleLoadGroup(groupCode)}
                onSaveGroup={handleRenameGroup}
                onClearGroup={handleClearGroup}
                onDeleteGroup={handleDeleteGroup}
                isDirty={isGroupNameDirty}
                isLoading={loading}
            />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                    {!loadedGroupCode ? (
                         <WelcomeScreen onCreateGroup={() => setCreateGroupOpen(true)} />
                    ) : (
                        <Tabs defaultValue="roster" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="roster">Roster</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                            </TabsList>
                            <TabsContent value="roster" className="mt-4 animate-fade-in">
                                <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-lg p-4 mb-4 flex items-center justify-between animate-slide-in-from-left">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Roster Management
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" onClick={() => setAddPlayerOpen(true)}>
                                            <Plus className="mr-2 h-4 w-4" /> Add Player
                                        </Button>
                                        <Button variant="outline" onClick={() => setUploadCsvOpen(true)}>
                                            <Upload className="mr-2 h-4 w-4" /> Upload CSV
                                        </Button>
                                    </div>
                                </div>
                                <PlayersView
                                    players={players}
                                    setPlayers={setPlayers}
                                    loading={loading}
                                    isBulkEditing={isBulkEditing}
                                    onToggleBulkEdit={async () => {
                                        await handleToggleBulkEdit(isBulkEditing, isDirty);
                                        setIsBulkEditing(!isBulkEditing);
                                    }}
                                    isDirty={isDirty}
                                />
                            </TabsContent>
                            <TabsContent value="events" className="mt-4 animate-fade-in">
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
                            </TabsContent>
                        </Tabs>
                    )}
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