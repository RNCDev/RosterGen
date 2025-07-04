'use client';

import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

interface PlayerFiltersProps {
    positionFilter: string;
    skillFilter: string;
    searchQuery: string;
    sortConfig: { field: SortField; direction: SortDirection };
    onPositionFilterChange: (filter: string) => void;
    onSkillFilterChange: (filter: string) => void;
    onSearchQueryChange: (query: string) => void;
    onSort: (field: SortField) => void;
}

export default function PlayerFilters({
    positionFilter,
    skillFilter,
    searchQuery,
    sortConfig,
    onPositionFilterChange,
    onSkillFilterChange,
    onSearchQueryChange,
    onSort
}: PlayerFiltersProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const hasActiveFilters = positionFilter !== 'all' || skillFilter !== 'all';

    return (
        <div className="relative flex-1 max-w-md">
            {/* Search Input with Integrated Filter */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                        hasActiveFilters ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                    title="Filters"
                >
                    <Filter className="h-4 w-4" />
                    {hasActiveFilters && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                </button>
            </div>

            {/* Filter Dropdown */}
            {isFilterOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select 
                                data-testid="position-filter"
                                value={positionFilter} 
                                onChange={(e) => onPositionFilterChange(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-md p-2"
                            >
                                <option value="all">All Positions</option>
                                <option value="forward">Forwards</option>
                                <option value="defense">Defense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                            <select 
                                value={skillFilter} 
                                onChange={(e) => onSkillFilterChange(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-md p-2"
                            >
                                <option value="all">All Skills</option>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map(skill => (
                                    <option key={skill} value={skill}>{skill}</option>
                                ))}
                            </select>
                        </div>
                        <div className="pt-2 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    onPositionFilterChange('all');
                                    onSkillFilterChange('all');
                                }}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isFilterOpen && (
                <div 
                    className="fixed inset-0 z-0" 
                    onClick={() => setIsFilterOpen(false)}
                />
            )}
        </div>
    );
} 