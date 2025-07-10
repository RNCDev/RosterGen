'use client';

import { useState } from 'react';
import { type Player, type PlayerInput } from '@/types/PlayerTypes';
import ActionHeader from '@/components/ActionHeader';
import PlayersView from '@/components/PlayersView';
import EventsView from '@/components/EventsView';
import ErrorAlert from '@/components/ErrorAlert';
import AddPlayerDialog from '@/components/dialogs/AddPlayerDialog';
import UploadCsvDialog from '@/components/dialogs/UploadCsvDialog';
import CreateGroupDialog from '@/components/dialogs/CreateGroupDialog';
import packageJson from '../../package.json';
import { useGroupManager } from '@/hooks/useGroupManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Plus, Upload, Users, Loader2, CheckCircle } from 'lucide-react';

// A simple welcome screen component to guide new users.
const WelcomeScreen = ({ onCreateGroup }: { onCreateGroup: () => void }) => (
    <div className="flex items-center justify-center min-h-[60vh] sm:h-[calc(100vh-200px)] animate-fade-in px-4">
        <div className="text-center p-6 sm:p-12 lg:p-16 bg-white/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 w-full max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r bg-gradient-to-r from-neutral-300 to-stone-400 mb-4 sm:mb-6 pb-8">
                Hockey Roster Manager
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-700 max-w-lg mx-auto mb-6 sm:mb-8">
                To get started, load an existing group using the code above, or create a new one.
                <span className="text-xsm text-gray-300 opacity-60 sm:mb-0">  v{packageJson.version}</span>
            </p>
            <Button
                onClick={onCreateGroup}
                className="mt-4 sm:mt-6 lg:mt-10 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-7 text-base sm:text-lg lg:text-xl font-bold rounded-full shadow-xl transform hover:scale-110 transition-transform duration-300 bg-gradient-to-r from-neutral-300 to-stone-400 text-white w-full sm:w-auto"
            >
                Create New Group
            </Button>
        </div>
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
    const [activeTab, setActiveTab] = useState('roster');

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
        selectEvent,
        handleSaveChanges,
        duplicateEvent,
        teamAlias1,
        teamAlias2,
        handleUpdateTeamAliases,
        handleSaveTeamsForEvent,
        handleLoadTeamsForEvent,
        toggleAttendance,
        handleDeleteSavedTeams
    } = useGroupManager(() => setActiveTab('events'));
    
    // Consolidated dialog state
    const [dialogState, setDialogState] = useState({
        addPlayer: false,
        uploadCsv: false,
        createGroup: false,
    });

    // Consolidated alias state
    const [aliasState, setAliasState] = useState({
        saving: { team1: false, team2: false },
        success: { team1: false, team2: false },
    });

    const onAddPlayer = async (playerData: Omit<PlayerInput, 'group_id'>) => {
        try {
            await handleAddPlayer(playerData);
            setDialogState(prev => ({ ...prev, addPlayer: false }));
        } catch (e: any) {
            setError(e.message);
        }
    };
    
    const onCsvUpload = async (csvPlayers: Omit<PlayerInput, 'group_id'>[]) => {
        try {
            await handleCsvUpload(csvPlayers);
            setDialogState(prev => ({ ...prev, uploadCsv: false }));
        } catch (e: any) {
            setError(e.message);
        }
    };

    const onCreateGroup = async (newGroupCode: string) => {
        try {
            await handleCreateGroup(newGroupCode);
            setDialogState(prev => ({ ...prev, createGroup: false }));
        } catch (e: any) {
            // Let the dialog handle its own error state
            throw e;
        }
    };

    const handleUpdateTeamName = async (team: 'team1' | 'team2', newAlias: string) => {
        setAliasState(prev => ({
            ...prev,
            saving: { ...prev.saving, [team]: true }
        }));

        try {
            await handleUpdateTeamAliases(
                team === 'team1' ? newAlias : teamAlias1,
                team === 'team2' ? newAlias : teamAlias2
            );
            setAliasState(prev => ({
                ...prev,
                success: { ...prev.success, [team]: true }
            }));
            setTimeout(() => {
                setAliasState(prev => ({
                    ...prev,
                    success: { ...prev.success, [team]: false }
                }));
            }, 2000);
        } catch (error) {
            console.error(`Failed to update Team ${team === 'team1' ? 1 : 2} alias:`, error);
        } finally {
            setAliasState(prev => ({
                ...prev,
                saving: { ...prev.saving, [team]: false }
            }));
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-stone-100">
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4">
                    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                    {loading ? (
                        <LoadingState />
                    ) : !activeGroup ? (
                         <WelcomeScreen onCreateGroup={() => setDialogState(prev => ({ ...prev, createGroup: true }))} />
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-auto border-b-2 border-gray-200 mt-2 mb-2">
                                <TabsTrigger value="roster" className="text-sm sm:text-base py-2 sm:py-3 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700">
                                    Roster
                                </TabsTrigger>
                                <TabsTrigger value="events" className="text-sm sm:text-base py-2 sm:py-3 data-[state=active]:border-b-4 data-[state=active]:border-blue-600 data-[state=active]:text-blue-700">
                                    Events
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="roster" className="mt-2 animate-fade-in">
                                <div className="w-full flex flex-row items-center gap-4 mt-2 mb-4">
                                    <div className="flex items-center gap-2 px-6 py-2 min-w-[200px] rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                                        <span className="text-xs font-semibold text-gray-500 uppercase mr-2">TEAM 1</span>
                                        <input
                                            id="team1-name"
                                            type="text"
                                            defaultValue={teamAlias1}
                                            onBlur={(e) => handleUpdateTeamName('team1', e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            placeholder="Red"
                                            className="bg-transparent focus:outline-none text-base font-bold text-blue-800 w-32 min-w-0 px-1"
                                            aria-label="Team 1 Name"
                                        />
                                        <span className="ml-1 flex items-center">
                                            {aliasState.saving.team1 ? <Loader2 size={16} className="animate-spin text-blue-500" /> : null}
                                            {aliasState.success.team1 && <CheckCircle size={16} className="text-green-500 ml-1" />}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 px-6 py-2 min-w-[200px] rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                                        <span className="text-xs font-semibold text-gray-500 uppercase mr-2">TEAM 2</span>
                                        <input
                                            id="team2-name"
                                            type="text"
                                            defaultValue={teamAlias2}
                                            onBlur={(e) => handleUpdateTeamName('team2', e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                                            placeholder="White"
                                            className="bg-transparent focus:outline-none text-base font-bold text-blue-800 w-32 min-w-0 px-1"
                                            aria-label="Team 2 Name"
                                        />
                                        <span className="ml-1 flex items-center">
                                            {aliasState.saving.team2 ? <Loader2 size={16} className="animate-spin text-blue-500" /> : null}
                                            {aliasState.success.team2 && <CheckCircle size={16} className="text-green-500 ml-1" />}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-lg p-3 sm:p-4 mb-4 flex flex-row items-center gap-4 animate-slide-in-from-left">
                                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 mr-4">
                                        Roster Management
                                    </h2>
                                    <div className="flex flex-row items-center gap-2">
                                        <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, addPlayer: true }))} className="text-sm sm:text-base h-10">
                                            <Plus className="mr-2 h-4 w-4" /> Add Player
                                        </Button>
                                        <Button variant="outline" onClick={() => setDialogState(prev => ({ ...prev, uploadCsv: true }))} className="text-sm sm:text-base h-10">
                                            <Upload className="mr-2 h-4 w-4" /> Upload CSV
                                        </Button>
                                    </div>
                                </div>
                                <PlayersView
                                    players={players}
                                    setPlayers={setPlayers}
                                    loading={loading}
                                    isDirty={isDirty}
                                    onSaveChanges={handleSaveChanges}
                                />
                            </TabsContent>
                            <TabsContent value="events" className="mt-2 animate-fade-in">
                                 <EventsView
                                    events={events}
                                    selectedEvent={selectedEvent}
                                    attendanceData={attendanceData}
                                    onEventSelect={selectEvent}
                                    onCreateEvent={createEvent}
                                    onDeleteEvent={deleteEvent}
                                    onUpdateAttendance={updateAttendance}
                                    onToggleAttendance={toggleAttendance}
                                    onDuplicateEvent={duplicateEvent}
                                    group={activeGroup}
                                    eventsLoading={eventsLoading}
                                    attendanceLoading={attendanceLoading}
                                    onUpdateTeamAliases={handleUpdateTeamAliases}
                                    onSaveTeamsForEvent={handleSaveTeamsForEvent}
                                    onLoadTeamsForEvent={handleLoadTeamsForEvent}
                                    onDeleteSavedTeams={handleDeleteSavedTeams}
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </main>
            
            <AddPlayerDialog
                isOpen={dialogState.addPlayer}
                onClose={() => setDialogState(prev => ({ ...prev, addPlayer: false }))}
                onAddPlayer={onAddPlayer}
            />
            
            <UploadCsvDialog
                isOpen={dialogState.uploadCsv}
                onClose={() => setDialogState(prev => ({ ...prev, uploadCsv: false }))}
                onUpload={onCsvUpload}
            />

            <CreateGroupDialog
                isOpen={dialogState.createGroup}
                onClose={() => setDialogState(prev => ({ ...prev, createGroup: false }))}
                onCreate={onCreateGroup}
            />
        </div>
    );
}