import { renderHook, act } from '@testing-library/react';
import { usePlayerPagination } from '@/hooks/usePlayerPagination';

const mockPlayers = Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    first_name: `Player${i + 1}`,
    last_name: 'Test',
    skill: Math.floor(Math.random() * 10) + 1,
    is_defense: i % 2 === 0,
    is_goalie: false,
    group_id: '1'
}));

describe('usePlayerPagination', () => {
    it('initializes with correct default values', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 10));
        
        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(3);
        expect(result.current.paginatedItems).toHaveLength(10);
        expect(result.current.totalItems).toBe(25);
    });

    it('paginates items correctly', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 5));
        
        expect(result.current.paginatedItems).toHaveLength(5);
        expect(result.current.totalPages).toBe(5);
        expect(result.current.paginatedItems[0].first_name).toBe('Player1');
        expect(result.current.paginatedItems[4].first_name).toBe('Player5');
    });

    it('changes page when handlePageChange is called', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 10));
        
        act(() => {
            result.current.handlePageChange(2);
        });
        
        expect(result.current.currentPage).toBe(2);
        expect(result.current.paginatedItems[0].first_name).toBe('Player11');
        expect(result.current.paginatedItems[9].first_name).toBe('Player20');
    });

    it('handles page changes correctly', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 10));
        
        // Go to page 2
        act(() => {
            result.current.handlePageChange(2);
        });
        
        expect(result.current.currentPage).toBe(2);
        expect(result.current.paginatedItems).toHaveLength(10);
        
        // Go to page 3
        act(() => {
            result.current.handlePageChange(3);
        });
        
        expect(result.current.currentPage).toBe(3);
        expect(result.current.paginatedItems).toHaveLength(5); // Last page has fewer items
    });

    it('handles empty players array', () => {
        const { result } = renderHook(() => usePlayerPagination([], 10));
        
        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(0);
        expect(result.current.paginatedItems).toHaveLength(0);
        expect(result.current.totalItems).toBe(0);
    });

    it('handles players count less than items per page', () => {
        const smallPlayerList = mockPlayers.slice(0, 3);
        const { result } = renderHook(() => usePlayerPagination(smallPlayerList, 10));
        
        expect(result.current.currentPage).toBe(1);
        expect(result.current.totalPages).toBe(1);
        expect(result.current.paginatedItems).toHaveLength(3);
        expect(result.current.totalItems).toBe(3);
    });

    it('calculates correct page ranges', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 10));
        
        // Page 1: items 1-10
        expect(result.current.paginatedItems).toHaveLength(10);
        
        // Page 2: items 11-20
        act(() => {
            result.current.handlePageChange(2);
        });
        expect(result.current.paginatedItems).toHaveLength(10);
        
        // Page 3: items 21-25
        act(() => {
            result.current.handlePageChange(3);
        });
        expect(result.current.paginatedItems).toHaveLength(5);
    });

    it('handles different items per page', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 15));
        
        expect(result.current.paginatedItems).toHaveLength(15);
        expect(result.current.totalPages).toBe(2);
        
        act(() => {
            result.current.handlePageChange(2);
        });
        
        expect(result.current.paginatedItems).toHaveLength(10); // Remaining items
    });

    it('maintains player order across pages', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 5));
        
        // Check first page
        expect(result.current.paginatedItems[0].id).toBe(1);
        expect(result.current.paginatedItems[4].id).toBe(5);
        
        // Check second page
        act(() => {
            result.current.handlePageChange(2);
        });
        
        expect(result.current.paginatedItems[0].id).toBe(6);
        expect(result.current.paginatedItems[4].id).toBe(10);
    });

    it('handles invalid page numbers gracefully', () => {
        const { result } = renderHook(() => usePlayerPagination(mockPlayers, 10));
        
        // Try to go to page 0
        act(() => {
            result.current.handlePageChange(0);
        });
        
        expect(result.current.currentPage).toBe(1); // Should stay on page 1
        
        // Try to go to page beyond total pages
        act(() => {
            result.current.handlePageChange(10);
        });
        
        expect(result.current.currentPage).toBe(1); // Should stay on page 1
    });

    it('updates pagination when players array changes', () => {
        const { result, rerender } = renderHook(
            ({ players }) => usePlayerPagination(players, 10),
            { initialProps: { players: mockPlayers.slice(0, 15) } }
        );
        
        expect(result.current.totalPages).toBe(2);
        expect(result.current.totalItems).toBe(15);
        
        // Update with more players
        rerender({ players: mockPlayers });
        
        expect(result.current.totalPages).toBe(3);
        expect(result.current.totalItems).toBe(25);
    });
}); 