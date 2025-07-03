'use client';

import React from 'react';
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
import { usePlayerFilters } from '@/hooks/usePlayerFilters';
import { usePlayerPagination } from '@/hooks/usePlayerPagination';
import { usePlayerEditing } from '@/hooks/usePlayerEditing';

interface PlayersViewProps {
    players: Player[];
    setPlayers: (players: Player[]) => void;
    loading: boolean;
    isDirty: boolean;
    onSaveChanges: () => void;
}

export default function PlayersView({ 
    players, 
    setPlayers, 
    loading,
    isDirty,
    onSaveChanges
}: PlayersViewProps) {
    // Extract state management to custom hooks
    const filtersState = usePlayerFilters(players);
    const paginationState = usePlayerPagination(filtersState.filteredPlayers);
    const editingState = usePlayerEditing();

    const handlePlayerUpdate = (updatedPlayer: Player) => {
        setPlayers(players.map(p => (p.id === updatedPlayer.id ? updatedPlayer : p)));
    };

    const handleDeletePlayer = (playerId: number) => {
        setPlayers(players.filter(p => p.id !== playerId));
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
            {editingState.isEditing && editingState.selectedPlayerIds.size > 0 && (
                <PlayerBulkActions
                    selectedPlayers={players.filter(p => editingState.selectedPlayerIds.has(p.id))}
                    onBulkUpdate={(updates) => editingState.handleBulkUpdate(updates, players, setPlayers)}
                    onClearSelection={editingState.handleClearSelection}
                />
            )}
            
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => editingState.setIsTourneyOpen(true)}
                        variant="outline"
                        className="text-sm hidden"
                        disabled={players.length < 2}
                        title={players.length < 2 ? "Need at least 2 players" : "Start Player Rank Tournament"}
                    >
                        <Trophy className="w-4 h-4 mr-2" />
                        Rank Tourney
                    </Button>
                    <Button 
                        onClick={() => editingState.handleToggleEdit(isDirty, onSaveChanges)}
                        variant={editingState.isEditing ? 'primary' : 'outline'}
                        data-action={editingState.isEditing ? "Done Editing" : "Start Editing"}
                    >
                        {editingState.isEditing ? 'Done Editing' : 'Edit Roster'}
                    </Button>
                    {editingState.isEditing && (
                        <Button
                            onClick={editingState.handleCancelEdit}
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
                            positionFilter={filtersState.positionFilter}
                            skillFilter={filtersState.skillFilter}
                            sortConfig={filtersState.sortConfig}
                            onPositionFilterChange={filtersState.setPositionFilter}
                            onSkillFilterChange={filtersState.setSkillFilter}
                            onSort={filtersState.handleSort}
                        />

                        <div className="flex-1 animate-slide-in-from-right">
                            <PlayerTable 
                                players={paginationState.paginatedItems} 
                                onUpdate={handlePlayerUpdate} 
                                isEditing={editingState.isEditing}
                                onDeletePlayer={handleDeletePlayer}
                            />

                            <PlayerPagination
                                currentPage={paginationState.currentPage}
                                totalPages={paginationState.totalPages}
                                totalItems={filtersState.filteredPlayers.length}
                                itemsPerPage={paginationState.rowsPerPage}
                                onPageChange={paginationState.handlePageChange}
                                itemName="players"
                            />
                        </div>
                    </div>
                </div>
            )}
            
            <PlayerRankTourneyDialog
                isOpen={editingState.isTourneyOpen}
                onClose={() => editingState.setIsTourneyOpen(false)}
                players={players}
                onApplyRankings={setPlayers}
            />
        </div>
    );
} 