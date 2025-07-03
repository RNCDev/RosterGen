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
    };

    const handleCancelEdit = () => {
        // Here you would revert changes. For simplicity, we'll just exit editing mode.
        // A more robust solution would involve refetching original players.
        setIsEditing(false);
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
        handleClearSelection
    };
} 