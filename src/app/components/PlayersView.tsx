'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Users, UserPlus, Upload, ArrowLeftRight, ArrowUpDown } from 'lucide-react';
import EditableRow from './EditableRow';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    onGenerateTeams: () => void;
    onAddPlayer: () => void;
    onUploadCsv: () => void;
}

type SortField = 'name' | 'skill' | 'position' | 'attendance';
type SortDirection = 'asc' | 'desc';

export default function PlayersView({ players, setPlayers, loading, onGenerateTeams, onAddPlayer, onUploadCsv }: PlayersViewProps) {
    const [isBulkEditing, setIsBulkEditing] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({ field: 'name', direction: 'asc' });

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };

    const handlePlayerDelete = (id: number) => {
        setPlayers(players.filter(p => p.id !== id));
    };

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => {
            // Sort logic here...
            const nameA = `${a.first_name} ${a.last_name}`;
            const nameB = `${b.first_name} ${b.last_name}`;
            if (sortConfig.direction === 'asc') {
                return nameA.localeCompare(nameB);
            }
            return nameB.localeCompare(nameA);
        });
    }, [players, sortConfig]);

    const SortButton = ({ field, label }: { field: SortField, label: string }) => (
        <button onClick={() => handleSort(field)} className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            {label} <ArrowUpDown className="h-4 w-4" />
        </button>
    );

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="card-neo p-8 flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="text-sm font-medium text-slate-600">Loading...</span>
                </div>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="p-6">
                <div className="card-neo p-12 flex flex-col items-center">
                    <Users className="h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-900">No Players in Group</h3>
                    <p className="mt-1 text-sm text-slate-500 text-center">
                        Load a group using the controls above, or add a player to get started.
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onAddPlayer} className="button-neo inline-flex items-center gap-2"><UserPlus size={18} /> Add Player</button>
                    <button onClick={onUploadCsv} className="button-neo inline-flex items-center gap-2"><Upload size={18} /> Upload CSV</button>
                </div>
                <div className="flex items-center gap-4">
                    {isBulkEditing ? (
                        <>
                            <button onClick={() => setIsBulkEditing(false)} className="button-neo">Cancel</button>
                            <button onClick={() => setIsBulkEditing(false)} className="button-neo bg-green-500 text-white">Save All</button>
                        </>
                    ) : (
                        <button onClick={() => setIsBulkEditing(true)} className="button-neo">Bulk Edit</button>
                    )}
                    <button onClick={onGenerateTeams} disabled={players.filter(p => p.is_attending).length < 2} className="button-neo inline-flex items-center gap-2">
                        <ArrowLeftRight size={18} /> Generate Teams
                    </button>
                </div>
            </div>

            {/* Player Table */}
            <div className="table-neo min-w-full">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left"><SortButton field="name" label="Name" /></th>
                            <th scope="col" className="px-6 py-4 text-center"><SortButton field="skill" label="Skill" /></th>
                            <th scope="col" className="px-6 py-4 text-center"><SortButton field="position" label="Position" /></th>
                            <th scope="col" className="px-6 py-4 text-center"><SortButton field="attendance" label="Attending" /></th>
                            <th scope="col" className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedPlayers.map(player => (
                            <EditableRow
                                key={player.id}
                                player={player}
                                onUpdate={handlePlayerUpdate}
                                onDelete={handlePlayerDelete}
                                isBulkEditing={isBulkEditing}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 