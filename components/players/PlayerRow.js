// components/players/PlayerRow.js
import React, { useState } from 'react';

export function PlayerRow({ player, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedPlayer(player); // Reset to original values when starting edit
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
      [name]: name === 'skillLevel' ? parseInt(value, 10) : value
    }));
  };

  const handleDelete = () => {
    // Add confirmation before deleting
    if (window.confirm('Are you sure you want to delete this player?')) {
      onDelete(player.id);
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={editedPlayer.name}
            onChange={handleChange}
            className="block w-full rounded-md border border-gray-300 p-2"
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
            className="block w-full rounded-md border border-gray-300 p-2"
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
            className="block w-full rounded-md border border-gray-300 p-2"
          />
        ) : (
          player.skillLevel
        )}
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
        <input
          type="checkbox"
          checked={isEditing ? editedPlayer.status : player.status}
          onChange={(e) => {
            if (isEditing) {
              setEditedPlayer(prev => ({ ...prev, status: e.target.checked }));
            } else {
              onUpdate({ ...player, status: e.target.checked });
            }
          }}
          className="h-4 w-4 rounded border-gray-300"
        />
      </td>
      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
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
                onClick={handleDelete}
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
