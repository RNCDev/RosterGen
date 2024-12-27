// components/players/PlayerTable.js
import React from 'react';
import { PlayerRow } from './PlayerRow';

export function PlayerTable({ players, onUpdatePlayer, onDeletePlayer, onAddPlayer }) {
  const handleAddPlayer = () => {
    const newPlayer = {
      id: Date.now(), // temporary ID
      name: '',
      position: '',
      skillLevel: 5,
      status: true
    };
    onAddPlayer(newPlayer);
  };

  return (
    <div className="space-y-4">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Players List
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Manage your player roster here
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={handleAddPlayer}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add Player
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full py-2 align-middle">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Position</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Skill Level</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Active</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {players.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onUpdate={onUpdatePlayer}
                    onDelete={onDeletePlayer}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
