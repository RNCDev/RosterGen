// PlayersView.tsx
'use client';

import { type Player } from '@/types/PlayerTypes';
import { ArrowUpFromLine, Users } from 'lucide-react';
import TeamGenerator from './TeamGenerator';
import EditableRow from './EditableRow';

interface PlayersViewProps {
    players: Player[];
    loading: boolean;
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeletePlayer?: (id: number) => void;
    onTeamsGenerated?: (teams: any) => void;
    onUpdatePlayer?: (player: Player) => Promise<void>;
}

export default function PlayersView({
    players,
    loading,
    handleFileUpload,
    handleDeletePlayer,
    onTeamsGenerated,
    onUpdatePlayer
}: PlayersViewProps) {
    const handleSave = async (updatedPlayer: Player) => {
        if (onUpdatePlayer) {
            await onUpdatePlayer(updatedPlayer);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Players</h2>
                <div className="flex items-center gap-4">
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
                            onTeamsGenerated={onTeamsGenerated}
                        />
                    )}
                </div>
            </div>

            {players.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attending</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                    <p className="mt-1 text-sm text-gray-500">Get started by uploading a CSV file.</p>
                </div>
            )}
        </div>
    );
}