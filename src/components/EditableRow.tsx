'use client';

import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import { Check, X, Trash2, Edit2 } from 'lucide-react';

interface EditableRowProps {
    player: Player;
    onUpdate: (updatedPlayer: Player) => void;
    onDelete: (id: number) => void;
    isBulkEditing: boolean;
}

export default function EditableRow({ player, onUpdate, onDelete, isBulkEditing }: EditableRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPlayer, setEditedPlayer] = useState<Player>(player);

    const handleFieldChange = (field: keyof Player, value: any) => {
        if (isBulkEditing) {
            // In bulk mode, we call the parent's update handler directly
            onUpdate({ ...player, [field]: value });
        } else {
            // In single-edit mode, we update local state
            setEditedPlayer(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSave = () => {
        onUpdate(editedPlayer);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedPlayer(player); // Revert changes
        setIsEditing(false);
    };
    
    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
            onDelete(player.id);
        }
    };

    const data = isBulkEditing ? player : editedPlayer;
    const effectiveIsEditing = isEditing || isBulkEditing;

    if (effectiveIsEditing) {
        return (
            <tr className={isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}>
                <td className={`px-4 py-2 whitespace-nowrap sticky left-0 ${isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}`}>
                    <div className="flex gap-2">
                        <input type="text" value={data.first_name} onChange={(e) => handleFieldChange('first_name', e.target.value)} className="input-neo w-32 text-sm" />
                        <input type="text" value={data.last_name} onChange={(e) => handleFieldChange('last_name', e.target.value)} className="input-neo w-32 text-sm" />
                    </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <input type="number" min="1" max="10" value={data.skill} onChange={(e) => handleFieldChange('skill', parseInt(e.target.value))} className="input-neo w-20 text-center text-sm" />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <select value={data.is_defense ? "defense" : "forward"} onChange={(e) => handleFieldChange('is_defense', e.target.value === "defense")} className="input-neo w-28 text-sm">
                        <option value="forward">Forward</option>
                        <option value="defense">Defense</option>
                    </select>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <select value={data.is_attending ? "yes" : "no"} onChange={(e) => handleFieldChange('is_attending', e.target.value === "yes")} className="input-neo w-24 text-sm">
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </td>
                <td className={`px-4 py-2 whitespace-nowrap text-center sticky right-0 ${isBulkEditing ? 'bg-slate-50' : 'bg-blue-50/50'}`}>
                    {!isBulkEditing && (
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={handleSave} className="button-neo p-2 text-emerald-600" title="Save"><Check className="h-4 w-4" /></button>
                            <button onClick={handleCancel} className="button-neo p-2 text-red-600" title="Cancel"><X className="h-4 w-4" /></button>
                        </div>
                    )}
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-50/80">
            <td className="px-4 py-2 whitespace-nowrap sticky left-0 bg-white">
                <div className="text-sm font-medium text-slate-800">{player.first_name} {player.last_name}</div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center">
                <span className="badge-neo bg-blue-50 text-blue-700 text-sm">{player.skill}</span>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center">
                <span className={`badge-neo text-sm ${player.is_defense ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {player.is_defense ? 'Defense' : 'Forward'}
                </span>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center">
                <span className={`badge-neo text-sm ${player.is_attending ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {player.is_attending ? 'Yes' : 'No'}
                </span>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center sticky right-0 bg-white">
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setIsEditing(true)} className="button-neo p-2 text-blue-600" title="Edit"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={handleDelete} className="button-neo p-2 text-red-600" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
            </td>
        </tr>
    );
} 