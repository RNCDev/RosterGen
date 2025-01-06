// PlayersView.tsx
'use client';

import { type Player } from '@/types/PlayerTypes';
import { Users } from 'lucide-react';
import EditableRow from './EditableRow';
import _ from 'lodash';

interface PlayersViewProps {
    players: Player[];
    loading: boolean;
    groupCode: string;
    onUpdatePlayer: (player: Player) => Promise<void>;
    handleDeletePlayer?: (id: number) => Promise<void>;
}

export default function PlayersView({
    players,
    loading,
    groupCode,
    onUpdatePlayer,
    handleDeletePlayer
}: PlayersViewProps) {
    // Sort players by last name, then first name
    const sortedPlayers = _.orderBy(players, ['last_name', 'first_name'], ['asc', 'asc']);

    const handleSave = async (updatedPlayer: Player) => {
        if (onUpdatePlayer) {
            await onUpdatePlayer(updatedPlayer);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Players</h2>
                {groupCode && (
                    <span className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                        Group: {groupCode}
                    </span>
                )}
            </div>

            {players.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-2/5">
                                    Name
                                </th>
                                <th scope="col" className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                                    Skill
                                </th>
                                <th scope="col" className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                                    Position
                                </th>
                                <th scope="col" className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-32">
                                    Attending
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 w-24">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedPlayers.map((player) => (
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
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Get started by adding a player or uploading a CSV file.
                    </p>
                </div>
            )}

            {loading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600 font-medium">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
}