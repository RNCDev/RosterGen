// app/components/players/PlayerTable.js
import React from 'react';
import { PlayerRow } from './PlayerRow';

export const PlayerTable = ({ players, onUpdatePlayer, debounceUpdate = false }) => {
  
    const debouncedUpdate = debounce((id, field, value) => {
        onUpdatePlayer(id, field, value);
    }, 500); // Debounce for 500ms

    const handleInputChange = (event, player) => {
        const { name, value } = event.target;
        if (debounceUpdate) {
            debouncedUpdate(player.id, name, value);
        } else {
            onUpdatePlayer(player.id, name, value);
        }
    };
  
  return (
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
  );
}
