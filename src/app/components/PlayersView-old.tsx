// PlayersView.tsx
'use client';

import { type Player } from '@/types/PlayerTypes';
import { Users, ArrowUpDown } from 'lucide-react';
import EditableRow from './EditableRow';
import _ from 'lodash';
import { useState } from 'react';
import PlayerCard from './PlayerCard';

interface PlayersViewProps {
    players: Player[];
    loading: boolean;
    onPlayerUpdate: (player: Player) => Promise<void>;
    onDeletePlayer: (id: number) => Promise<void>;
    onBulkPlayerUpdate: (players: Player[]) => Promise<void>;
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
    onPlayerUpdate,
    onDeletePlayer,
    onBulkPlayerUpdate,
}: PlayersViewProps) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'name', direction: 'asc' });
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [editedPlayers, setEditedPlayers] = useState<Player[]>([]);

    const handleBulkEditClick = async () => {
        if (isBulkEditing) {
            await onBulkPlayerUpdate(editedPlayers);
            setIsBulkEditing(false);
            setEditedPlayers([]);
        } else {
            // Deep copy players to avoid direct mutation
            setEditedPlayers(players.map(p => ({ ...p })));
            setIsBulkEditing(true);
        }
    };
    
    const handleCancelBulkEdit = () => {
        setIsBulkEditing(false);
        setEditedPlayers([]);
    };

    const handlePlayerFieldChange = (updatedPlayer: Player) => {
        setEditedPlayers(currentPlayers => 
            currentPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        );
    };

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

    const sortedPlayers = sortPlayers(isBulkEditing ? editedPlayers : players);

    return (
        <div>
            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">Players</h2>
                </div>
                <div className="flex items-center gap-2">
                    {isBulkEditing ? (
                        <>
                            <button onClick={handleCancelBulkEdit} className="button-neo text-slate-600">
                                Cancel
                            </button>
                            <button onClick={handleBulkEditClick} className="button-neo bg-gradient-to-b from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                                Save All
                            </button>
                        </>
                    ) : (
                        <button onClick={handleBulkEditClick} className="button-neo text-slate-600">
                            Bulk Edit
                        </button>
                    )}
                </div>
            </div>

            {players.length > 0 ? (
                <div className="p-6">
                    <div className="hidden md:block overflow-x-auto">
                        <div className="table-neo min-w-full">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr className="bg-gradient-to-b from-slate-50 to-white">
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                            <SortButton field="name" label="Name" />
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <SortButton field="skill" label="Skill" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <SortButton field="position" label="Position" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <SortButton field="attendance" label="Attending" />
                                            </div>
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {sortedPlayers.map((player) => (
                                        <EditableRow
                                            key={player.id}
                                            player={player}
                                            onSave={onPlayerUpdate}
                                            onDelete={onDeletePlayer}
                                            isBulkEditing={isBulkEditing}
                                            onFieldChange={handlePlayerFieldChange}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="md:hidden grid grid-cols-1 gap-6">
                        {sortedPlayers.map((player) => (
                            <PlayerCard
                                key={player.id}
                                player={player}
                                onSave={onPlayerUpdate}
                                onDelete={onDeletePlayer}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-6">
                    <div className="card-neo p-12 flex flex-col items-center">
                        <Users className="h-12 w-12 text-slate-400 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">No players</h3>
                        <p className="mt-1 text-sm text-slate-500 text-center">
                            Enter a group code to load players, or add a new player to get started.
                        </p>
                    </div>
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