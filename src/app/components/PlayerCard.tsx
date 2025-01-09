import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Edit2, Trash2, Check, X } from 'lucide-react';

interface PlayerCardProps {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
}

export default function PlayerCard({ player, onSave, onDelete }: PlayerCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);

    const handleSave = async () => {
        try {
            await onSave(editedPlayer);
            setIsEditing(false);  // Reset editing state after successful save
        } catch (error) {
            console.error('Failed to save:', error);
            // Optionally show an error message to the user
        }
    };

    const handleCancel = () => {
        setEditedPlayer(player);  // Reset the edited data
        setIsEditing(false);     // Exit edit mode
    };

    if (isEditing) {
        return (
            <div className="card-neo p-4">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                        <input
                            type="text"
                            value={editedPlayer.first_name}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                            className="input-neo w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                        <input
                            type="text"
                            value={editedPlayer.last_name}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                            className="input-neo w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Skill Level (1-10)</label>
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={editedPlayer.skill}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                            className="input-neo w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
                        <select
                            value={editedPlayer.is_defense ? "defense" : "forward"}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "defense" }))}
                            className="input-neo w-full"
                        >
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attending</label>
                        <select
                            value={editedPlayer.is_attending ? "yes" : "no"}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_attending: e.target.value === "yes" }))}
                            className="input-neo w-full"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            onClick={handleCancel}
                            className="button-neo px-4 py-2 text-slate-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="button-neo px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 
                                     text-white hover:from-blue-600 hover:to-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card-neo p-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h3 className="font-medium text-slate-900">
                        {player.first_name} {player.last_name}
                    </h3>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Skill:</span>
                            <span className="badge-neo bg-blue-50 text-blue-700">
                                {player.skill}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Position:</span>
                            <span className={`badge-neo ${
                                player.is_defense 
                                    ? 'bg-purple-50 text-purple-700' 
                                    : 'bg-emerald-50 text-emerald-700'
                            }`}>
                                {player.is_defense ? 'Defense' : 'Forward'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">Attending:</span>
                            <span className={`badge-neo ${
                                player.is_attending 
                                    ? 'bg-green-50 text-green-700' 
                                    : 'bg-red-50 text-red-700'
                            }`}>
                                {player.is_attending ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="button-neo p-2 text-blue-600"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(player.id)}
                            className="button-neo p-2 text-red-600"
                            title="Delete"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
} 