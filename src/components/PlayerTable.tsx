'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { type Player } from '@/types/PlayerTypes';
import { Star } from 'lucide-react';

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

    const totalStars = 7;

    const handleStarClick = (player: Player, index: number) => {
        if (isEditing) {
            onUpdate({ ...player, skill: index + 1 });
        }
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Skill
                            </th>
                            {isEditing && (
                                <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                <td className="px-6 py-2 whitespace-nowrap">
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
                                        <div className="flex items-center h-[34px]">
                                            <span className="font-medium text-gray-900">
                                                {player.first_name} {player.last_name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-2 text-center">
                                    {isEditing ? (
                                        <div className="flex items-center justify-center">
                                            <div className="inline-flex border border-gray-300 rounded-md overflow-hidden bg-white">
                                                <button
                                                    onClick={() => onUpdate({ ...player, is_defense: false })}
                                                    className={`px-3 py-1 text-sm font-medium transition-colors ${!player.is_defense ? 'bg-green-500 text-white shadow-inner' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    Fwd
                                                </button>
                                                <div className="w-px bg-gray-300"></div>
                                                <button
                                                    onClick={() => onUpdate({ ...player, is_defense: true })}
                                                    className={`px-3 py-1 text-sm font-medium transition-colors ${player.is_defense ? 'bg-purple-500 text-white shadow-inner' : 'bg-transparent text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    Def
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {player.is_defense ? 'Defense' : 'Forward'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-2 text-center">
                                    <div className="flex items-center justify-center gap-0.5">
                                        {[...Array(totalStars)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 transition-colors
                                                    ${i < player.skill ? 'text-green-700 fill-green-700' : 'text-gray-300 fill-gray-200'}
                                                    ${isEditing ? 'cursor-pointer hover:text-green-800 hover:fill-green-800' : ''}
                                                `}
                                                onClick={() => handleStarClick(player, i)}
                                            />
                                        ))}
                                    </div>
                                </td>
                                {isEditing && (
                                    <td className="px-6 py-2 text-center">
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