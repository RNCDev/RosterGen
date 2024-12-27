// hooks/usePlayerManagement.js
'use client';

import { useState, useCallback } from 'react';

export const usePlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    if (typeof window === 'undefined') return; // Guard for SSR
    
    setLoading(true);
    try {
      const savedPlayers = localStorage.getItem('hockey-players');
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

  const savePlayersToStorage = useCallback((newPlayers) => {
    if (typeof window === 'undefined') return; // Guard for SSR
    try {
      localStorage.setItem('hockey-players', JSON.stringify(newPlayers));
    } catch (err) {
      console.error('Error saving to localStorage:', err);
    }
  }, []);

  const updatePlayer = useCallback(async (updatedPlayer) => {
    setLoading(true);
    try {
      setPlayers(currentPlayers => {
        const newPlayers = currentPlayers.map(player =>
          player.id === updatedPlayer.id ? updatedPlayer : player
        );
        savePlayersToStorage(newPlayers);
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to update player');
      console.error('Error updating player:', err);
    } finally {
      setLoading(false);
    }
  }, [savePlayersToStorage]);

  const deletePlayer = useCallback(async (playerId) => {
    setLoading(true);
    try {
      setPlayers(currentPlayers => {
        const newPlayers = currentPlayers.filter(player => player.id !== playerId);
        savePlayersToStorage(newPlayers);
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to delete player');
      console.error('Error deleting player:', err);
    } finally {
      setLoading(false);
    }
  }, [savePlayersToStorage]);

  const addPlayer = useCallback(async (playerData) => {
    setLoading(true);
    try {
      const newPlayer = {
        ...playerData,
        id: Date.now(),
        status: true,
        skillLevel: playerData.skillLevel || 5
      };
      
      setPlayers(currentPlayers => {
        const newPlayers = [...currentPlayers, newPlayer];
        savePlayersToStorage(newPlayers);
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to add player');
      console.error('Error adding player:', err);
    } finally {
      setLoading(false);
    }
  }, [savePlayersToStorage]);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      const parsedPlayers = rows.slice(1).map((row, index) => {
        const values = row.split(',').map(val => val.trim());
        return {
          id: Date.now() + index,
          name: values[0] || '',
          position: values[1] || '',
          skillLevel: parseInt(values[2]) || 5,
          status: values[3] ? values[3].toLowerCase() === 'true' : true
        };
      });
      
      setPlayers(currentPlayers => {
        const newPlayers = [...currentPlayers, ...parsedPlayers];
        savePlayersToStorage(newPlayers);
        return newPlayers;
      });
      setError(null);
    } catch (err) {
      setError('Failed to process CSV file');
      console.error('Error processing CSV:', err);
    } finally {
      setLoading(false);
    }
  }, [savePlayersToStorage]);

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
