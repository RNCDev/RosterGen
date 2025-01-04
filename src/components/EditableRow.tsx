import React, { useState } from 'react';
import { PlayerDB } from '@/types/PlayerTypes';
import { Check, X, Trash2, Edit2 } from 'lucide-react';

interface EditableRowProps {
    player: PlayerDB;
    onSave: (updatedPlayer: PlayerDB) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
}

const EditableRow = ({ player, onSave, onDelete }: EditableRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<PlayerDB>(player);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = () => {
        setIsEditing(true);
        setEditedPlayer(player); // Reset to original values when starting edit
    };

    const handleSave = async () => {
        try {
            // Validate data before sending
            if (!editedPlayer.first_name?.trim() || !editedPlayer.last_name?.trim()) {
                setError('First name and last name are required');
                return;
            }

            const playerToSave: PlayerDB = {
                ...player, // Start with original player to ensure we have all fields
                ...editedPlayer, // Override with edited values
                first_name: editedPlayer.first_name.trim(),
                last_name: editedPlayer.last_name.trim(),
                skill: Number(editedPlayer.skill),
                is_defense: Boolean(editedPlayer.is_defense),
                is_attending: Boolean(editedPlayer.is_attending),
                id: player.id,
                group_code: player.group_code
            };

            console.log('Saving player with data:', playerToSave);
            await onSave(playerToSave);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            console.error('Error in handleSave:', err);
            setError(err instanceof Error ? err.message : 'Failed to save changes');
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedPlayer(player); // Reset to original values
        setError(null);
    };

    const handleDelete = async () => {
        if (onDelete) {
            try {
                await onDelete(player.id);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete player');
            }
        }
    };

    return isEditing ? (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="text"
                    value={editedPlayer.first_name}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="text"
                    value={editedPlayer.last_name}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                    className="block w-full rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={editedPlayer.skill}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                    className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={editedPlayer.is_defense ? "yes" : "no"}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "yes" }))}
                    className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={editedPlayer.is_attending ? "yes" : "no"}
                    onChange={(e) => setEditedPlayer(prev => ({
                        ...prev,
                        is_attending: e.target.value === "yes"
                    }))}
                    className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100 transition-colors"
                        title="Save"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                        title="Cancel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    ) : (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap">{player.first_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{player.last_name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{player.skill}</td>
            <td className="px-6 py-4 whitespace-nowrap">{player.is_defense ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 whitespace-nowrap">{player.is_attending ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleEdit}
                        className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-100 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100 transition-colors"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default EditableRow; 