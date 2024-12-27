// app/hooks/usePlayerManagement.js
import { useState, useCallback } from 'react';
import { PlayerService } from '../services/PlayerService';

export function usePlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPlayers = await PlayerService.fetchPlayers();
      setPlayers(fetchedPlayers);
    } catch (err) {
      setError(`Failed to load players: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlayer = useCallback(async (id, field, value) => {
    const playerToUpdate = players.find(p => p.id === id);
    if (!playerToUpdate) return;

    try {
      setLoading(true);
      setError(null);

      const updatedData = {
        ...playerToUpdate,
        [field]: field === 'skill' ? Number(value) : 
                field === 'is_defense' || field === 'is_attending' ? Boolean(value) : 
                value
      };

      await PlayerService.updatePlayer(id, updatedData);
      await fetchPlayers(); // Refresh the player list
    } catch (err) {
      setError(`Failed to update player: ${err.message}`);
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  }, [players, fetchPlayers]);

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      await PlayerService.uploadPlayersFromCsv(file);
      await fetchPlayers(); // Refresh the player list
    } catch (err) {
      setError(`Failed to upload players: ${err.message}`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchPlayers]);

  return {
    players,
    loading,
    error,
    fetchPlayers,
    updatePlayer,
    handleFileUpload
  };
}
