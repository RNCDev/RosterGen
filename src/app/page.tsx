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
    const [groupCode, setGroupCode] = useState<string>('default');
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });

    useEffect(() => {
        // Try to load saved group code from localStorage
        const savedGroupCode = localStorage.getItem('groupCode');
        if (savedGroupCode) {
            setGroupCode(savedGroupCode);
        }
    }, []);

    useEffect(() => {
        fetchPlayers();
    }, [groupCode]); // Refetch when group code changes

    const handleGroupCodeChange = async (newGroupCode: string) => {
        try {
            setLoading(true);
            setError(null);

            // Store the new group code
            setGroupCode(newGroupCode);
            localStorage.setItem('groupCode', newGroupCode);

            // Refetch players for the new group
            await fetchPlayers();
        } catch (err) {
            setError('Failed to change group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupDelete = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/groups', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ groupCode }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete group');
            }

            // Reset to default group and clear teams
            setGroupCode('default');
            localStorage.setItem('groupCode', 'default');
            setTeams({
                red: { forwards: [], defensemen: [] },
                white: { forwards: [], defensemen: [] },
            });

            // Fetch players for the default group
            await fetchPlayers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
            console.error(err);
            throw err;
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
            formData.append('groupCode', groupCode);
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
                body: JSON.stringify({ id: playerId, groupCode }),
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

    const handlePlayerUpdate = async (updatedPlayer: Player) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                id: updatedPlayer.id,
                firstName: updatedPlayer.first_name,
                lastName: updatedPlayer.last_name,
                skill: Number(updatedPlayer.skill),
                defense: Boolean(updatedPlayer.is_defense),
                attending: Boolean(updatedPlayer.is_attending),
                groupCode
            };

            const response = await fetch('/api/players', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to update player');
            }

            await fetchPlayers();
        } catch (err) {
            console.error('Update error:', err);
            setError(err instanceof Error ? err.message : 'Failed to update player');
            throw err;
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

            const teamAssignmentData = {
                redTeam: newTeams.red,
                whiteTeam: newTeams.white,
                sessionDate: new Date().toISOString(),
                groupCode
            };

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
                                    groupCode={groupCode}
                                    onGroupCodeChange={handleGroupCodeChange}
                                    handleFileUpload={handleFileUpload}
                                    handleDeletePlayer={handleDeletePlayer}
                                    onTeamsGenerated={handleTeamsGenerated}
                                    onUpdatePlayer={handlePlayerUpdate}
                                />
                            </div>
                        ) : (
                            <TeamsView
                                teams={teams}
                                hasPlayers={players.length > 0}
                                groupCode={groupCode}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}