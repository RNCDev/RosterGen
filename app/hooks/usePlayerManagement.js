// hooks/usePlayerManagement.js
import { useState, useCallback } from 'react';

export function usePlayerManagement() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlayer = async (updatedPlayer) => {
    try {
      const response = await fetch(`/api/players/${updatedPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPlayer),
      });
      
      if (!response.ok) throw new Error('Failed to update player');
      
      setPlayers(current =>
        current.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePlayer = async (playerId) => {
    try {
      const response = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete player');
      
      setPlayers(current => current.filter(p => p.id !== playerId));
    } catch (err) {
      setError(err.message);
    }
  };

  const addPlayer = async (newPlayer) => {
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPlayer),
      });
      
      if (!response.ok) throw new Error('Failed to add player');
      
      const savedPlayer = await response.json();
      setPlayers(current => [...current, savedPlayer]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/players/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload players');
      
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
    players,
    loading,
    error,
    fetchPlayers,
    updatePlayer,
    deletePlayer,
    addPlayer,
    handleFileUpload,
  };
}
