'use client';

import { useState } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import FloatingToggle from '@/components/FloatingToggle';
import ActionHeader from '@/components/ActionHeader';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
import ErrorAlert from '@/components/ErrorAlert';
import AddPlayerDialog from '@/components/dialogs/AddPlayerDialog';
import UploadCsvDialog from '@/components/dialogs/UploadCsvDialog';
import CreateGroupDialog from '@/components/dialogs/CreateGroupDialog';
import { generateTeams } from '@/lib/teamGenerator';
import { useGroupManager } from '@/hooks/useGroupManager';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
    const [isGeneratingTeams, setIsGeneratingTeams] = useState(false);
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
    } = useGroupManager();

    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });
    const [teamNames, setTeamNames] = useState({
        team1: 'Red',
        team2: 'White'
    });
    
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

    const handleCsvUpload = async (csvPlayers: any[]) => {
        if (!groupCode) {
            setError("A group code must be set before uploading a CSV.");
            throw new Error("Group code not set.");
        }
        if (isDirty && !window.confirm("You have unsaved changes that will be lost. Are you sure you want to overwrite the current roster?")) {
            throw new Error("Upload cancelled by user.");
        }
        
        // This effectively replaces the current players with the CSV data
        setPlayers(csvPlayers);
        // The isDirty flag will now be true, user needs to click "Save" in the header
        setIsBulkEditing(true); // Automatically enter bulk edit mode after CSV upload
    };
    
    const handleGenerateTeams = async () => {
        const attendingPlayers = players.filter((p: Player) => p.is_attending);
        if (attendingPlayers.length < 2) {
            setError("You need at least two attending players to generate teams.");
            return;
        }
        
        setIsGeneratingTeams(true);
        
        // Add a slight delay for the loading animation
        setTimeout(() => {
            const generated = generateTeams(attendingPlayers, groupCode);
            setTeams(generated);
            setIsGeneratingTeams(false);
            setActiveTab('teams');
        }, 800);
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
                onGenerateTeams={handleGenerateTeams}
                playerCount={attendingPlayerCount}
                totalPlayerCount={players.length}
            />

            <main className="flex-1 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 py-8">
                    {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                    {/* Generate Teams Loading Overlay */}
                    {isGeneratingTeams && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center gap-6 animate-fade-in shadow-2xl">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Generating Teams...</h3>
                                    <p className="text-sm text-gray-600">Balancing players by skill and position</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

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
                                    onGenerateTeams={handleGenerateTeams}
                                    isDirty={isDirty}
                                    isGenerating={isGeneratingTeams}
                                />
                            </div>
                        ) : (
                            <div key="teams" className="animate-slide-in-right">
                                <TeamsView 
                                    teams={teams}
                                    teamNames={teamNames}
                                    setTeamNames={setTeamNames}
                                    onGenerateTeams={handleGenerateTeams}
                                    attendingPlayerCount={attendingPlayerCount}
                                    isGenerating={isGeneratingTeams}
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