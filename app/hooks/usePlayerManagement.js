// hooks/usePlayerManagement.js
import { useState, useCallback } from 'react';

export const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, we'll just use localStorage
      const savedPlayers = localStorage.getItem('players');
      if (savedPlayers) {
        setPlayers(JSON.parse(savedPlayers));
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch players');
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlayer = useCallback(async (updatedPlayer) => {
    setLoading(true);
    try {
      setPlayers(currentPlayers => {
        const newPlayers = currentPlayers.map(player =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        );
        localStorage.setItem('players', JSON.stringify(newPlayers));
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to update player');
      console.error('Error updating player:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePlayer = useCallback(async (playerId) => {
    setLoading(true);
    try {
      setPlayers(currentPlayers => {
        const newPlayers = currentPlayers.filter(player => player.id !== playerId);
        localStorage.setItem('players', JSON.stringify(newPlayers));
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to delete player');
      console.error('Error deleting player:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPlayer = useCallback(async (newPlayer) => {
    setLoading(true);
    try {
      setPlayers(currentPlayers => {
        const playersWithNew = [...currentPlayers, { ...newPlayer, id: Date.now() }];
        localStorage.setItem('players', JSON.stringify(playersWithNew));
        return playersWithNew;
      });
      setError(null);
    } catch (err) {
      setError('Failed to add player');
      console.error('Error adding player:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      const headers = rows[0].split(',');
      
      const parsedPlayers = rows.slice(1).map((row, index) => {
        const values = row.split(',');
        return {
          id: Date.now() + index, // Ensure unique IDs
          name: values[0]?.trim() || '',
          position: values[1]?.trim() || '',
          skillLevel: parseInt(values[2]?.trim()) || 5,
          status: values[3] ? values[3].trim().toLowerCase() === 'true' : true
        };
      });
      
      setPlayers(currentPlayers => {
        const allPlayers = [...currentPlayers, ...parsedPlayers];
        localStorage.setItem('players', JSON.stringify(allPlayers));
        return allPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to process CSV file');
      console.error('Error processing CSV:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    players,
    loading,
    error,
    fetchPlayers,
    updatePlayer,
    deletePlayer,
    addPlayer,
    handleFileUpload
  };
};
