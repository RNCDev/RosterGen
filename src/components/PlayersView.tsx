'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Users, UserPlus, Upload, Pencil, Shield, User, ArrowUpDown, ChevronDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isBulkEditing: boolean;
    onCreateGroup: () => void;
    groupCode: string;
    onAddPlayer: () => void;
    onUploadCsv: () => void;
    onToggleBulkEdit: () => void;
    isDirty: boolean;
}

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

// New PlayerCard component
const PlayerCard = ({ player, onUpdate, isEditing }: { player: Player; onUpdate: (player: Player) => void; isEditing: boolean; }) => {

    const handleFieldChange = (field: keyof Player, value: any) => {
        onUpdate({ ...player, [field]: value });
    };

    if (isEditing) {
        return (
            <div className="bg-blue-50/30 rounded-lg p-3 border border-blue-200 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <input 
                        type="text" 
                        value={player.first_name} 
                        onChange={(e) => handleFieldChange('first_name', e.target.value)}
                        className="bg-white/80 border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="First Name"
                    />
                    <input 
                        type="text" 
                        value={player.last_name} 
                        onChange={(e) => handleFieldChange('last_name', e.target.value)}
                        className="bg-white/80 border border-gray-200 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Last Name"
                    />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <label className="text-xs font-medium text-gray-600">Skill:</label>
                        <input 
                            type="number"
                            min="1"
                            max="10"
                            value={player.skill}
                            onChange={(e) => handleFieldChange('skill', parseInt(e.target.value, 10) || 1)}
                            className="bg-white/80 border border-gray-200 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handleFieldChange('is_defense', false)} className={`px-2 py-1 text-xs rounded-md ${!player.is_defense ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>F</button>
                        <button onClick={() => handleFieldChange('is_defense', true)} className={`px-2 py-1 text-xs rounded-md ${player.is_defense ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'}`}>D</button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg p-3 border border-white/40 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    player.is_defense ? 'bg-purple-100' : 'bg-green-100'
                }`}>
                    {player.is_defense ? (
                        <Shield className="w-4 h-4 text-purple-600" />
                    ) : (
                        <User className="w-4 h-4 text-green-600" />
                    )}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 truncate">{player.first_name} {player.last_name}</p>
                    <p className="text-xs text-gray-500">{player.is_defense ? 'Defense' : 'Forward'}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    {player.skill}
                </span>
            </div>
        </div>
    );
};


export default function PlayersView({ 
    players, 
    setPlayers, 
    isBulkEditing, 
    onCreateGroup, 
    groupCode,
    onAddPlayer,
    onUploadCsv,
    onToggleBulkEdit,
    isDirty
}: PlayersViewProps) {
    const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({ field: 'name', direction: 'asc' });

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
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
                    comparison = `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
                    break;
                case 'skill':
                    comparison = b.skill - a.skill; // Default high to low
                    break;
                case 'position':
                    comparison = a.is_defense === b.is_defense ? 0 : a.is_defense ? 1 : -1;
                    break;
            }
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [players, sortConfig]);

    const isGroupActive = groupCode.trim().length > 0;
    
    if (players.length === 0 && isGroupActive) {
        return (
             <div className="text-center p-12 card-elevated max-w-lg mx-auto animate-slide-up">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Group '{groupCode}' is Empty</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    This group has no players. Start building your roster by adding players individually or importing them from a CSV file.
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
            </div>
        );
    }
    
    if (!isGroupActive) {
        return (
            <div className="text-center p-12 card-elevated max-w-lg mx-auto animate-slide-up">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Welcome to RosterGen</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                    Load an existing group by entering its code above, or create a new group to start managing your hockey roster.
                </p>
                <Button 
                    onClick={onCreateGroup}
                    className="btn-primary"
                    size="lg"
                >
                    <UserPlus size={20} className="mr-3"/>
                    Create New Group
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Stats and Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Players</p>
                            <p className="text-xl font-bold text-gray-900">{players.length}</p>
                        </div>
                    </div>
                     <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-3 flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                            <ArrowUpDown className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Avg. Skill</p>
                            <p className="text-xl font-bold text-gray-900">
                                {players.length > 0 ? (players.reduce((sum, p) => sum + p.skill, 0) / players.length).toFixed(1) : '0.0'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <Button onClick={onAddPlayer} className="btn-ghost">
                        <UserPlus size={16} className="mr-2"/> 
                        Add Player
                    </Button>
                     <Button onClick={onUploadCsv} className="btn-secondary">
                        <Upload size={16} className="mr-2"/> 
                        Upload CSV
                    </Button>
                    <Button 
                        onClick={onToggleBulkEdit} 
                        className={`btn-primary ${isBulkEditing ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                        <Pencil size={16} className="mr-2"/> 
                        {isBulkEditing ? (isDirty ? 'Save & Finish' : 'Finish Editing') : 'Bulk Edit'}
                    </Button>
                </div>
            </div>
            
            {/* Player Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedPlayers.map((player) => (
                    <PlayerCard
                        key={player.id}
                        player={player}
                        onUpdate={handlePlayerUpdate}
                        isEditing={isBulkEditing}
                    />
                ))}
            </div>
        </div>
    );
} 