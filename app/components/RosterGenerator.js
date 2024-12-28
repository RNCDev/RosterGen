// app/components/RosterGenerator.js
'use client';
import React, { useState, useEffect } from 'react';
import { PlayersTab } from './PlayersTab';
import { RosterTab } from './RosterTab';

export const RosterGenerator = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ 
    red: { forwards: [], defensemen: [] }, 
    white: { forwards: [], defensemen: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch players on component mount
  useEffect(() => {
    fetchPlayers();
  }, []);

  // Fetch players from API
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      if (!response.ok) throw new Error('Failed to fetch players');
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError('Failed to load players');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate balanced rosters
  const generateRosters = async () => {
    setLoading(true);
    setError(null);

    try {
      const attendingPlayers = players.filter(p => p.is_attending);
      const forwards = attendingPlayers.filter(p => !p.is_defense);
      const defensemen = attendingPlayers.filter(p => p.is_defense);

      const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
      const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

      const newTeams = {
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] }
      };

      sortedForwards.forEach((player, index) => {
        if (index % 2 === 0) {
          newTeams.red.forwards.push(player);
        } else {
          newTeams.white.forwards.push(player);
        }
      });

      sortedDefensemen.forEach((player, index) => {
        if (index % 2 === 0) {
          newTeams.red.defensemen.push(player);
        } else {
          newTeams.white.defensemen.push(player);
        }
      });

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          redTeam: newTeams.red,
          whiteTeam: newTeams.white,
          sessionDate: new Date().toISOString().split('T')[0]
        }),
      });

      if (!response.ok) throw new Error('Failed to save teams');
      
      setTeams(newTeams);
      setActiveTab('roster');
    } catch (err) {
      setError('Failed to generate teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Hockey Roster Generator</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="border-b">
        <nav className="-mb-px flex">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'players'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button
            className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'roster'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('roster')}
          >
            Roster
          </button>
        </nav>
      </div>

      {activeTab === 'players' ? (
        <PlayersTab 
          players={players}
          setPlayers={setPlayers}
          loading={loading}
          setLoading={setLoading}
          error={error}
          setError={setError}
          fetchPlayers={fetchPlayers}
        />
      ) : (
        <RosterTab 
          teams={teams}
          generateRosters={generateRosters}
          players={players}
          loading={loading}
        />
      )}
    </div>
  );
};
