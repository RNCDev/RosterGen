'use client';

import React from 'react';
import { type PlayerWithAttendance } from '@/types/PlayerTypes';

interface AttendanceTableProps {
    players: PlayerWithAttendance[];
    onAttendanceToggle: (playerId: number) => void;
    isBulkEditMode: boolean;
    stagedChanges: Map<number, boolean>;
    onStagedChange: (playerId: number, isAttending: boolean) => void;
}

export default function AttendanceTable({
    players,
    onAttendanceToggle,
    isBulkEditMode,
    stagedChanges,
    onStagedChange,
}: AttendanceTableProps) {
    return (
        <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/50">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Player
                            </th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Position
                            </th>
                            <th scope="col" className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200/50">
                        {players.map((player) => {
                            const isAttending = isBulkEditMode 
                                ? (stagedChanges.get(player.id) ?? false) 
                                : (player.is_attending_event ?? false);
                            
                            return (
                                <tr key={player.id} className="hover:bg-gray-100/50 transition-colors">
                                    <td className="px-4 py-1 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {player.first_name} {player.last_name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-1 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            player.is_defense ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {player.is_defense ? 'Defense' : 'Forward'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-1 whitespace-nowrap text-center">
                                        <input
                                            type="checkbox"
                                            checked={isAttending}
                                            onChange={(e) => {
                                                if (isBulkEditMode) {
                                                    onStagedChange(player.id, e.target.checked);
                                                } else {
                                                    onAttendanceToggle(player.id);
                                                }
                                            }}
                                            className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 cursor-pointer"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
} 