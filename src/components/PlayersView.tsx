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
    ChevronsRight,
    Plus,
    Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PlayerRankTourneyDialog from '@/components/dialogs/PlayerRankTourneyDialog';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isDirty: boolean;
    onSaveChanges: () => void;
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
                            <th className="px-3 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-3 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-3 py-0.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                            </th>
                            {isEditing && (
                                <th className="px-3 py-0.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                        {players.map((player, index) => (
                            <tr 
                                key={player.id} 
                                className="hover:bg-gray-100/50 transition-colors"
                            >
                                <td className="px-3 py-1 whitespace-nowrap">
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
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900">
                                                {player.first_name} {player.last_name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-1">
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
                                <td className="px-3 py-1">
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
                                    <td className="px-3 py-1">
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

// A simple empty state component for when a group has no players.
const EmptyState = () => (
    <div className="text-center py-12">
        <Users size={48} className="mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-semibold text-gray-700">No Players in Roster</h3>
        <p className="mt-1 text-sm text-gray-500">
            Click &quot;Add Player&quot; or &quot;Upload CSV&quot; to get started.
        </p>
    </div>
);

export default function PlayersView({ 
    players, 
    setPlayers, 
    loading,
    isDirty,
    onSaveChanges
}: PlayersViewProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ field: SortField, direction: SortDirection }>({ field: 'name', direction: 'asc' });
    const [positionFilter, setPositionFilter] = useState('all');
    const [skillFilter, setSkillFilter] = useState('all');
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());
    const [isTourneyOpen, setIsTourneyOpen] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    };

    const handleDeletePlayer = (playerId: number) => {
        setPlayers(players.filter(p => p.id !== playerId));
    };

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleBulkUpdate = (updates: Partial<Player>) => {
        const updatedPlayers = players.map(player => 
            selectedPlayerIds.has(player.id) ? { ...player, ...updates } : player
        );
        setPlayers(updatedPlayers);
        setSelectedPlayerIds(new Set());
    };

    const handleClearSelection = () => {
        setSelectedPlayerIds(new Set());
    };

    const handleToggleEdit = () => {
        if (isEditing && isDirty) {
            onSaveChanges();
        }
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        // Here you would revert changes. For simplicity, we'll just exit editing mode.
        // A more robust solution would involve refetching original players.
        setIsEditing(false);
    };

    const filteredPlayers = useMemo(() => {
        let filtered = [...players];

        if (positionFilter !== 'all') {
            filtered = filtered.filter(p => (p.is_defense ? 'defense' : 'forward') === positionFilter);
        }
        if (skillFilter !== 'all') {
            filtered = filtered.filter(p => p.skill === parseInt(skillFilter));
        }

        filtered.sort((a, b) => {
            let valA: string | number, valB: string | number;

            switch (sortConfig.field) {
                case 'name':
                    valA = `${a.first_name} ${a.last_name}`;
                    valB = `${b.first_name} ${b.last_name}`;
                    break;
                case 'skill':
                    valA = a.skill;
                    valB = b.skill;
                    break;
                case 'position':
                    valA = a.is_defense ? 1 : 0;
                    valB = b.is_defense ? 1 : 0;
                    break;
            }
            
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [players, positionFilter, skillFilter, sortConfig]);

    const paginatedPlayers = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return filteredPlayers.slice(start, end);
    }, [filteredPlayers, currentPage, rowsPerPage]);
    
    const totalPages = Math.ceil(filteredPlayers.length / rowsPerPage);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <Users size={48} className="mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">Loading...</h3>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {isEditing && selectedPlayerIds.size > 0 && (
                <BulkActions
                    selectedPlayers={players.filter(p => selectedPlayerIds.has(p.id))}
                    onBulkUpdate={handleBulkUpdate}
                    onClearSelection={() => setSelectedPlayerIds(new Set())}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <select 
                        data-testid="position-filter"
                        value={positionFilter} 
                        onChange={(e) => setPositionFilter(e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                    >
                        <option value="all">All Positions</option>
                        <option value="forward">Forwards</option>
                        <option value="defense">Defense</option>
                    </select>
                    <select 
                        value={skillFilter} 
                        onChange={(e) => setSkillFilter(e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                    >
                        <option value="all">All Skills</option>
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(skill => (
                            <option key={skill} value={skill}>{skill}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setIsTourneyOpen(true)}
                        variant="outline"
                        className="text-sm hidden"
                        disabled={players.length < 2}
                        title={players.length < 2 ? "Need at least 2 players" : "Start Player Rank Tournament"}
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Rank Tourney
                    </Button>
                    <Button 
                        onClick={handleToggleEdit}
                        variant={isEditing ? 'primary' : 'outline'}
                        data-action={isEditing ? "Done Editing" : "Start Editing"}
                    >
                        {isEditing ? 'Done Editing' : 'Edit Roster'}
                    </Button>
                    {isEditing && (
                        <Button
                            onClick={handleCancelEdit}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
            
            {players.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 animate-slide-in-from-left">
                        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6 animate-slide-in-from-left">
                            <div className="space-y-4">
                                <h4 className="font-semibold text-gray-700">Sort by</h4>
                                <div className="flex items-center gap-2">
                                    {['name', 'skill', 'position'].map((field) => (
                                        <Button
                                            key={field}
                                            variant={sortConfig.field === field ? 'secondary' : 'outline'}
                                            size="sm"
                                            onClick={() => handleSort(field as SortField)}
                                            className="flex-1"
                                        >
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                            {sortConfig.field === field && (
                                                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 animate-slide-in-from-right">
                            <PlayerTable 
                                players={paginatedPlayers} 
                                onUpdate={handlePlayerUpdate} 
                                isEditing={isEditing}
                                onDeletePlayer={handleDeletePlayer}
                            />

                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {Math.min(filteredPlayers.length > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0, filteredPlayers.length)}
                                    - {Math.min(currentPage * rowsPerPage, filteredPlayers.length)} of {filteredPlayers.length} players
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button size="sm" variant="outline" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm font-medium px-4">{currentPage} / {totalPages}</span>
                                    <Button size="sm" variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <PlayerRankTourneyDialog
                isOpen={isTourneyOpen}
                onClose={() => setIsTourneyOpen(false)}
                players={players}
                onApplyRankings={setPlayers}
            />
        </div>
    );
} 