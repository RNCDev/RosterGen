// app/components/PlayersTab.js
'use client';
import React from 'react';
import Papa from 'papaparse';
import { ArrowUpFromLine } from 'lucide-react';

export const PlayersTab = ({ 
  players, 
  setPlayers, 
  loading, 
  setLoading, 
  error, 
  setError, 
  fetchPlayers 
}) => {
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

  return (
    <div className="players-tab">
      <div className="file-upload-section mb-4 flex items-center space-x-4">
        <label 
          htmlFor="csv-upload" 
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          <ArrowUpFromLine className="mr-2" />
          Upload Players CSV
          <input 
            type="file" 
            id="csv-upload" 
            accept=".csv" 
            onChange={handleFileUpload} 
            className="hidden"
            disabled={loading}
          />
        </label>
        {loading && <p className="text-blue-500">Processing CSV...</p>}
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
};
