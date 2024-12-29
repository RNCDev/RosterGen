'use client';

import { useState, useEffect } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import Sidebar from '@/components/Sidebar';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
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

            // Refresh players list after successful deletion
            await fetchPlayers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete player');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateTeams = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const forwards = attendingPlayers.filter(p => !p.is_defense);
        const defensemen = attendingPlayers.filter(p => p.is_defense);

        // Sort players by skill, but add a small random factor to introduce variation
        const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill + Math.random() * 0.2 - 0.1);
        const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill + Math.random() * 0.2 - 0.1);

        const newTeams: Teams = {
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        };

        // Alternate players between the red and white teams
        sortedForwards.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.forwards.push(player);
            } else {
                newTeams.white.forwards.push(player);
            }
        });

        sortedDefensemen.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.defensemen.push(player);
            } else {
                newTeams.white.defensemen.push(player);
            }
        });

        setTeams(newTeams);
        setActiveTab('roster');
    };

    const clearTeams = () => {
        setTeams({
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        });
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
                            <PlayersView
                                players={players}
                                loading={loading}
                                generateTeams={generateTeams}
                                handleFileUpload={handleFileUpload}
                                handleDeletePlayer={handleDeletePlayer}
                            />
                        ) : (
                            <TeamsView
                                teams={teams}
                                generateTeams={generateTeams}
                                clearTeams={clearTeams}
                                hasPlayers={players.length > 0}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}