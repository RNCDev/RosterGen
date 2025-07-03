import { useState, useMemo } from 'react';

export interface PaginationState<T> {
    currentPage: number;
    rowsPerPage: number;
    totalPages: number;
    paginatedItems: T[];
    setCurrentPage: (page: number) => void;
    setRowsPerPage: (rows: number) => void;
    handlePageChange: (page: number) => void;
}

export function usePlayerPagination<T>(items: T[], initialRowsPerPage: number = 20): PaginationState<T> {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

    const totalPages = Math.ceil(items.length / rowsPerPage);

    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        return items.slice(start, end);
    }, [items, currentPage, rowsPerPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset to page 1 when items change significantly
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return {
        currentPage,
        rowsPerPage,
        totalPages,
        paginatedItems,
        setCurrentPage,
        setRowsPerPage,
        handlePageChange
    };
} 