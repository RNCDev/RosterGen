'use client';

import { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { ArrowUpFromLine, Users, Plus } from 'lucide-react';
import TeamGenerator from './TeamGenerator';
import EditableRow from './EditableRow';
import GroupSelector from './GroupSelector';

interface PlayersViewProps {
    players: Player[];
    loading: boolean;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeletePlayer?: (id: number) => Promise<void>;
    onTeamsGenerated?: (teams: any) => void;
    onUpdatePlayer?: (player: Player) => Promise<void>;
}

interface NewPlayer {
    first_name: string;
    last_name: string;
    skill: number;
    is_defense: boolean;
    is_attending: boolean;
}

export default function PlayersView({
    players,
    loading,
    groupCode,
    onGroupCodeChange,
    handleFileUpload,
    handleDeletePlayer,
    onTeamsGenerated,
    onUpdatePlayer,
}: PlayersViewProps) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [newPlayer, setNewPlayer] = useState<NewPlayer>({
        first_name: '',
        last_name: '',
        skill: 5,
        is_defense: false,
        is_attending: true
    });

    const handleSave = async (updatedPlayer: Player) => {
        if (onUpdatePlayer) {
            await onUpdatePlayer(updatedPlayer);
        }
    };

    const handleAddPlayer = async () => {
        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: newPlayer.first_name,
                    lastName: newPlayer.last_name,
                    skill: Number(newPlayer.skill),
                    defense: newPlayer.is_defense,
                    attending: newPlayer.is_attending,
                    groupCode: groupCode
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add player');
            }

            setNewPlayer({
                first_name: '',
                last_name: '',
                skill: 5,
                is_defense: false,
                is_attending: true
            });
            setShowAddForm(false);

            window.location.reload();
        } catch (error) {
            console.error('Error adding player:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">Players</h2>
                    <GroupSelector
                        currentGroup={groupCode}
                        onGroupChange={onGroupCodeChange}
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600"
                    >
                        <Plus className="h-5 w-5" />
                        Add Player
                    </button>
                    <label className="cursor-pointer">
                        <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                            <ArrowUpFromLine className="h-5 w-5" />
                            Upload CSV
                        </span>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                    {onTeamsGenerated && (
                        <TeamGenerator
                            players={players}
                            groupCode={groupCode}
                            onTeamsGenerated={onTeamsGenerated}
                        />
                    )}
                </div>
            </div>

            {showAddForm && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Add New Player</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="First Name"
                            value={newPlayer.first_name}
                            onChange={(e) => setNewPlayer({ ...newPlayer, first_name: e.target.value })}
                            className="p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={newPlayer.last_name}
                            onChange={(e) => setNewPlayer({ ...newPlayer, last_name: e.target.value })}
                            className="p-2 border rounded"
                        />
                        <select
                            value={newPlayer.skill}
                            onChange={(e) => setNewPlayer({ ...newPlayer, skill: Number(e.target.value) })}
                            className="p-2 border rounded"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        <select
                            value={newPlayer.is_defense ? "defense" : "forward"}
                            onChange={(e) => setNewPlayer({ ...newPlayer, is_defense: e.target.value === "defense" })}
                            className="p-2 border rounded"
                        >
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAddPlayer}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600"
                        >
                            Add Player
                        </button>
                    </div>
                </div>
            )}

            {players.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Name</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Skill</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Position</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Attending</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {players.map((player) => (
                                <EditableRow
                                    key={player.id}
                                    player={player}
                                    onSave={handleSave}
                                    onDelete={handleDeletePlayer}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a player or uploading a CSV file.</p>
                </div>
            )}
        </div>
    );
}