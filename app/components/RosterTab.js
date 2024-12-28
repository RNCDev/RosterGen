// app/components/RosterTab.js
'use client';
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

export const RosterTab = ({ teams, generateRosters, players, loading }) => {
  return (
    <div className="roster-tab">
      {teams.red.forwards.length > 0 ? (
        <div className="teams-display grid md:grid-cols-2 gap-4">
          <div className="red-team team-card bg-red-50 p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-3 text-red-600 border-b pb-2">Red Team</h2>
            <div className="forwards mb-4">
              <h3 className="font-semibold text-red-700 mb-2">Forwards</h3>
              {teams.red.forwards.map(player => (
                <div 
                  key={player.id} 
                  className="player-item bg-red-100 rounded px-3 py-2 mb-1 flex justify-between items-center"
                >
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-sm text-red-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold text-red-700 mb-2">Defensemen</h3>
              {teams.red.defensemen.map(player => (
                <div 
                  key={player.id} 
                  className="player-item bg-red-100 rounded px-3 py-2 mb-1 flex justify-between items-center"
                >
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-sm text-red-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="white-team team-card bg-gray-50 p-4 rounded shadow">
            <h2 className="text-lg font-bold mb-3 text-gray-600 border-b pb-2">White Team</h2>
            <div className="forwards mb-4">
              <h3 className="font-semibold text-gray-700 mb-2">Forwards</h3>
              {teams.white.forwards.map(player => (
                <div 
                  key={player.id} 
                  className="player-item bg-gray-100 rounded px-3 py-2 mb-1 flex justify-between items-center"
                >
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-sm text-gray-600">Skill: {player.skill}</span>
                </div>
              ))}
            </div>
            <div className="defensemen">
              <h3 className="font-semibold text-gray-700 mb-2">Defensemen</h3>
              {teams.white.defensemen.map(player => (
                <div 
                  key={player.id} 
                  className="player-item bg-gray-100 rounded px-3 py-2 mb-1 flex justify-between items-center"
                >
                  <span>{player.first_name} {player.last_name}</span>
                  <span className="text-sm text-gray-600">Skill: {player.skill}</span>
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
            disabled={players.length === 0 || loading}
          >
            <ArrowLeftRight className="mr-2" /> 
            {loading ? 'Generating...' : 'Generate Teams'}
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
};
