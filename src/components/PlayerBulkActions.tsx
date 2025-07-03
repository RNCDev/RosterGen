'use client';

import React from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';

interface PlayerBulkActionsProps {
    selectedPlayers: Player[];
    onBulkUpdate: (updates: Partial<Player>) => void;
    onClearSelection: () => void;
}

export default function PlayerBulkActions({ 
    selectedPlayers, 
    onBulkUpdate, 
    onClearSelection 
}: PlayerBulkActionsProps) {
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-blue-900">
                        {selectedPlayers.length} players selected
                    </span>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: false })}
                            className="btn-secondary"
                        >
                            Set All Forward
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: true })}
                            className="btn-secondary"
                        >
                            Set All Defense
                        </Button>
                        <select
                            onChange={(e) => onBulkUpdate({ skill: parseInt(e.target.value) })}
                            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white/80"
                        >
                            <option value="">Set Skill Level</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(skill => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <Button size="sm" onClick={onClearSelection} className="btn-ghost">
                    Clear Selection
                </Button>
            </div>
        </div>
    );
} 