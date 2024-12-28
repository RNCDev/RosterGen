// components/PlayersGrid.js
"use client";

import { ArrowUpFromLine, ArrowLeftRight } from "lucide-react";

const PlayersGrid = ({ players }) => {
  // ... your state variables and functions for handling file uploads, generating rosters, etc.

  return (
    <div className="space-y-6">
      {/* Header with buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Player List</h2>
        <div className="flex space-x-4">
          {/* Buttons for generating rosters and uploading CSV */}
          <button
            onClick={generateRosters} // Assuming you have this function
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
                onChange={handleFileUpload} // Assuming you have this function
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
                {/* Table headers */}
                <th className="border p-2 text-left">First Name</th>
                <th className="border p-2 text-left">Last Name</th>
                <th className="border p-2 text-left">Skill</th>
                <th className="border p-2 text-left">Position</th>
                <th className="border p-2 text-left">Attending</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through players data to display rows */}
              {players.map((player) => (
                <tr
                  key={player.id || `${player.first_name}-${player.last_name}`}
                  className="hover:bg-gray-50"
                >
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
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No players found. Upload a CSV to add players.
        </p>
      )}
    </div>
  );
};

export default PlayersGrid;
