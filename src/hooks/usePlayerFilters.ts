import { useState, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';

type SortField = 'name' | 'skill' | 'position';
type SortDirection = 'asc' | 'desc';

export interface PlayerFiltersState {
    positionFilter: string;
    skillFilter: string;
    sortConfig: { field: SortField; direction: SortDirection };
    setPositionFilter: (filter: string) => void;
    setSkillFilter: (filter: string) => void;
    handleSort: (field: SortField) => void;
    filteredPlayers: Player[];
}

export function usePlayerFilters(players: Player[]): PlayerFiltersState {
    const [positionFilter, setPositionFilter] = useState('all');
    const [skillFilter, setSkillFilter] = useState('all');
    const [sortConfig, setSortConfig] = useState<{ field: SortField; direction: SortDirection }>({ 
        field: 'name', 
        direction: 'asc' 
    });

    const handleSort = (field: SortField) => {
        setSortConfig(current => ({
            field,
            direction: current.field === field && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const filteredPlayers = useMemo(() => {
        let filtered = [...players];

        // Apply position filter
        if (positionFilter !== 'all') {
            filtered = filtered.filter(p => (p.is_defense ? 'defense' : 'forward') === positionFilter);
        }

        // Apply skill filter
        if (skillFilter !== 'all') {
            filtered = filtered.filter(p => p.skill === parseInt(skillFilter));
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let valA: string | number, valB: string | number;

            switch (sortConfig.field) {
                case 'name':
                    valA = `${a.first_name} ${a.last_name}`;
                    valB = `${b.first_name} ${b.last_name}`;
                    break;
                case 'skill':
                    valA = a.skill;
                    valB = b.skill;
                    break;
                case 'position':
                    valA = a.is_defense ? 1 : 0;
                    valB = b.is_defense ? 1 : 0;
                    break;
            }
            
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [players, positionFilter, skillFilter, sortConfig]);

    return {
        positionFilter,
        skillFilter,
        sortConfig,
        setPositionFilter,
        setSkillFilter,
        handleSort,
        filteredPlayers
    };
} 