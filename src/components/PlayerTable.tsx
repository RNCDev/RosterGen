'use client';

import React from 'react';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { type Player } from '@/types/PlayerTypes';
import { Star } from 'lucide-react';

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

interface PlayerTableProps {
    players: Player[];
    onUpdate: (player: Player) => void;
    isEditing: boolean;
    onDeletePlayer: (playerId: number) => void;
    selectedPlayerIds?: Set<number>;
    onTogglePlayerSelection?: (playerId: number) => void;
    onToggleAllPlayers?: () => void;
    sortConfig?: { field: SortField; direction: SortDirection };
    onSort?: (field: SortField) => void;
}

export default function PlayerTable({ 
    players, 
    onUpdate, 
    isEditing, 
    onDeletePlayer,
    selectedPlayerIds = new Set(),
    onTogglePlayerSelection,
    onToggleAllPlayers,
    sortConfig,
    onSort
}: PlayerTableProps) {

    const totalStars = 7;
    const allSelected = players.length > 0 && players.every(p => selectedPlayerIds.has(p.id));
    const someSelected = players.some(p => selectedPlayerIds.has(p.id));

    const handleStarClick = (player: Player, index: number) => {
        if (isEditing) {
            onUpdate({ ...player, skill: index + 1 });
        }
    };

    const handleSort = (field: SortField) => {
        if (onSort) {
            onSort(field);
        }
    };

    const SortableHeader = ({ field, children, className = "" }: { 
        field: SortField; 
        children: React.ReactNode; 
        className?: string; 
    }) => {
        const isActive = sortConfig?.field === field;
        const direction = sortConfig?.direction;

        return (
            <th 
                className={`px-6 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors ${className}`}
                onClick={() => handleSort(field)}
            >
                <div className="flex items-center gap-2">
                    {children}
                    <div className="flex flex-col">
                        <ChevronUp 
                            className={`w-4 h-4 transition-colors ${
                                isActive && direction === 'asc' 
                                    ? 'text-blue-600' 
                                    : 'text-gray-400 hover:text-gray-500'
                            }`} 
                        />
                        <ChevronDown 
                            className={`w-4 h-4 -mt-1 transition-colors ${
                                isActive && direction === 'desc' 
                                    ? 'text-blue-600' 
                                    : 'text-gray-400 hover:text-gray-500'
                            }`} 
                        />
                    </div>
                </div>
            </th>
        );
    };

    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                        <tr>
                            {isEditing && onTogglePlayerSelection && (
                                <th className="px-6 py-2 text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={allSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = someSelected && !allSelected;
                                        }}
                                        onChange={onToggleAllPlayers}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                            )}
                            <SortableHeader field="name" className="text-left">
                                Player
                            </SortableHeader>
                            <SortableHeader field="position" className="text-center">
                                Position
                            </SortableHeader>
                            <SortableHeader field="skill" className="text-center">
                                Skill
                            </SortableHeader>
                            {isEditing && (
                                <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/50">
                        {players.map((player) => (
                            <tr 
                                key={player.id} 
                                className={`hover:bg-gray-100/50 transition-colors ${
                                    selectedPlayerIds.has(player.id) ? 'bg-blue-50/50' : ''
                                }`}
                            >
                                {isEditing && onTogglePlayerSelection && (
                                    <td className="px-6 py-2 text-center w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedPlayerIds.has(player.id)}
                                            onChange={() => onTogglePlayerSelection(player.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                )}
                                <td className="px-6 py-2 whitespace-nowrap">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 h-9">
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
                                        <div className="flex items-center h-9">
                                            <span className="font-medium text-gray-900">
                                                {player.first_name} {player.last_name}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-2 text-left">
                                    {isEditing ? (
                                        <div className="flex items-center h-9">
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
                                        <div className="flex items-center h-9">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {player.is_defense ? 'Defense' : 'Forward'}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-2 text-left">
                                    <div className="flex items-center gap-0.5 h-9">
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
                                    <td className="px-6 py-2 text-center w-20">
                                        <div className="flex items-center justify-center h-9">
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