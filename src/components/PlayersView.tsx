'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { 
    Users, 
    UserPlus, 
    Upload, 
    Pencil, 
    Shield, 
    User, 
    ChevronDown, 
    Trash2,
    ChevronsLeft,
    ChevronLeft,
    ChevronRight,
    ChevronsRight
} from 'lucide-react';
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

// PlayerTable component for compact view
const PlayerTable = ({ 
    players, 
    onUpdate, 
    isEditing, 
    onDeletePlayer 
}: { 
    players: Player[]; 
    onUpdate: (player: Player) => void; 
    isEditing: boolean;
    onDeletePlayer: (playerId: number) => void;
}) => {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-3 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                            </th>
                            {isEditing && (
                                <th className="px-3 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                        {players.map((player) => (
                            <tr key={player.id} className="h-10 hover:bg-gray-50/30 transition-colors">
                                <td className="px-3 whitespace-nowrap">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={player.first_name}
                                                onChange={(e) => onUpdate({ ...player, first_name: e.target.value })}
                                                className="w-32 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                            <input
                                                type="text"
                                                value={player.last_name}
                                                onChange={(e) => onUpdate({ ...player, last_name: e.target.value })}
                                                className="w-32 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <User className="w-5 h-5 text-gray-400" />
                                            <span className="font-medium text-gray-900">
                                                {player.first_name} {player.last_name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-3">
                                    {isEditing ? (
                                        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                            <button
                                                onClick={() => onUpdate({ ...player, is_defense: false })}
                                                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${!player.is_defense ? 'bg-green-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                F
                                            </button>
                                            <div className="w-px bg-gray-200 h-full"></div>
                                            <button
                                                onClick={() => onUpdate({ ...player, is_defense: true })}
                                                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${player.is_defense ? 'bg-purple-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                D
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {player.is_defense ? 'Defense' : 'Forward'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3">
                                    {isEditing ? (
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={player.skill}
                                                onChange={(e) => onUpdate({ ...player, skill: parseInt(e.target.value) || 1 })}
                                                className="w-16 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                {player.skill}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                {isEditing && (
                                    <td className="px-3">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => onDeletePlayer(player.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Player"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Bulk Actions component
const BulkActions = ({ 
    selectedPlayers, 
    onBulkUpdate, 
    onClearSelection 
}: { 
    selectedPlayers: Player[]; 
    onBulkUpdate: (updates: Partial<Player>) => void; 
    onClearSelection: () => void; 
}) => {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedPlayers.length} players selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: false })}
                            className="btn-secondary"
                        >
                            Set All Forward
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: true })}
                            className="btn-secondary"
                        >
                            Set All Defense
                        </Button>
                        <select
                            onChange={(e) => onBulkUpdate({ skill: parseInt(e.target.value) })}
                            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white/80"
                        >
                            <option value="">Set Skill Level</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(skill => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button size="sm" onClick={onClearSelection} className="btn-ghost">
                    Clear Selection
                </Button>
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
    const [positionFilter, setPositionFilter] = useState('all');
    const [skillFilter, setSkillFilter] = useState('all');
    const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 20;

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };

    const handleDeletePlayer = (playerId: number) => {
        if (window.confirm('Are you sure you want to delete this player?')) {
            setPlayers(players.filter(p => p.id !== playerId));
        }
    };

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleBulkUpdate = (updates: Partial<Player>) => {
        const updatedPlayers = players.map(player => 
            selectedPlayers.some(selected => selected.id === player.id) 
                ? { ...player, ...updates }
                : player
        );
        setPlayers(updatedPlayers);
    };

    const handleClearSelection = () => {
        setSelectedPlayers([]);
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

    const filteredPlayers = useMemo(() => {
        let filtered = sortedPlayers;
        
        if (positionFilter !== 'all') {
            filtered = filtered.filter(player => 
                positionFilter === 'forward' ? !player.is_defense : player.is_defense
            );
        }
        
        if (skillFilter !== 'all') {
            const [min, max] = skillFilter.split('-').map(Number);
            filtered = filtered.filter(player => player.skill >= min && player.skill <= max);
        }
        
        return filtered;
    }, [sortedPlayers, positionFilter, skillFilter]);

    const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
    const paginatedPlayers = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        return filteredPlayers.slice(start, end);
    }, [filteredPlayers, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

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
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
            {/* Left Column: Controls */}
            <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6">
                {/* Actions */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-800">Actions</h3>
                    <Button onClick={onAddPlayer} className="w-full justify-start btn-ghost">
                        <UserPlus size={16} className="mr-2"/> Add Player
                    </Button>
                    <Button onClick={onUploadCsv} className="w-full justify-start btn-secondary">
                        <Upload size={16} className="mr-2"/> Upload CSV
                    </Button>
                    <Button 
                        onClick={onToggleBulkEdit} 
                        className={`w-full justify-start btn-primary ${isBulkEditing ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                        <Pencil size={16} className="mr-2"/> 
                        {isBulkEditing ? (isDirty ? 'Save & Finish' : 'Finish Editing') : 'Bulk Edit'}
                    </Button>
                </div>

                {/* Sort and Filter Controls */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">View Options</h3>
                     {/* Sort Controls */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Sort by</label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('name')}
                                className={`flex-1 justify-center flex items-center gap-1 ${sortConfig.field === 'name' ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                Name
                                {sortConfig.field === 'name' && (
                                    <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('skill')}
                                className={`flex-1 justify-center flex items-center gap-1 ${sortConfig.field === 'skill' ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                Skill
                                {sortConfig.field === 'skill' && (
                                    <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSort('position')}
                                className={`flex-1 justify-center flex items-center gap-1 ${sortConfig.field === 'position' ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                Position
                                {sortConfig.field === 'position' && (
                                    <ChevronDown className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                )}
                            </Button>
                        </div>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Filter Position</label>
                        <select 
                            value={positionFilter} 
                            onChange={(e) => setPositionFilter(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white/80"
                        >
                            <option value="all">All Positions</option>
                            <option value="forward">Forwards Only</option>
                            <option value="defense">Defense Only</option>
                        </select>
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Filter Skill</label>
                        <select 
                            value={skillFilter} 
                            onChange={(e) => setSkillFilter(e.target.value)}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 bg-white/80"
                        >
                            <option value="all">All Skills</option>
                            <option value="1-3">Skill 1-3</option>
                            <option value="4-6">Skill 4-6</option>
                            <option value="7-10">Skill 7-10</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 space-y-4">
                 {/* Bulk Actions */}
                {isBulkEditing && selectedPlayers.length > 0 && (
                    <BulkActions
                        selectedPlayers={selectedPlayers}
                        onBulkUpdate={handleBulkUpdate}
                        onClearSelection={handleClearSelection}
                    />
                )}

                {/* Player Table */}
                <PlayerTable
                    players={paginatedPlayers}
                    onUpdate={handlePlayerUpdate}
                    isEditing={isBulkEditing}
                    onDeletePlayer={handleDeletePlayer}
                />

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min(filteredPlayers.length > 0 ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0, filteredPlayers.length)}
                        - {Math.min(currentPage * PAGE_SIZE, filteredPlayers.length)} of {filteredPlayers.length} players
                    </div>
                    <div className="flex items-center gap-1">
                         <Button variant="ghost" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                            <ChevronsLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
                        <Button variant="ghost" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                            <ChevronsRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
} 