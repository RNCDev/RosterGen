'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Users, ArrowUpDown, UserPlus, Loader2, TrendingUp, Upload, Pencil, ArrowLeftRight, Activity } from 'lucide-react';
import EditableRow from '@/components/EditableRow';
import { Button } from '@/components/ui/Button';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isBulkEditing: boolean;
    onCreateGroup: () => void;
    groupCode: string;
    // Player actions
    onAddPlayer: () => void;
    onUploadCsv: () => void;
    onToggleBulkEdit: () => void;
    onGenerateTeams: () => void;
    // State
    isDirty: boolean;
}

type SortField = 'name' | 'skill' | 'position' | 'attendance';
type SortDirection = 'asc' | 'desc';

export default function PlayersView({ 
    players, 
    setPlayers, 
    loading, 
    isBulkEditing, 
    onCreateGroup, 
    groupCode,
    onAddPlayer,
    onUploadCsv,
    onToggleBulkEdit,
    onGenerateTeams,
    isDirty
}: PlayersViewProps) {
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
            let comparison = 0;
            
            switch (sortConfig.field) {
                case 'name':
                    const nameA = `${a.first_name} ${a.last_name}`;
                    const nameB = `${b.first_name} ${b.last_name}`;
                    comparison = nameA.localeCompare(nameB);
                    break;
                case 'skill':
                    comparison = a.skill - b.skill;
                    break;
                case 'position':
                    comparison = a.is_defense === b.is_defense ? 0 : a.is_defense ? 1 : -1;
                    break;
                case 'attendance':
                    comparison = a.is_attending === b.is_attending ? 0 : a.is_attending ? -1 : 1;
                    break;
            }
            
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [players, sortConfig]);

    const attendingCount = players.filter(p => p.is_attending).length;
    const isGroupActive = groupCode.trim().length > 0;

    const SortButton = ({ field, label }: { field: SortField, label: string }) => {
        const isActive = sortConfig.field === field;
        return (
            <button 
                onClick={() => handleSort(field)} 
                className={`flex items-center gap-2 hover:text-gray-900 transition-colors font-semibold ${
                    isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
            >
                {label} 
                <ArrowUpDown className={`h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
            </button>
        );
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="card-elevated p-8 flex flex-col items-center gap-4 animate-fade-in">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    <span className="text-lg font-semibold text-gray-700">Loading players...</span>
                    <span className="text-sm text-gray-500">This might take a moment</span>
                </div>
            </div>
        );
    }

    if (players.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-12 card-elevated max-w-lg animate-slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    {groupCode ? (
                        <>
                            <h3 className="heading-secondary mb-3">Group '{groupCode}' is Empty</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                This group doesn't have any players yet. Start building your roster by adding players or importing from a CSV file.
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <Button onClick={onAddPlayer} className="btn-primary">
                                    <UserPlus size={16} className="mr-2"/>
                                    Add Player
                                </Button>
                                <Button onClick={onUploadCsv} className="btn-secondary">
                                    <Upload size={16} className="mr-2"/>
                                    Upload CSV
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="heading-secondary mb-3">Welcome to Hockey Roster Manager</h3>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                Create a new group to start managing your hockey roster, or load an existing group using a group code.
                            </p>
                            <Button 
                                onClick={onCreateGroup}
                                className="btn-primary"
                                size="lg"
                            >
                                <UserPlus size={20} className="mr-3"/>
                                Create New Group
                            </Button>
                        </>
                    )}
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card-modern p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Players</p>
                            <p className="text-xl font-bold text-gray-900">{players.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="card-modern p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Attending</p>
                            <p className="text-xl font-bold text-gray-900">{attendingCount}</p>
                        </div>
                    </div>
                </div>
                
                <div className="card-modern p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg. Skill</p>
                            <p className="text-xl font-bold text-gray-900">
                                {players.length > 0 
                                    ? (players.reduce((sum, p) => sum + p.skill, 0) / players.length).toFixed(1)
                                    : '0'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar - Close to Grid */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={onAddPlayer} 
                        disabled={!isGroupActive}
                        className="btn-ghost"
                        size="sm"
                    >
                        <UserPlus size={16} className="mr-2"/> 
                        Add Player
                    </Button>
                    <Button 
                        onClick={onUploadCsv} 
                        disabled={!isGroupActive}
                        className="btn-ghost"
                        size="sm"
                    >
                        <Upload size={16} className="mr-2"/> 
                        Upload CSV
                    </Button>
                    <Button 
                        onClick={onToggleBulkEdit} 
                        disabled={players.length === 0}
                        className={`btn-ghost ${isBulkEditing ? 'bg-blue-100 text-blue-700' : ''}`}
                        size="sm"
                    >
                        <Pencil size={16} className="mr-2"/> 
                        {isBulkEditing ? 'Finish Edit' : 'Bulk Edit'}
                    </Button>
                </div>
                
                <Button 
                    onClick={onGenerateTeams} 
                    disabled={attendingCount < 2 || isBulkEditing}
                    className="btn-primary"
                >
                    <ArrowLeftRight size={16} className="mr-2" />
                    Generate Teams
                </Button>
            </div>

            {/* Player Table - More Compact */}
            <div className="table-modern">
                <table className="min-w-full">
                    <thead className="table-header">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <SortButton field="name" label="Player Name" />
                            </th>
                            <th scope="col" className="px-4 py-2 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <SortButton field="skill" label="Skill" />
                            </th>
                            <th scope="col" className="px-4 py-2 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <SortButton field="position" label="Position" />
                            </th>
                            <th scope="col" className="px-4 py-2 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                <SortButton field="attendance" label="Attending" />
                            </th>
                            <th scope="col" className="px-4 py-2 text-center text-sm font-bold text-gray-700 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/50">
                        {sortedPlayers.map((player, index) => (
                            <EditableRow
                                key={player.id}
                                player={player}
                                onUpdate={handlePlayerUpdate}
                                onDelete={handlePlayerDelete}
                                isBulkEditing={isBulkEditing}
                                className={`table-row ${index % 2 === 0 ? 'bg-white/30' : 'bg-white/20'}`}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 