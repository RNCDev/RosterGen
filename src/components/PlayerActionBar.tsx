'use client';

import React from 'react';
import { type Player } from '@/types/PlayerTypes';
import { Button } from '@/components/ui/Button';
import PlayerFilters from '@/components/PlayerFilters';

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

interface PlayerActionBarProps {
    // Edit state
    isEditing: boolean;
    isDirty: boolean;
    onToggleEdit: () => void;
    
    // Filter state
    positionFilter: string;
    skillFilter: string;
    searchQuery: string;
    sortConfig: { field: SortField; direction: SortDirection };
    onPositionFilterChange: (filter: string) => void;
    onSkillFilterChange: (filter: string) => void;
    onSearchQueryChange: (query: string) => void;
    onSort: (field: SortField) => void;
    
    // Bulk actions
    selectedPlayers: Player[];
    onBulkUpdate: (updates: Partial<Player>) => void;
    onClearSelection: () => void;
}

export default function PlayerActionBar({
    isEditing,
    isDirty,
    onToggleEdit,
    positionFilter,
    skillFilter,
    searchQuery,
    sortConfig,
    onPositionFilterChange,
    onSkillFilterChange,
    onSearchQueryChange,
    onSort,
    selectedPlayers,
    onBulkUpdate,
    onClearSelection
}: PlayerActionBarProps) {
    const hasSelectedPlayers = selectedPlayers.length > 0;

    return (
        <div className="flex items-center gap-4 mb-4 animate-fade-in">
            {/* Left: Edit Roster Button */}
            <Button 
                onClick={onToggleEdit}
                variant={isEditing ? 'primary' : 'outline'}
                data-action={isEditing ? "Done Editing" : "Start Editing"}
                className="h-10 whitespace-nowrap"
            >
                {isEditing ? 'Done Editing' : 'Edit Roster'}
            </Button>

            {/* Center: Search and Filters */}
            <PlayerFilters
                positionFilter={positionFilter}
                skillFilter={skillFilter}
                searchQuery={searchQuery}
                sortConfig={sortConfig}
                onPositionFilterChange={onPositionFilterChange}
                onSkillFilterChange={onSkillFilterChange}
                onSearchQueryChange={onSearchQueryChange}
                onSort={onSort}
            />

            {/* Right: Bulk Actions (appears when players selected) */}
            {isEditing && hasSelectedPlayers && (
                <div className="flex items-center gap-3 ml-auto bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 animate-slide-in-from-right">
                    <span className="text-sm font-medium text-blue-900 whitespace-nowrap">
                        {selectedPlayers.length} selected
                    </span>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: false })}
                            className="btn-secondary whitespace-nowrap"
                        >
                            Set Forward
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onBulkUpdate({ is_defense: true })}
                            className="btn-secondary whitespace-nowrap"
                        >
                            Set Defense
                        </Button>
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    onBulkUpdate({ skill: parseInt(e.target.value) });
                                    e.target.value = '';
                                }
                            }}
                            className="text-sm border border-gray-200 rounded px-2 py-1 bg-white/80"
                            defaultValue=""
                        >
                            <option value="" disabled>Set Skill</option>
                            {[1,2,3,4,5,6,7,8,9,10].map(skill => (
                                <option key={skill} value={skill}>{skill}</option>
                            ))}
                        </select>
                    </div>
                    
                    <Button 
                        size="sm" 
                        onClick={onClearSelection} 
                        className="btn-ghost whitespace-nowrap ml-2"
                    >
                        Clear
                    </Button>
                </div>
            )}
        </div>
    );
} 