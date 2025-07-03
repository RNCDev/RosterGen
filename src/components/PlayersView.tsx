'use client';

import React, { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { 
    Users, 
    Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import PlayerRankTourneyDialog from '@/components/dialogs/PlayerRankTourneyDialog';
import PlayerTable from '@/components/PlayerTable';
import PlayerBulkActions from '@/components/PlayerBulkActions';
import PlayerFilters from '@/components/PlayerFilters';
import PlayerPagination from '@/components/PlayerPagination';
import PlayerEmptyState from '@/components/PlayerEmptyState';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isDirty: boolean;
    onSaveChanges: () => void;
}

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

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
                <PlayerBulkActions
                    selectedPlayers={players.filter(p => selectedPlayerIds.has(p.id))}
                    onBulkUpdate={handleBulkUpdate}
                    onClearSelection={handleClearSelection}
                />
            )}
            
            <div className="flex justify-between items-center mb-4">
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
                <PlayerEmptyState />
            ) : (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 animate-slide-in-from-left">
                        <PlayerFilters
                            positionFilter={positionFilter}
                            skillFilter={skillFilter}
                            sortConfig={sortConfig}
                            onPositionFilterChange={setPositionFilter}
                            onSkillFilterChange={setSkillFilter}
                            onSort={handleSort}
                        />

                        <div className="flex-1 animate-slide-in-from-right">
                            <PlayerTable 
                                players={paginatedPlayers} 
                                onUpdate={handlePlayerUpdate} 
                                isEditing={isEditing}
                                onDeletePlayer={handleDeletePlayer}
                            />

                            <PlayerPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={filteredPlayers.length}
                                itemsPerPage={rowsPerPage}
                                onPageChange={handlePageChange}
                                itemName="players"
                            />
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