'use client';

import { useState } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import Header from '@/components/Header';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
import ErrorAlert from '@/components/ErrorAlert';
import AddPlayerDialog from '@/components/dialogs/AddPlayerDialog';
import UploadCsvDialog from '@/components/dialogs/UploadCsvDialog';
import { generateTeams } from '@/lib/teamGenerator';
import { useGroupManager } from '@/hooks/useGroupManager';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
    const {
        groupCode,
        setGroupCode,
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
    
    const handleAddPlayer = async (newPlayerData: any) => {
        if (!groupCode) {
            setError("A group code must be set before adding players.");
            return;
        }
        // Optimistic UI update
        const tempId = Date.now();
        const playerToAdd = { ...newPlayerData, id: tempId, group_code: groupCode };
        setPlayers([...players, playerToAdd]);

        // API call
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newPlayerData, groupCode })
            });

            if (!response.ok) {
                throw new Error("Failed to add player");
            }
            // Refresh data from server to get correct ID
            handleLoadGroup(groupCode); 
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An error occurred.');
            // Revert optimistic update
            setPlayers(players);
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
    };
    
    const handleGenerateTeams = () => {
        const attendingPlayers = players.filter((p: Player) => p.is_attending);
        if (attendingPlayers.length < 2) {
            setError("You need at least two attending players to generate teams.");
            return;
        }
        const generated = generateTeams(attendingPlayers, groupCode);
        setTeams(generated);
        setActiveTab('teams');
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                groupCode={groupCode}
                onGroupCodeChange={setGroupCode}
                onLoadGroup={() => handleLoadGroup(groupCode)}
                onSaveGroup={handleSaveGroup}
                onClearGroup={handleClearGroup}
                onDeleteGroup={handleDeleteGroup}
                isDirty={isDirty}
                isLoading={loading}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
                {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                {activeTab === 'players' ? (
                    <PlayersView
                        players={players}
                        setPlayers={setPlayers}
                        loading={loading}
                        onGenerateTeams={handleGenerateTeams}
                        onAddPlayer={() => setAddPlayerOpen(true)}
                        onUploadCsv={() => setUploadCsvOpen(true)}
                    />
                ) : (
                    <TeamsView />
                )}
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
        </div>
    );
}