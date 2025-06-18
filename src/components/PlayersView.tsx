'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Users, ArrowUpDown, Info, UserPlus } from 'lucide-react';
import EditableRow from '@/components/EditableRow';
import { Button } from '@/components/ui/Button';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isBulkEditing: boolean;
    onCreateGroup: () => void;
    groupCode: string;
}

type SortField = 'name' | 'skill' | 'position' | 'attendance';
type SortDirection = 'asc' | 'desc';

export default function PlayersView({ players, setPlayers, loading, isBulkEditing, onCreateGroup, groupCode }: PlayersViewProps) {
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
            <div className="text-center p-12 card-neo">
                <Users className="mx-auto h-12 w-12 text-slate-400" />
                {groupCode ? (
                    <>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Group '{groupCode}' is Empty</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Use the "Add Player" or "Upload CSV" buttons to populate your roster.
                        </p>
                    </>
                ) : (
                    <>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Your Roster is Empty</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Load an existing group using the code above, or create a new one to get started.
                        </p>
                        <div className="mt-6">
                            <Button onClick={onCreateGroup}>
                                <UserPlus size={16} className="mr-2"/>
                                Create New Group
                            </Button>
                        </div>
                    </>
                )}
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            {/* Player Table */}
            <div className="table-neo min-w-full">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-white"><SortButton field="name" label="Name" /></th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"><SortButton field="skill" label="Skill" /></th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"><SortButton field="position" label="Position" /></th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"><SortButton field="attendance" label="Attending" /></th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider sticky right-0 bg-white">Actions</th>
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