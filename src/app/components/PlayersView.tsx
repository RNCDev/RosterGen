// PlayersView.tsx
'use client';

import { type Player, type PlayersViewProps } from '@/types/PlayerTypes';
import { Users } from 'lucide-react';
import EditableRow from './EditableRow';

export default function PlayersView({
    players,
    loading,
    groupCode,
    onUpdatePlayer,
    handleDeletePlayer
}: PlayersViewProps) {
    const handleSave = async (updatedPlayer: Player) => {
        if (onUpdatePlayer) {
            await onUpdatePlayer(updatedPlayer);
        }
    };

    return (
        <div className="overflow-hidden">
            <div className="px-6 py-4 border-b">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Players</h2>
                    {groupCode && (
                        <span className="text-sm text-gray-500">
                            Group: {groupCode}
                        </span>
                    )}
                </div>
            </div>

            {players.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
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
                                    onSave={onUpdatePlayer}
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

            {loading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}
        </div>
    );
}