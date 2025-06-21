'use client';

import React, { useState } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import { Check, X, Trash2, Edit2, User, Shield } from 'lucide-react';

interface EditableRowProps {
    player: Player;
    onUpdate: (updatedPlayer: Player) => void;
    onDelete: (id: number) => void;
    isBulkEditing: boolean;
    className?: string;
}

export default function EditableRow({ player, onUpdate, onDelete, isBulkEditing, className = '' }: EditableRowProps) {
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
            <tr className={`${isBulkEditing ? 'bg-blue-50/30' : 'bg-amber-50/30'} ${className}`}>
                <td className="px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3 min-h-[32px]">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                            data.is_defense ? 'bg-purple-100' : 'bg-green-100'
                        }`}>
                            {data.is_defense ? (
                                <Shield className="w-3 h-3 text-purple-600" />
                            ) : (
                                <User className="w-3 h-3 text-green-600" />
                            )}
                        </div>
                        <div className="flex gap-1 flex-1">
                            <input 
                                type="text" 
                                value={data.first_name} 
                                onChange={(e) => handleFieldChange('first_name', e.target.value)} 
                                className="bg-white/80 border border-gray-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400 h-6" 
                                placeholder="First"
                            />
                            <input 
                                type="text" 
                                value={data.last_name} 
                                onChange={(e) => handleFieldChange('last_name', e.target.value)} 
                                className="bg-white/80 border border-gray-200 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-1 focus:ring-blue-400 h-6" 
                                placeholder="Last"
                            />
                        </div>
                    </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1 min-h-[32px]">
                        <button
                            type="button"
                            onClick={() => handleFieldChange('skill', Math.max(1, data.skill - 1))}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600"
                        >
                            −
                        </button>
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {data.skill}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleFieldChange('skill', Math.min(10, data.skill + 1))}
                            className="w-6 h-6 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600"
                        >
                            +
                        </button>
                    </div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center min-h-[32px]">
                        <button
                            type="button"
                            onClick={() => handleFieldChange('is_defense', !data.is_defense)}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold transition-colors min-h-[32px] ${
                                data.is_defense 
                                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            {data.is_defense ? 'Defense' : 'Forward'}
                        </button>
                    </div>
                </td>

                <td className="px-4 py-2 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center min-h-[32px]">
                        {!isBulkEditing && (
                            <div className="flex items-center justify-center gap-1">
                                <button 
                                    onClick={handleSave} 
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                    title="Save"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={handleCancel} 
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                    title="Cancel"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </td>
            </tr>
        );
    }

    return (
        <tr className={`hover:bg-white/50 transition-colors duration-150 ${className}`}>
            <td className="px-4 py-2 whitespace-nowrap">
                <div className="flex items-center gap-3 min-h-[32px]">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        player.is_defense ? 'bg-purple-100' : 'bg-green-100'
                    }`}>
                        {player.is_defense ? (
                            <Shield className="w-3 h-3 text-purple-600" />
                        ) : (
                            <User className="w-3 h-3 text-green-600" />
                        )}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                        {player.first_name} {player.last_name}
                    </div>
                </div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex items-center justify-center min-h-[32px]">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {player.skill}
                    </span>
                </div>
            </td>
            <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex items-center justify-center min-h-[32px]">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        player.is_defense 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-green-100 text-green-700'
                    }`}>
                        {player.is_defense ? 'Defense' : 'Forward'}
                    </span>
                </div>
            </td>

            <td className="px-4 py-2 whitespace-nowrap text-center">
                <div className="flex items-center justify-center gap-1 min-h-[32px]">
                    <button 
                        onClick={() => setIsEditing(true)} 
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                        title="Edit Player"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={handleDelete} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete Player"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
} 