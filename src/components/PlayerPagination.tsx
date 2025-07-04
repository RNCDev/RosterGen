'use client';

import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PlayerPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    itemName?: string;
}

export default function PlayerPagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    itemName = 'items'
}: PlayerPaginationProps) {
    const startItem = totalItems > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-base text-gray-500">
                Showing {startItem} - {endItem} of {totalItems} {itemName}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center gap-3">
                    <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => onPageChange(1)} 
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="w-5 h-5" />
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => onPageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="text-lg font-bold px-6">
                        {currentPage} / {totalPages}
                    </span>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => onPageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button 
                        size="lg" 
                        variant="outline" 
                        onClick={() => onPageChange(totalPages)} 
                        disabled={currentPage === totalPages}
                    >
                        <ChevronsRight className="w-5 h-5" />
                    </Button>
                </div>
            )}
        </div>
    );
} 