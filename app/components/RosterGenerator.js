"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

export function RosterGenerator() {
  const [activeTab, setActiveTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({
    red: { forwards: [], defensemen: [] },
    white: { forwards: [], defensemen: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      setPlayers(data);
    } catch (err) {
      setError("Failed to load players");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      await fetchPlayers();
    } catch (err) {
      setError('Failed to upload file');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateRosters = async () => {
    setLoading(true);
    setError(null);
    try {
      const attendingPlayers = players.filter((p) => p.is_attending);
      const forwards = attendingPlayers.filter((p) => !p.is_defense);
      const defensemen = attendingPlayers.filter((p) => p.is_defense);

      const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
      const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

      const newTeams = {
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
      };

      // Distribute players
      sortedForwards.forEach((player, index) => {
        if (index % 2 === 0) newTeams.red.forwards.push(player);
        else newTeams.white.forwards.push(player);
      });

      sortedDefensemen.forEach((player, index) => {
        if (index % 2 === 0) newTeams.red.defensemen.push(player);
        else newTeams.white.defensemen.push(player);
      });

      setTeams(newTeams);
      setActiveTab("roster");
    } catch (err) {
      setError("Failed to generate teams");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      {/* Left Navigation */}
      <div className="w-64 min-h-screen bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-8">Hockey Roster</h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("players")}
              className={`w-full px-4 py-2 text-left rounded transition-colors ${
                activeTab === "players"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`w-full px-4 py-2 text-left rounded transition-colors ${
                activeTab === "roster"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Roster
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "players" ? (
            <div className="space-y-6">
              {/* Header with buttons */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Player List</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={generateRosters}
                    disabled={loading || players.length === 0}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Roster
                  </button>
                  
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center">
                      <ArrowUpFromLine className="mr-2 h-5 w-5" />
                      Upload CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Players Table */}
              {players.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">First Name</th>
                        <th className="border p-2 text-left">Last Name</th>
                        <th className="border p-2 text-left">Skill</th>
                        <th className="border p-2 text-left">Position</th>
                        <th className="border p-2 text-left">Attending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id || `${player.first_name}-${player.last_name}`} className="hover:bg-gray-50">
                          <td className="border p-2">{player.first_name}</td>
                          <td className="border p-2">{player.last_name}</td>
                          <td className="border p-2">{player.skill}</td>
                          <td className="border p-2">{player.is_defense ? "Defense" : "Forward"}</td>
                          <td className="border p-2">{player.is_attending ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No players found. Upload a CSV to add players.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Rosters</h2>
              {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Red Team */}
                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">Red Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Forwards</h4>
                        {teams.red.forwards.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Defense</h4>
                        {teams.red.defensemen.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* White Team */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">White Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Forwards</h4>
                        {teams.white.forwards.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Defense</h4>
                        {teams.white.defensemen.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={generateRosters}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
                    disabled={players.length === 0 || loading}
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Teams
                  </button>
                  {players.length === 0 && (
                    <p className="text-red-500 mt-2">Please add players before generating teams.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
