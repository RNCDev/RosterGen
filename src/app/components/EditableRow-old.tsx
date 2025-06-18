import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Check, X, Trash2, Edit2 } from 'lucide-react';
import Dialog from './Dialog';
import { createPortal } from 'react-dom';

interface EditableRowProps {
    player: Player;
    onSave?: (updatedPlayer: Player) => Promise<void>;
    onDelete?: (id: number) => Promise<void>;
    isBulkEditing?: boolean;
    onFieldChange?: (updatedPlayer: Player) => void;
}

const EditableRow = ({ player, onSave, onDelete, isBulkEditing = false, onFieldChange }: EditableRowProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // If we are in bulk editing mode, the player data is controlled by the parent.
    const data = isBulkEditing ? player : editedPlayer;

    const handleFieldChange = (field: keyof Player, value: any) => {
        const updatedPlayer = { ...data, [field]: value };
        if (isBulkEditing && onFieldChange) {
            onFieldChange(updatedPlayer);
        } else {
            setEditedPlayer(updatedPlayer);
        }
    };

    const handleEdit = () => {
        setEditedPlayer(player); // Reset to original on edit start
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!onSave) return;
        try {
            await onSave(editedPlayer);
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

    const effectiveIsEditing = isEditing || isBulkEditing;

    return (
        <>
            {effectiveIsEditing ? (
                <tr className={isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}>
                    <td className={`px-6 py-4 whitespace-nowrap sticky left-0 ${isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}`}>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={data.first_name}
                                onChange={(e) => handleFieldChange('first_name', e.target.value)}
                                className="input-neo w-32"
                            />
                            <input
                                type="text"
                                value={data.last_name}
                                onChange={(e) => handleFieldChange('last_name', e.target.value)}
                                className="input-neo w-32"
                            />
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                            type="number"
                            min="1"
                            max="10"
                            value={data.skill}
                            onChange={(e) => handleFieldChange('skill', parseInt(e.target.value))}
                            className="input-neo w-20 text-center"
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <select
                            value={data.is_defense ? "defense" : "forward"}
                            onChange={(e) => handleFieldChange('is_defense', e.target.value === "defense")}
                            className="input-neo w-28"
                        >
                            <option value="forward">Forward</option>
                            <option value="defense">Defense</option>
                        </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        <select
                            value={data.is_attending ? "yes" : "no"}
                            onChange={(e) => handleFieldChange('is_attending', e.target.value === "yes")}
                            className="input-neo w-24"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-center sticky right-0 ${isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}`}>
                        {!isBulkEditing && (
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
                        )}
                    </td>
                </tr>
            ) : (
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
            )}
            
            {createPortal(
                <Dialog isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Player</h2>
                        <p className="text-slate-600 mb-6">
                            {`Are you sure you want to delete ${player.first_name} ${player.last_name}?`}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="button-neo text-slate-600">
                                Cancel
                            </button>
                            <button onClick={handleConfirmDelete} className="button-neo bg-red-500 text-white">
                                Delete
                            </button>
                        </div>
                    </div>
                </Dialog>,
                document.body
            )}
        </>
    );
};

export default EditableRow;