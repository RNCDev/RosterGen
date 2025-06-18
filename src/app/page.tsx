'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import Header from '@/components/Header';
import ActionBar from '@/components/ActionBar';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
import ErrorAlert from '@/components/ErrorAlert';
import Dialog from '@/components/Dialog';
import AddPlayerDialog from '@/components/AddPlayerDialog';
import UploadCsvDialog from '@/components/UploadCsvDialog';
import _ from 'lodash';
import { generateTeams } from '@/lib/teamGenerator';
import { useGroupManager } from '@/hooks/useGroupManager';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
    const {
        groupCode,
        setGroupCode,
        players,
        setPlayers,
        originalPlayers,
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
    
    const handleGenerateTeams = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const generated = generateTeams(attendingPlayers);
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
                onRetrieveGroupCode={handleLoadGroup}
                onSaveGroupCode={handleSaveGroup}
                onCancelGroupCode={handleClearGroup}
                onDeleteGroup={handleDeleteGroup}
            />

            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
                <ActionBar
                    onAddPlayer={() => setAddPlayerOpen(true)}
                    onUploadCsv={() => setUploadCsvOpen(true)}
                    onGenerateTeams={handleGenerateTeams}
                    showGenerateTeams={players.filter(p => p.is_attending).length > 0 && activeTab === 'players'}
                />

                {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

                {activeTab === 'players' ? (
                    <PlayersView />
                ) : (
                    <TeamsView />
                )}
            </main>
            
            <AddPlayerDialog
                isOpen={isAddPlayerOpen}
                onClose={() => setAddPlayerOpen(false)}
                onSubmit={(data) => {
                    // Handle adding a player
                }}
            />

            <Dialog
                isOpen={false}
                onClose={() => {}}
            >
                {/* Dialog content */}
            </Dialog>

            <UploadCsvDialog
                isOpen={isUploadCsvOpen}
                onClose={() => setUploadCsvOpen(false)}
                onUpload={(data) => {
                    // Handle uploading CSV
                }}
                groupCode={groupCode}
                setGroupCode={setGroupCode}
            />

        </div>
    );
}