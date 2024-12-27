// components/players/PlayerRow.js
import React, { useState } from 'react';

export function PlayerRow({ player, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(editedPlayer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPlayer(player);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedPlayer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editedPlayer.name}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          <span className="font-medium text-gray-900">{player.name}</span>
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {isEditing ? (
          <input
            type="text"
            name="position"
            value={editedPlayer.position}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          player.position
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        {isEditing ? (
          <input
            type="number"
            name="skillLevel"
            value={editedPlayer.skillLevel}
            onChange={handleChange}
            min="1"
            max="10"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        ) : (
          player.skillLevel
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <input
          type="checkbox"
          checked={player.status}
          onChange={(e) => onUpdate({ ...player, status: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-green-600 hover:text-green-900"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-900"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(player.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
