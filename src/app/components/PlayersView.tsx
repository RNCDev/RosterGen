// PlayersView.tsx
'use client';

import { type Player } from '@/types/PlayerTypes';
import { Users, ArrowUpDown } from 'lucide-react';
import EditableRow from './EditableRow';
import _ from 'lodash';
import { useState } from 'react';

interface PlayersViewProps {
    players: Player[];
    loading: boolean;
    groupCode: string;
    onUpdatePlayer: (player: Player) => Promise<void>;
    handleDeletePlayer?: (id: number) => Promise<void>;
}

type SortField = 'name' | 'skill' | 'position' | 'attendance';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export default function PlayersView({
    players,
    loading,
    groupCode,
    onUpdatePlayer,
    handleDeletePlayer
}: PlayersViewProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });

    const sortPlayers = (players: Player[]): Player[] => {
        return [...players].sort((a, b) => {
            switch (sortConfig.field) {
                case 'name':
                    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                    return sortConfig.direction === 'asc' 
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA);
                case 'skill':
                    return sortConfig.direction === 'asc' 
                        ? a.skill - b.skill
                        : b.skill - a.skill;
                case 'position':
                    return sortConfig.direction === 'asc' 
                        ? Number(a.is_defense) - Number(b.is_defense)
                        : Number(b.is_defense) - Number(a.is_defense);
                case 'attendance':
                    return sortConfig.direction === 'asc' 
                        ? Number(a.is_attending) - Number(b.is_attending)
                        : Number(b.is_attending) - Number(a.is_attending);
                default:
                    return 0;
            }
        });
    };

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const SortButton = ({ field, label }: { field: SortField, label: string }) => (
        <button 
            onClick={() => handleSort(field)}
            className={`flex items-center gap-1 hover:text-slate-900 transition-colors
                ${sortConfig.field === field ? 'text-slate-900' : 'text-slate-500'}`}
        >
            {label}
            <ArrowUpDown className="h-4 w-4" />
        </button>
    );

    const sortedPlayers = sortPlayers(players);

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
                                    <SortButton field="name" label="Name" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <SortButton field="skill" label="Skill" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <SortButton field="position" label="Position" />
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    <SortButton field="attendance" label="Attending" />
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