// app/components/players/PlayerRow.js
import React from 'react';

export function PlayerRow({ player, onUpdate }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="border p-2">
        <input
          type="text"
          value={player.first_name}
          onChange={(e) => onUpdate(player.id, 'first_name', e.target.value)}
          className="w-full p-1"
        />
      </td>
      <td className="border p-2">
        <input
          type="text"
          value={player.last_name}
          onChange={(e) => onUpdate(player.id, 'last_name', e.target.value)}
          className="w-full p-1"
        />
      </td>
      <td className="border p-2">
        <input
          type="number"
          min="1"
          max="10"
          value={player.skill}
          onChange={(e) => onUpdate(player.id, 'skill', e.target.value)}
          className="w-full p-1"
        />
      </td>
      <td className="border p-2 text-center">
        <input
          type="checkbox"
          checked={player.is_defense}
          onChange={(e) => onUpdate(player.id, 'is_defense', e.target.checked)}
          className="w-4 h-4"
        />
      </td>
      <td className="border p-2 text-center">
        <input
          type="checkbox"
          checked={player.is_attending}
          onChange={(e) => onUpdate(player.id, 'is_attending', e.target.checked)}
          className="w-4 h-4"
        />
      </td>
    </tr>
  );
}
