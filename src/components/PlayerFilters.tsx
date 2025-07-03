'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

interface PlayerFiltersProps {
    positionFilter: string;
    skillFilter: string;
    sortConfig: { field: SortField; direction: SortDirection };
    onPositionFilterChange: (filter: string) => void;
    onSkillFilterChange: (filter: string) => void;
    onSort: (field: SortField) => void;
}

export default function PlayerFilters({
    positionFilter,
    skillFilter,
    sortConfig,
    onPositionFilterChange,
    onSkillFilterChange,
    onSort
}: PlayerFiltersProps) {
    return (
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0 space-y-6 animate-slide-in-from-left">
            {/* Filters */}
            <div className="flex items-center gap-2">
                <select 
                    data-testid="position-filter"
                    value={positionFilter} 
                    onChange={(e) => onPositionFilterChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                >
                    <option value="all">All Positions</option>
                    <option value="forward">Forwards</option>
                    <option value="defense">Defense</option>
                </select>
                <select 
                    value={skillFilter} 
                    onChange={(e) => onSkillFilterChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md"
                >
                    <option value="all">All Skills</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                    ))}
                </select>
            </div>

            {/* Sorting */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Sort by</h4>
                <div className="flex items-center gap-2">
                    {['name', 'skill', 'position'].map((field) => (
                        <Button
                            key={field}
                            variant={sortConfig.field === field ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => onSort(field as SortField)}
                            className="flex-1"
                        >
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            {sortConfig.field === field && (
                                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                            )}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
} 