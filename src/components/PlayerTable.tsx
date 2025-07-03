'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { type Player } from '@/types/PlayerTypes';

interface PlayerTableProps {
    players: Player[];
    onUpdate: (player: Player) => void;
    isEditing: boolean;
    onDeletePlayer: (playerId: number) => void;
}

export default function PlayerTable({ 
    players, 
    onUpdate, 
    isEditing, 
    onDeletePlayer 
}: PlayerTableProps) {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-3 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-3 py-0.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-3 py-0.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                            </th>
                            {isEditing && (
                                <th className="px-3 py-0.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                        {players.map((player) => (
                            <tr 
                                key={player.id} 
                                className="hover:bg-gray-100/50 transition-colors"
                            >
                                <td className="px-3 py-1 whitespace-nowrap">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={player.first_name}
                                                onChange={(e) => onUpdate({ ...player, first_name: e.target.value })}
                                                className="w-32 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                            <input
                                                type="text"
                                                value={player.last_name}
                                                onChange={(e) => onUpdate({ ...player, last_name: e.target.value })}
                                                className="w-32 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-900">
                                                {player.first_name} {player.last_name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-3 py-1">
                                    {isEditing ? (
                                        <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                                            <button
                                                onClick={() => onUpdate({ ...player, is_defense: false })}
                                                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${!player.is_defense ? 'bg-green-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                F
                                            </button>
                                            <div className="w-px bg-gray-200 h-full"></div>
                                            <button
                                                onClick={() => onUpdate({ ...player, is_defense: true })}
                                                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs transition-colors ${player.is_defense ? 'bg-purple-500 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                D
                                            </button>
                                        </div>
                                    ) : (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {player.is_defense ? 'Defense' : 'Forward'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-3 py-1">
                                    {isEditing ? (
                                        <div className="flex items-center justify-center">
                                            <input
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={player.skill}
                                                onChange={(e) => onUpdate({ ...player, skill: parseInt(e.target.value) || 1 })}
                                                className="w-16 text-sm border border-gray-200 rounded px-2 py-1 bg-white/80 focus:outline-none focus:ring-1 focus:ring-blue-400 text-center"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex justify-center items-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                                {player.skill}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                {isEditing && (
                                    <td className="px-3 py-1">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={() => onDeletePlayer(player.id)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                                title="Delete Player"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 