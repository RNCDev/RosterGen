'use client';

import { useState, useEffect } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import Sidebar from '@/components/Sidebar';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
import TeamGenerator from '@/components/TeamGenerator';
import ErrorAlert from '@/components/ErrorAlert';

export default function Home() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'players' | 'roster'>('players');
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/players');
            if (!response.ok) throw new Error('Failed to fetch players');
            const data = await response.json();
            setPlayers(data);
        } catch (err) {
            setError('Failed to load players');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/players', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            await fetchPlayers();
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlayer = async (playerId: number) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/players', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: playerId }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete player');
            }

            await fetchPlayers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete player');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeamsGenerated = async (newTeams: Teams) => {
        try {
            setLoading(true);
            setError(null);
            setTeams(newTeams);
            setActiveTab('roster');

            // Transform teams object for API
            const teamAssignmentData = {
                redTeam: newTeams.red,
                whiteTeam: newTeams.white,
                sessionDate: new Date().toISOString()
            };

            // Save teams to the backend
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(teamAssignmentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(errorData.error || 'Failed to save teams');
            }

        } catch (err) {
            console.error('Error in handleTeamsGenerated:', err);
            setError(err instanceof Error ? err.message : 'Failed to save teams');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <ErrorAlert message={error} />

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {activeTab === 'players' ? (
                            <div className="space-y-6">
                                <PlayersView
                                    players={players}
                                    loading={loading}
                                    handleFileUpload={handleFileUpload}
                                    handleDeletePlayer={handleDeletePlayer}
                                />
                                <TeamGenerator
                                    players={players}
                                    onTeamsGenerated={handleTeamsGenerated}
                                />
                            </div>
                        ) : (
                            <TeamsView
                                teams={teams}
                                hasPlayers={players.length > 0}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}