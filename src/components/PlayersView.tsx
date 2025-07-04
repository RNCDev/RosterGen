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
import PlayerActionBar from '@/components/PlayerActionBar';
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

    const filtersState = usePlayerFilters(players);
    const paginationState = usePlayerPagination(filtersState.filteredPlayers);
    const editingState = usePlayerEditing();

    const handlePlayerUpdate = (player: Player) => {
        const updatedPlayers = players.map(p => p.id === player.id ? player : p);
        setPlayers(updatedPlayers);
    };

    const handleDeletePlayer = (playerId: number) => {
        const updatedPlayers = players.filter(p => p.id !== playerId);
        setPlayers(updatedPlayers);
        editingState.setSelectedPlayerIds(new Set([...editingState.selectedPlayerIds].filter(id => id !== playerId)));
    };

    const handleToggleEdit = () => {
        editingState.handleToggleEdit(isDirty, onSaveChanges);
    };

    const handleBulkUpdate = (updates: Partial<Player>) => {
        editingState.handleBulkUpdate(updates, players, setPlayers);
    };

    return (
        <div className="animate-fade-in">
            <PlayerActionBar
                isEditing={editingState.isEditing}
                isDirty={isDirty}
                onToggleEdit={handleToggleEdit}
                positionFilter={filtersState.positionFilter}
                skillFilter={filtersState.skillFilter}
                searchQuery={filtersState.searchQuery}
                sortConfig={filtersState.sortConfig}
                onPositionFilterChange={filtersState.setPositionFilter}
                onSkillFilterChange={filtersState.setSkillFilter}
                onSearchQueryChange={filtersState.setSearchQuery}
                onSort={filtersState.handleSort}
                selectedPlayers={players.filter(p => editingState.selectedPlayerIds.has(p.id))}
                onBulkUpdate={handleBulkUpdate}
                onClearSelection={editingState.handleClearSelection}
            />
            
            {loading ? (
                <PlayerEmptyState />
            ) : (
                <div className="flex flex-row gap-4 w-full">
                    <div className="flex-1">
                        <PlayerTable 
                            players={paginationState.paginatedItems} 
                            onUpdate={handlePlayerUpdate} 
                            isEditing={editingState.isEditing}
                            onDeletePlayer={handleDeletePlayer}
                            selectedPlayerIds={editingState.selectedPlayerIds}
                            onTogglePlayerSelection={editingState.handleTogglePlayerSelection}
                            onToggleAllPlayers={() => editingState.handleToggleAllPlayers(paginationState.paginatedItems)}
                            sortConfig={filtersState.sortConfig}
                            onSort={filtersState.handleSort}
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