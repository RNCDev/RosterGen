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

const LoadingState = () => (
    <div className="text-center">
        <Users size={48} className="mx-auto text-gray-400 animate-pulse" />
        <h2 className="mt-4 text-2xl font-semibold text-gray-800">Loading Group...</h2>
        <p className="mt-2 text-gray-500">Please wait while we fetch the details.</p>
    </div>
);

export default function Home() {
    const {
        groupCodeInput,
        setGroupCodeInput,
        activeGroup,
        players,
        setPlayers,
        loading,
        error,
        setError,
        isDirty,
        isGroupNameDirty,
        handleLoadGroup,
        handleClearGroup,
        handleCreateGroup,
        handleRenameGroup,
        handleDeleteGroup,
        handleAddPlayer,
        handleCsvUpload,
        events,
        selectedEvent,
        attendanceData,
        eventsLoading,
        attendanceLoading,
        createEvent,
        updateAttendance,
        deleteEvent,
        selectEvent
    } = useGroupManager();
    
    const [isAddPlayerOpen, setAddPlayerOpen] = useState(false);
    const [isUploadCsvOpen, setUploadCsvOpen] = useState(false);
    const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);

    const onAddPlayer = async (playerData: Omit<Player, 'id' | 'group_id' | 'created_at' | 'updated_at'>) => {
        try {
            await handleAddPlayer(playerData);
            setAddPlayerOpen(false);
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    const onCsvUpload = async (csvPlayers: Omit<Player, 'id' | 'group_id' | 'created_at' | 'updated_at'>[]) => {
        try {
            await handleCsvUpload(csvPlayers);
            setUploadCsvOpen(false);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const onCreateGroup = async (newGroupCode: string) => {
        try {
            await handleCreateGroup(newGroupCode);
            setCreateGroupOpen(false);
        } catch (e: any) {
            // Let the dialog handle its own error state
            throw e;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <ActionHeader
                groupCode={groupCodeInput}
                onGroupCodeChange={setGroupCodeInput}
                onLoadGroup={() => handleLoadGroup(groupCodeInput)}
                onSaveGroup={() => handleRenameGroup(groupCodeInput)}
                onClearGroup={handleClearGroup}
                onDeleteGroup={handleDeleteGroup}
                isGroupNameDirty={isGroupNameDirty}
                isPlayerListDirty={isDirty}
                isLoading={loading}
                isGroupLoaded={!!activeGroup}
            />

            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                    {loading ? (
                        <LoadingState />
                    ) : !activeGroup ? (
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
                                        Roster Management {activeGroup ? `- ${activeGroup.code}` : ''}
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
                                    group={activeGroup}
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
                onAddPlayer={onAddPlayer}
            />
            
            <UploadCsvDialog
                isOpen={isUploadCsvOpen}
                onClose={() => setUploadCsvOpen(false)}
                onUpload={onCsvUpload}
            />

            <CreateGroupDialog
                isOpen={isCreateGroupOpen}
                onClose={() => setCreateGroupOpen(false)}
                onCreate={onCreateGroup}
            />
        </div>
    );
}