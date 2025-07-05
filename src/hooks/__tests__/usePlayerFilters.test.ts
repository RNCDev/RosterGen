import { renderHook, act } from '@testing-library/react';
import { usePlayerFilters } from '@/hooks/usePlayerFilters';
import { Player } from '@/types/PlayerTypes';

const mockPlayers: Player[] = [
    { id: 1, first_name: 'John', last_name: 'Doe', skill: 5, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', skill: 8, is_defense: true, is_goalie: false, group_id: '1' },
    { id: 3, first_name: 'Peter', last_name: 'Jones', skill: 3, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 4, first_name: 'Sarah', last_name: 'Wilson', skill: 7, is_defense: true, is_goalie: false, group_id: '1' },
];

describe('usePlayerFilters', () => {
    it('returns all players when no filters are applied', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        expect(result.current.filteredPlayers).toHaveLength(4);
        expect(result.current.filteredPlayers).toEqual(mockPlayers);
    });

    it('filters by search term', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSearchTerm('john');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(1);
        expect(result.current.filteredPlayers[0].first_name).toBe('John');
    });

    it('filters by position (forward)', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setPositionFilter('forward');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(2);
        expect(result.current.filteredPlayers.every(p => !p.is_defense)).toBe(true);
    });

    it('filters by position (defense)', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setPositionFilter('defense');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(2);
        expect(result.current.filteredPlayers.every(p => p.is_defense)).toBe(true);
    });

    it('filters by skill range', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSkillRange([5, 8]);
        });
        
        expect(result.current.filteredPlayers).toHaveLength(3);
        expect(result.current.filteredPlayers.every(p => p.skill >= 5 && p.skill <= 8)).toBe(true);
    });

    it('combines multiple filters', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSearchTerm('jane');
            result.current.setPositionFilter('defense');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(1);
        expect(result.current.filteredPlayers[0].first_name).toBe('Jane');
        expect(result.current.filteredPlayers[0].is_defense).toBe(true);
    });

    it('sorts players by name', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSortBy('name');
        });
        
        const playerNames = result.current.filteredPlayers.map(p => `${p.first_name} ${p.last_name}`);
        expect(playerNames).toEqual([
            'Jane Smith',
            'John Doe', 
            'Peter Jones',
            'Sarah Wilson'
        ]);
    });

    it('sorts players by skill (descending)', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSortBy('skill');
        });
        
        const skills = result.current.filteredPlayers.map(p => p.skill);
        expect(skills).toEqual([8, 7, 5, 3]);
    });

    it('sorts players by skill (ascending)', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSortBy('skill');
            result.current.setSortDirection('asc');
        });
        
        const skills = result.current.filteredPlayers.map(p => p.skill);
        expect(skills).toEqual([3, 5, 7, 8]);
    });

    it('resets filters when resetFilters is called', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        // Apply some filters
        act(() => {
            result.current.setSearchTerm('john');
            result.current.setPositionFilter('forward');
            result.current.setSkillRange([1, 5]);
        });
        
        expect(result.current.filteredPlayers).toHaveLength(1);
        
        // Reset filters
        act(() => {
            result.current.resetFilters();
        });
        
        expect(result.current.filteredPlayers).toHaveLength(4);
        expect(result.current.searchTerm).toBe('');
        expect(result.current.positionFilter).toBe('all');
        expect(result.current.skillRange).toEqual([1, 10]);
    });

    it('handles empty players array', () => {
        const { result } = renderHook(() => usePlayerFilters([]));
        
        expect(result.current.filteredPlayers).toHaveLength(0);
        expect(result.current.filteredPlayers).toEqual([]);
    });

    it('case-insensitive search', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSearchTerm('JANE');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(1);
        expect(result.current.filteredPlayers[0].first_name).toBe('Jane');
    });

    it('searches in both first and last names', () => {
        const { result } = renderHook(() => usePlayerFilters(mockPlayers));
        
        act(() => {
            result.current.setSearchTerm('smith');
        });
        
        expect(result.current.filteredPlayers).toHaveLength(1);
        expect(result.current.filteredPlayers[0].last_name).toBe('Smith');
    });
}); 