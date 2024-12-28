// components/RosterGenerator.js
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import Papa from 'papaparse';

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

  // Handle CSV file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Validate CSV structure from file
          const requiredFields = ['firstName', 'lastName', 'skill', 'defense', 'attending'];
          const missingFields = requiredFields.filter(field => 
            !results.meta.fields.includes(field)
          );

          if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
          }

          // Process and upload each player
          const uploadPromises = results.data.map(async (playerData) => {
            // Validate and transform player data
            const player = {
              first_name: playerData.firstName.trim(),
              last_name: playerData.lastName.trim(),
              skill: Number(playerData.skill) || 0,
              is_defense: Number(playerData.defense) === 1,
              is_attending: Number(playerData.attending) === 1
            };

            // Send player to API
            const response = await fetch('/api/players', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(player)
            });

            if (!response.ok) {
              throw new Error(`Failed to upload player: ${player.first_name} ${player.last_name}`);
            }

            return player;
          });

          // Wait for all players to be uploaded
          await Promise.all(uploadPromises);

          // Refresh player list
          await fetchPlayers();

          // Show success message
          alert(`Successfully uploaded ${results.data.length} players`);
        } catch (err) {
          setError(err.message);
          console.error('CSV Upload Error:', err);
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setError('Error parsing CSV file');
        console.error('CSV Parsing Error:', error);
        setLoading(false);
      }
    });
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

  // Players Tab Component
  const PlayersTab = () => (
    <div className="players-tab">
      <div className="file-upload-section mb-4">
        <label htmlFor="csv-upload" className="block mb-2 text-sm font-medium text-gray-700">
          Upload Players CSV
        </label>
        <input 
          type="file" 
          id="csv-upload" 
          accept=".csv" 
          onChange={handleFileUpload} 
          className="w-full p-2 border rounded"
          disabled={loading}
        />
        {loading && <p className="text-blue-500 mt-2">Processing CSV...</p>}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="players-list">
        <h2 className="text-lg font-semibold mb-3">Player List</h2>
        {players.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">First Name</th>
                <th className="border p-2">Last Name</th>
                <th className="border p-2">Skill</th>
                <th className="border p-2">Position</th>
                <th className="border p-2">Attending</th>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="border p-2">{player.first_name}</td>
                  <td className="border p-2">{player.last_name}</td>
                  <td className="border p-2">{player.skill}</td>
                  <td className="border p-2">{player.is_defense ? 'Defense' : 'Forward'}</td>
                  <td className="border p-2">{player.is_attending ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No players found. Upload a CSV to add players.</p>
        )}
      </div>
    </div>
  );

  // Roster Tab Component
  const RosterTab = () => (
    <div className="roster-tab">
      {teams.red.forwards.length > 0 ? (
        <div className="teams-display grid md:grid-cols-2 gap-4">
          <div className="red-team team-card bg-red-50 p-4 rounded">
            <h2 className="text-lg font-bold mb-3 text-red-600">Red Team</h2>
            <div className="forwards mb-3">
              <h3 className="font-semibold">Forwards</h3>
              {teams.red.forwards.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name} (Skill: {player.skill})
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold">Defensemen</h3>
              {teams.red.defensemen.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name} (Skill: {player.skill})
                </div>
              ))}
            </div>
          </div>
          
          <div className="white-team team-card bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-bold mb-3 text-gray-600">White Team</h2>
            <div className="forwards mb-3">
              <h3 className="font-semibold">Forwards</h3>
              {teams.white.forwards.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name} (Skill: {player.skill})
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold">Defensemen</h3>
              {teams.white.defensemen.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name} (Skill: {player.skill})
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="no-teams-generated text-center py-8">
          <button 
            onClick={generateRosters} 
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 inline-flex items-center"
            disabled={players.length === 0}
          >
            <ArrowLeftRight className="mr-2" /> Generate Teams
          </button>
          {players.length === 0 && (
            <p className="text-red-500 mt-2">
              Please upload players first before generating teams.
            </p>
          )}
        </div>
      )}
    </div>
  );

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

      {activeTab === 'players' ? <PlayersTab /> : <RosterTab />}
    </div>
  );
};
