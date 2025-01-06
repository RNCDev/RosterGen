'use client';

import { useState, useEffect } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import Header from '@/app/components/Header';
import ActionBar from '@/app/components/ActionBar';
import PlayersView from '@/app/components/PlayersView';
import TeamsView from '@/app/components/TeamsView';
import ErrorAlert from '@/app/components/ErrorAlert';
import Dialog from '@/app/components/Dialog';
import AddPlayerDialog from '@/app/components/AddPlayerDialog';
import _ from 'lodash';
import { generateTeams } from '@/lib/teamGenerator';

export default function Home() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'players' | 'roster'>('players');
    const [groupCode, setGroupCode] = useState<string>('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });

    useEffect(() => {
        const savedGroupCode = localStorage.getItem('groupCode');
        if (savedGroupCode) {
            setGroupCode(savedGroupCode);
            fetchPlayers(savedGroupCode);
        }
    }, []);

    const fetchPlayers = async (groupCode?: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/players?groupCode=${groupCode || ''}`);
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

    const handleGroupCodeChange = (newGroupCode: string) => {
        setGroupCode(newGroupCode);
    };

    const handleRetrieveGroupCode = async () => {
        if (!groupCode) {
            setError('Please enter a group code');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await fetchPlayers(groupCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to retrieve group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupSave = async () => {
        if (!groupCode) {
            setError('Please enter a group code');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Create new group with existing players
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupCode,
                    players: players.map(p => ({
                        firstName: p.first_name,
                        lastName: p.last_name,
                        skill: p.skill,
                        defense: p.is_defense,
                        attending: p.is_attending
                    }))
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create group');
            }

            localStorage.setItem('groupCode', groupCode);
            await fetchPlayers(groupCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGroupCancel = () => {
        const savedGroupCode = localStorage.getItem('groupCode') || '';
        setGroupCode(savedGroupCode);
        // Clear teams state
        setTeams({
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] }
        });
        if (savedGroupCode) {
            fetchPlayers(savedGroupCode);
        } else {
            setPlayers([]);
        }
    };


    const handleGroupDelete = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmGroupDelete = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/groups', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ groupCode })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete group');
            }

            setGroupCode('');
            localStorage.removeItem('groupCode');
            setTeams({
                red: { forwards: [], defensemen: [] },
                white: { forwards: [], defensemen: [] }
            });
            setPlayers([]);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlayer = () => {
        if (!groupCode) {
            setError('Please select a group before adding players');
            return;
        }
        setShowAddPlayer(true);
    };

    const handleAddPlayerSubmit = async (playerData: {
        firstName: string;
        lastName: string;
        skill: number;
        defense: boolean;
        attending: boolean;
    }) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...playerData,
                    groupCode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add player');
            }

            await fetchPlayers(groupCode);
            setShowAddPlayer(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add player');
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

            // Set the group code to TEMPCODE after successful upload
            setGroupCode('TEMPCODE');
            await fetchPlayers('TEMPCODE');
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerUpdate = async (updatedPlayer: Player) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/players', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: updatedPlayer.id,
                    firstName: updatedPlayer.first_name,
                    lastName: updatedPlayer.last_name,
                    skill: updatedPlayer.skill,
                    defense: updatedPlayer.is_defense,
                    attending: updatedPlayer.is_attending,
                    groupCode: updatedPlayer.group_code
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update player');
            }

            await fetchPlayers(groupCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update player');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlayer = async (id: number) => {
        try {
            const response = await fetch(`/api/players?id=${id}&groupCode=${groupCode}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete player');
            }

            // Refresh the players list after successful deletion
            await fetchPlayers(groupCode);
        } catch (error) {
            console.error('Error deleting player:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete player');
        }
    };

    const handleTeamsGenerated = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get only attending players
            const attendingPlayers = players.filter(p => p.is_attending);
            
            if (attendingPlayers.length < 2) {
                setError('Need at least 2 attending players to generate teams');
                return;
            }

            // Generate teams using your team generator with groupCode
            const newTeams = generateTeams(attendingPlayers, groupCode);
            setTeams(newTeams);

            // Save teams to backend
            const teamAssignmentData = {
                redTeam: newTeams.red,
                whiteTeam: newTeams.white,
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
                throw new Error(errorData.error || 'Failed to save teams');
            }

            // Switch to the roster view to show the generated teams
            setActiveTab('roster');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate teams');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                groupCode={groupCode}
                onGroupCodeChange={handleGroupCodeChange}
                onRetrieveGroupCode={handleRetrieveGroupCode}
                onSaveGroupCode={handleGroupSave}
                onCancelGroupCode={handleGroupCancel}
                onDeleteGroup={handleGroupDelete}
            />

            <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <ActionBar 
                        onAddPlayer={handleAddPlayer}
                        onUploadClick={() => document.getElementById('file-upload')?.click()}
                        onGenerateTeams={players.length > 0 ? handleTeamsGenerated : undefined}
                        showGenerateTeams={activeTab === 'players'}
                        disabled={loading}
                    />
                </div>
            </div>

            <main className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <ErrorAlert message={error} />

                    <div className="bg-white rounded-lg shadow-sm border">
                        {activeTab === 'players' ? (
                            <PlayersView
                                players={players}
                                loading={loading}
                                groupCode={groupCode}
                                onUpdatePlayer={handlePlayerUpdate}
                                handleDeletePlayer={handleDeletePlayer}
                            />
                        ) : (
                            <TeamsView
                                teams={teams}
                                hasPlayers={players.length > 0}
                                groupCode={groupCode}
                                onRegenerateTeams={handleTeamsGenerated}
                            />
                        )}
                    </div>
                </div>
            </main>

            <Dialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmGroupDelete}
                title="Delete Group"
                description="Are you sure you want to delete this group? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
            <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
            />
            <AddPlayerDialog
                isOpen={showAddPlayer}
                onClose={() => setShowAddPlayer(false)}
                onSubmit={handleAddPlayerSubmit}
            />
        </div>
    );
}