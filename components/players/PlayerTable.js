// components/players/PlayerTable.js
import React from 'react';
import { PlayerRow } from './PlayerRow';

export function PlayerTable({ players, onUpdatePlayer }) {
  if (!players?.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
        <p className="mt-1 text-sm text-gray-500">Upload a CSV file to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Skill Level</th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {players.map((player) => (
              <PlayerRow 
                key={player.id} 
                player={player}
                onUpdate={onUpdatePlayer}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
