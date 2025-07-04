import { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';

export interface PlayerEditingState {
    isEditing: boolean;
    selectedPlayerIds: Set<number>;
    isTourneyOpen: boolean;
    setIsEditing: (editing: boolean) => void;
    setSelectedPlayerIds: (ids: Set<number>) => void;
    setIsTourneyOpen: (open: boolean) => void;
    handleToggleEdit: (isDirty: boolean, onSaveChanges: () => void) => void;
    handleCancelEdit: () => void;
    handleBulkUpdate: (
        updates: Partial<Player>, 
        players: Player[], 
        setPlayers: (players: Player[]) => void
    ) => void;
    handleClearSelection: () => void;
    handleTogglePlayerSelection: (playerId: number) => void;
    handleToggleAllPlayers: (players: Player[]) => void;
}

export function usePlayerEditing(): PlayerEditingState {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<number>>(new Set());
    const [isTourneyOpen, setIsTourneyOpen] = useState(false);

    const handleToggleEdit = (isDirty: boolean, onSaveChanges: () => void) => {
        if (isEditing && isDirty) {
            onSaveChanges();
        }
        setIsEditing(!isEditing);
        // Clear selection when exiting edit mode
        if (isEditing) {
            setSelectedPlayerIds(new Set());
        }
    };

    const handleCancelEdit = () => {
        // Here you would revert changes. For simplicity, we'll just exit editing mode.
        // A more robust solution would involve refetching original players.
        setIsEditing(false);
        setSelectedPlayerIds(new Set());
    };

    const handleBulkUpdate = (
        updates: Partial<Player>, 
        players: Player[], 
        setPlayers: (players: Player[]) => void
    ) => {
        const updatedPlayers = players.map(player => 
            selectedPlayerIds.has(player.id) ? { ...player, ...updates } : player
        );
        setPlayers(updatedPlayers);
        setSelectedPlayerIds(new Set());
    };

    const handleClearSelection = () => {
        setSelectedPlayerIds(new Set());
    };

    const handleTogglePlayerSelection = (playerId: number) => {
        setSelectedPlayerIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(playerId)) {
                newSet.delete(playerId);
            } else {
                newSet.add(playerId);
            }
            return newSet;
        });
    };

    const handleToggleAllPlayers = (players: Player[]) => {
        const allSelected = players.length > 0 && players.every(p => selectedPlayerIds.has(p.id));
        if (allSelected) {
            setSelectedPlayerIds(new Set());
        } else {
            setSelectedPlayerIds(new Set(players.map(p => p.id)));
        }
    };

    return {
        isEditing,
        selectedPlayerIds,
        isTourneyOpen,
        setIsEditing,
        setSelectedPlayerIds,
        setIsTourneyOpen,
        handleToggleEdit,
        handleCancelEdit,
        handleBulkUpdate,
        handleClearSelection,
        handleTogglePlayerSelection,
        handleToggleAllPlayers
    };
} 