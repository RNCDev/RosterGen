'use client';

import { useState, useCallback } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { isEqual } from '@/lib/utils';

export interface PlayerManagementState {
  players: Player[];
  originalPlayers: Player[];
  isDirty: boolean;
  setPlayers: (players: Player[]) => void;
  setOriginalPlayers: (players: Player[]) => void;
  handleAddPlayer: (playerData: Omit<Player, 'id' | 'group_id'>, groupId: number, onReload: () => Promise<void>) => Promise<void>;
  handleCsvUpload: (csvPlayers: Omit<Player, 'id' | 'group_id'>[], groupId: number, onReload: () => Promise<void>) => Promise<void>;
  handleSaveChanges: (groupId: number, onReload: () => Promise<void>) => Promise<void>;
  clearPlayers: () => void;
}

export function usePlayerManagement(): PlayerManagementState {
  const [players, setPlayers] = useState<Player[]>([]);
  const [originalPlayers, setOriginalPlayers] = useState<Player[]>([]);

  const isDirty = !isEqual(players, originalPlayers);

  const handleAddPlayer = useCallback(async (
    playerData: Omit<Player, 'id' | 'group_id'>, 
    groupId: number,
    onReload: () => Promise<void>
  ) => {
    const response = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...playerData, group_id: groupId })
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to add player');
    }
    await onReload();
  }, []);

  const handleCsvUpload = useCallback(async (
    csvPlayers: Omit<Player, 'id' | 'group_id'>[], 
    groupId: number,
    onReload: () => Promise<void>
  ) => {
    const response = await fetch('/api/players/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId, players: csvPlayers })
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to upload CSV');
    }
    await onReload();
  }, []);

  const handleSaveChanges = useCallback(async (groupId: number, onReload: () => Promise<void>) => {
    const isDirtyCheck = !isEqual(players, originalPlayers);
    if (!isDirtyCheck) return;

    const playersToCreate = players
      .filter(p => typeof p.id === 'string' || p.id < 0)
      .map(({ id, ...rest }) => rest);
    
    const playersToUpdate = players.filter(p => {
      const original = originalPlayers.find(op => op.id === p.id);
      return original && !isEqual(p, original);
    });

    const originalPlayerIds = new Set(originalPlayers.map(p => p.id));
    const currentPlayerIds = new Set(players.map(p => p.id));
    const playersToDelete = [...originalPlayerIds].filter(id => !currentPlayerIds.has(id));

    const response = await fetch(`/api/players/bulk`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        playersToCreate,
        playersToUpdate,
        playersToDelete
      })
    });

    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to save changes');
    }

    await onReload();
  }, [players, originalPlayers]);

  const clearPlayers = useCallback(() => {
    setPlayers([]);
    setOriginalPlayers([]);
  }, []);

  return {
    players,
    originalPlayers,
    isDirty,
    setPlayers,
    setOriginalPlayers,
    handleAddPlayer,
    handleCsvUpload,
    handleSaveChanges,
    clearPlayers,
  };
} 