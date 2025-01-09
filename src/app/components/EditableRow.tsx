import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Check, X, Trash2, Edit2 } from 'lucide-react';
import Dialog from './Dialog';
import { createPortal } from 'react-dom';

interface EditableRowProps {
    player: Player;
    onSave: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
}

const EditableRow = ({ player, onSave, onDelete }: EditableRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const playerToSave = {
                ...editedPlayer,
                id: player.id,
                group_code: player.group_code
            };
            await onSave(playerToSave);
            setIsEditing(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save changes');
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (onDelete) {
            try {
                await onDelete(player.id);
                setShowDeleteConfirm(false);
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

    return (
        <>
            {isEditing ? (
                <tr className="bg-blue-50/50">
                    <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-blue-50/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={editedPlayer.first_name}
                                onChange={(e) => setEditedPlayer(prev => ({ ...prev, first_name: e.target.value }))}
                                className="input-neo w-32"
                            />
                            <input
                                type="text"
                                value={editedPlayer.last_name}
                                onChange={(e) => setEditedPlayer(prev => ({ ...prev, last_name: e.target.value }))}
                                className="input-neo w-32"
                            />
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={editedPlayer.skill}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, skill: parseInt(e.target.value) }))}
                            className="input-neo w-20 text-center"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <select
                            value={editedPlayer.is_defense ? "defense" : "forward"}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_defense: e.target.value === "defense" }))}
                            className="input-neo w-28"
                        >
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <select
                            value={editedPlayer.is_attending ? "yes" : "no"}
                            onChange={(e) => setEditedPlayer(prev => ({ ...prev, is_attending: e.target.value === "yes" }))}
                            className="input-neo w-24"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-blue-50/50">
                        <div className="flex items-center justify-center gap-2">
                            <button
                                onClick={handleSave}
                                className="button-neo p-2 text-emerald-600"
                                title="Save"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleCancel}
                                className="button-neo p-2 text-red-600"
                                title="Cancel"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                </tr>
            ) : (
                <>
                    <tr className="hover:bg-slate-50/80">
                        <td className="px-6 py-4 whitespace-nowrap sticky left-0 bg-white">
                            <div className="flex items-center">
                                <div className="text-sm font-medium text-slate-900">
                                    {player.first_name} {player.last_name}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="badge-neo bg-blue-50 text-blue-700">
                                {player.skill}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`badge-neo ${player.is_defense ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                {player.is_defense ? 'Defense' : 'Forward'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`badge-neo ${player.is_attending ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {player.is_attending ? 'Yes' : 'No'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center sticky right-0 bg-white">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    onClick={handleEdit}
                                    className="button-neo p-2 text-blue-600"
                                    title="Edit"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                {onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="button-neo p-2 text-red-600"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </td>
                    </tr>
                    {showDeleteConfirm && createPortal(
                        <Dialog
                            isOpen={showDeleteConfirm}
                            onClose={() => setShowDeleteConfirm(false)}
                            onConfirm={handleConfirmDelete}
                            title="Delete Player"
                            description={`Are you sure you want to delete ${player.first_name} ${player.last_name}?`}
                            confirmLabel="Delete"
                            cancelLabel="Cancel"
                        />,
                        document.body
                    )}
                </>
            )}
        </>
    );
};

export default EditableRow;