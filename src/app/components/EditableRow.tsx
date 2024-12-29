import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Check, X } from 'lucide-react';

interface EditableRowProps {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => void;
}

const EditableRow = ({ player, onSave, onDelete }: EditableRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState(player);
    const [error, setError] = useState<string | null>(null);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            await onSave(editedPlayer);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError('Failed to save changes');
        }
    };

    const handleCancel = () => {
        setEditedPlayer(player);
        setIsEditing(false);
        setError(null);
    };

    if (!isEditing) {
        return (
            <tr onClick={handleEdit} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {player.first_name} {player.last_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {player.skill}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                        {player.is_defense ? 'Defense' : 'Forward'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_attending ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {player.is_attending ? 'Yes' : 'No'}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="text-blue-600 text-xs">Click to edit</span>
                </td>
            </tr>
        );
    }

    return (
        <tr className="bg-blue-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={editedPlayer.first_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                        className="block w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                        placeholder="First Name"
                    />
                    <input
                        type="text"
                        value={editedPlayer.last_name}
                        onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                        className="block w-24 rounded-md border-gray-300 shadow-sm text-sm"
                        placeholder="Last Name"
                    />
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="number"
                    min="1"
                    max="10"
                    value={editedPlayer.skill}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) || prev.skill }))}
                    className="block w-16 rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={editedPlayer.is_defense ? "defense" : "forward"}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "defense" }))}
                    className="block w-24 rounded-md border-gray-300 shadow-sm text-sm"
                >
                    <option value="forward">Forward</option>
                    <option value="defense">Defense</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    value={editedPlayer.is_attending ? "yes" : "no"}
                    onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_attending: e.target.value === "yes" }))}
                    className="block w-20 rounded-md border-gray-300 shadow-sm text-sm"
                >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-700 p-1 rounded hover:bg-green-100"
                    >
                        <Check className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleCancel}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {error && <span className="text-red-500 text-xs">{error}</span>}
                </div>
            </td>
        </tr>
    );
};

export default EditableRow;