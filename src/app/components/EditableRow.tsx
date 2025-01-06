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
            const playerToSave = {
                id: editedPlayer.id,
                firstName: editedPlayer.first_name,
                lastName: editedPlayer.last_name,
                skill: editedPlayer.skill,
                defense: editedPlayer.is_defense,
                attending: editedPlayer.is_attending,
                groupCode: editedPlayer.group_code
            };
            await onSave(playerToSave as any);
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
            <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                            {player.first_name} {player.last_name}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {player.skill}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.is_defense 
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-green-50 text-green-700'
                    }`}>
                        {player.is_defense ? 'Defense' : 'Forward'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        player.is_attending
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                    }`}>
                        {player.is_attending ? 'Yes' : 'No'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center gap-3">
                        <button
                            onClick={handleEdit}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Edit"
                        >
                            <Edit2 className="h-4 w-4" />
                        </button>
                        {onDelete && (
                            <button
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className="bg-blue-50/50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editedPlayer.first_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                        className="block w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editedPlayer.last_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                        className="block w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Last Name"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center">
                    <input
                        type="number"
                        value={editedPlayer.skill}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                        min="1"
                        max="10"
                        className="block w-16 rounded-md border border-gray-300 px-2 py-1 text-sm text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center">
                    <select
                        value={editedPlayer.is_defense ? "defense" : "forward"}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "defense" }))}
                        className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="forward">Forward</option>
                        <option value="defense">Defense</option>
                    </select>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="flex justify-center">
                    <select
                        value={editedPlayer.is_attending ? "yes" : "no"}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_attending: e.target.value === "yes" }))}
                        className="block w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </div>
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
    );
};

export default EditableRow;