// components/RosterGenerator.js
'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export const RosterGenerator = () => {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ red: { forwards: [], defensemen: [] }, white: { forwards: [], defensemen: [] }});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Placeholder for PlayersTab
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
        />
      </div>
      
      {loading ? (
        <p>Loading players...</p>
      ) : (
        <div className="players-list">
          <h2 className="text-lg font-semibold mb-3">Player List</h2>
          {players.length > 0 ? (
            <ul>
              {players.map(player => (
                <li key={player.id} className="mb-2 p-2 border rounded">
                  {player.first_name} {player.last_name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No players found. Upload a CSV to add players.</p>
          )}
        </div>
      )}
    </div>
  );

  // Placeholder for RosterTab
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
                  {player.first_name} {player.last_name}
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold">Defensemen</h3>
              {teams.red.defensemen.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name}
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
                  {player.first_name} {player.last_name}
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold">Defensemen</h3>
              {teams.white.defensemen.map(player => (
                <div key={player.id} className="player-item">
                  {player.first_name} {player.last_name}
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
          >
            <ArrowLeftRight className="mr-2" /> Generate Teams
          </button>
        </div>
      )}
    </div>
  );

  // Rest of the existing methods remain the same (fetchPlayers, handleFileUpload, etc.)
  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    // Your existing fetchPlayers method
    console.log('Fetching players');
  };

  const handleFileUpload = async (event) => {
    // Your existing handleFileUpload method
    console.log('File upload initiated');
  };

  const generateRosters = async () => {
    // Your existing generateRosters method
    console.log('Generating rosters');
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
};
