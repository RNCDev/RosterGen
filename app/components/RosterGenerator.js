"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

const RosterGenerator = () => {
  const [activeTab, setActiveTab] = useState("players");
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({
    red: { forwards: [], defensemen: [] },
    white: { forwards: [], defensemen: [] },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Existing fetch and generate functions remain the same
  const fetchPlayers = async () => {
    // ... existing fetchPlayers implementation
  };

  const generateRosters = async () => {
    // ... existing generateRosters implementation
  };

  const handleFileUpload = async (event) => {
    // ... existing handleFileUpload implementation
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Navigation Panel */}
      <nav className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-8">Hockey Roster</h1>
          <div className="space-y-2">
            <button
              onClick={() => setActiveTab("players")}
              className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                activeTab === "players"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`w-full px-4 py-2 text-left rounded-lg transition-colors ${
                activeTab === "roster"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Roster
            </button>
          </div>
          
          {/* Navigation only */}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === "players" ? (
              <div className="players-list">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Player List</h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={generateRosters}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                      disabled={loading || players.length === 0}
                    >
                      <ArrowLeftRight className="mr-2 h-5 w-5" />
                      Generate Roster
                    </button>
                    
                    <label>
                      <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center">
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
                {players.length > 0 ? (
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
                        <tr key={player.id} className="hover:bg-gray-50">
                          <td className="border p-2">{player.first_name}</td>
                          <td className="border p-2">{player.last_name}</td>
                          <td className="border p-2">{player.skill}</td>
                          <td className="border p-2">
                            {player.is_defense ? "Defense" : "Forward"}
                          </td>
                          <td className="border p-2">
                            {player.is_attending ? "Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500">No players found. Upload a CSV to add players.</p>
                )}
              </div>
            ) : (
              <div className="roster-view">
                <h2 className="text-xl font-semibold mb-4">Team Rosters</h2>
                {teams.red.forwards.length > 0 ? (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Red Team */}
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-red-700 mb-3">Red Team</h3>
                      {/* ... existing team roster display ... */}
                    </div>
                    {/* White Team */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3">White Team</h3>
                      {/* ... existing team roster display ... */}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No teams generated yet. Click "Generate Roster" to create teams.</p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default RosterGenerator;
