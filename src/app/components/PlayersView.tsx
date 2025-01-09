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
    const sortedPlayers = _.orderBy(players, ['last_name', 'first_name'], ['asc', 'asc']);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-6 py-4">
                <h2 className="text-xl font-semibold text-slate-900">Players</h2>
                {groupCode && (
                    <div className="card-neo px-4 py-1.5">
                        <span className="text-sm font-medium text-blue-600">
                            Group: {groupCode}
                        </span>
                    </div>
                )}
            </div>

            {players.length > 0 ? (
                <div className="table-neo">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr className="bg-gradient-to-b from-slate-50 to-white">
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Skill
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Position
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Attending
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {sortedPlayers.map((player) => (
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
                <div className="card-neo p-12 flex flex-col items-center">
                    <Users className="h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No players</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Get started by adding a player or uploading a CSV file.
                    </p>
                </div>
            )}

            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="card-neo p-8 flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-medium text-slate-600">Loading...</span>
                    </div>
                </div>
            )}
        </div>
    );
}