import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import Papa from 'papaparse';

export default function RosterGenerator() {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ 
    red: { forwards: [], defensemen: [] }, 
    white: { forwards: [], defensemen: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/players');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch players: ${errorText}`);
      }
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError(`Failed to load players: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: header => header.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: async (results) => {
          try {
            if (results.errors.length > 0) {
              throw new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`);
            }

            for (const row of results.data) {
              // Handle both camelCase and snake_case column names
              const playerData = {
                first_name: (row.first_name || row.firstName || row.firstname || '')?.trim(),
                last_name: (row.last_name || row.lastName || row.lastname || '')?.trim(),
                skill: parseInt(row.skill || row.skill_level || '0'),
                is_defense: (row.defense || row.is_defense || row.isDefense || '0')?.toString().toLowerCase() === 'true' || 
                          (row.defense || row.is_defense || row.isDefense || '0')?.toString() === '1',
                is_attending: (row.attending || row.is_attending || row.isAttending || '1')?.toString().toLowerCase() === 'true' || 
                            (row.attending || row.is_attending || row.isAttending || '1')?.toString() === '1'
              };

              if (!playerData.first_name || !playerData.last_name) {
                throw new Error(`Missing required fields for player: ${JSON.stringify(row)}`);
              }

              const response = await fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData),
              });

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to add player ${playerData.first_name} ${playerData.last_name}: ${errorText}`);
              }
            }

            await fetchPlayers();
            setError(null);
          } catch (err) {
            setError(`Failed to process players: ${err.message}`);
            console.error('Processing error:', err);
          } finally {
            setLoading(false);
          }
        },
        error: (err) => {
          setError(`Failed to parse CSV: ${err.message}`);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
      setLoading(false);
    }
  };

  const updatePlayer = async (id, field, value) => {
    const playerToUpdate = players.find(p => p.id === id);
    if (!playerToUpdate) return;

    setLoading(true);
    setError(null);

    try {
      const updatedData = {
        ...playerToUpdate,
        [field]: field === 'skill' ? Number(value) : 
                 field === 'is_defense' || field === 'is_attending' ? Boolean(value) : 
                 value
      };

      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedData }),
      });

      if (!response.ok) throw new Error('Failed to update player');
      await fetchPlayers();
    } catch (err) {
      setError(`Failed to update player: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      setError('Failed to save teams');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PlayersTab = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className="mb-4 space-y-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">First Name</th>
                <th className="border p-2">Last Name</th>
                <th className="border p-2">Skill (1-10)</th>
                <th className="border p-2">Defense</th>
                <th className="border p-2">Attending</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.id || index} className="hover:bg-gray-50">
                  <td className="border p-2">
                    <input
                      type="text"
                      value={player.first_name}
                      onChange={(e) => updatePlayer(player.id || index, 'first_name', e.target.value)}
                      className="w-full p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="text"
                      value={player.last_name}
                      onChange={(e) => updatePlayer(player.id, 'last_name', e.target.value)}
                      className="w-full p-1"
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={player.skill}
                      onChange={(e) => updatePlayer(player.id, 'skill', e.target.value)}
                      className="w-full p-1"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={player.is_defense}
                      onChange={(e) => updatePlayer(player.id, 'is_defense', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={player.is_attending}
                      onChange={(e) => updatePlayer(player.id, 'is_attending', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {players.length > 0 && (
          <button
            onClick={generateRosters}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md
              hover:bg-blue-700 transition-colors"
          >
            Generate Teams
          </button>
        )}
      </div>
    );
  };

  const RosterTab = () => {
    if (loading) {
      return (
        <div className="col-span-2 flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-6 mt-4">
        {/* Red Team */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-red-600 text-white p-4">
            <h2 className="text-xl font-bold">Red Team</h2>
          </div>
          <div className="p-4">
            <h3 className="font-bold mb-2">Forwards</h3>
            <div className="space-y-1 mb-4">
              {teams.red.forwards.map((player, index) => (
                <div key={player.id || `red-forward-${index}`} className="flex justify-between p-2 bg-gray-50">
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-gray-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
            <h3 className="font-bold mb-2">Defense</h3>
            <div className="space-y-1">
              {teams.red.defensemen.map((player, index) => (
                <div key={player.id || `red-defense-${index}`} className="flex justify-between p-2 bg-gray-50">
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-gray-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* White Team */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-4">
            <h2 className="text-xl font-bold">White Team</h2>
          </div>
          <div className="p-4">
            <h3 className="font-bold mb-2">Forwards</h3>
            <div className="space-y-1 mb-4">
              {teams.white.forwards.map((player, index) => (
                <div key={player.id || `white-forward-${index}`} className="flex justify-between p-2 bg-gray-50">
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-gray-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
            <h3 className="font-bold mb-2">Defense</h3>
            <div className="space-y-1">
              {teams.white.defensemen.map((player, index) => (
                <div key={player.id || `white-defense-${index}`} className="flex justify-between p-2 bg-gray-50">
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-gray-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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

      {activeTab === 'players' ? <PlayersTab /> : <RosterTab />}
    </div>
  );
}
