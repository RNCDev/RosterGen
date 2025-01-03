import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Check, X, Trash2, Edit2 } from 'lucide-react';

interface EditableRowProps {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
}

const EditableRow = ({ player, onSave, onDelete }: EditableRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            // Preserve the group code when saving
            const playerToSave = {
                ...editedPlayer,
                group_code: player.group_code // Ensure we keep the original group code
            };
            await onSave(playerToSave);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes');
        }
    };

    const handleDelete = async () => {
        if (onDelete) {
            try {
                await onDelete(player.id);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete player');
            }
        }
    };

    const handleCancel = () => {
        setEditedPlayer(player);
        setIsEditing(false);
        setError(null);
    };

    if (!isEditing) {
        return (
            <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-2/5">
                    {player.first_name} {player.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24 text-center">
                    <div className="flex justify-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {player.skill}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32 text-center">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {player.is_defense ? 'Defense' : 'Forward'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32 text-center">
                    <div className="flex justify-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_attending ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                            {player.is_attending ? 'Yes' : 'No'}
                        </span>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 hover:text-blue-900"
                        >
                            <Edit2 className="h-5 w-5" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-900"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="bg-blue-50">
            <td className="px-6 py-4 whitespace-nowrap w-2/5">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editedPlayer.first_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                        className="block w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editedPlayer.last_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                        className="block w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm"
                        placeholder="Last Name"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-24 text-center">
                <div className="flex justify-center">
                    <select
                        value={editedPlayer.skill}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                        className="block w-16 rounded-md border border-gray-300 px-2 py-1 text-sm text-center"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num}</option>
                        ))}
                    </select>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-32 text-center">
                <div className="flex justify-center">
                    <select
                        value={editedPlayer.is_defense ? "defense" : "forward"}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "defense" }))}
                        className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                        <option value="forward">Forward</option>
                        <option value="defense">Defense</option>
                    </select>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-32 text-center">
                <div className="flex justify-center">
                    <select
                        value={editedPlayer.is_attending ? "yes" : "no"}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_attending: e.target.value === "yes" }))}
                        className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap w-24 text-center">
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
                        title="Save"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                        title="Cancel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EditableRow;