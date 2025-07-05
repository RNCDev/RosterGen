import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerPagination from '@/components/PlayerPagination';

// Mock the next/font/google for Jest environment
jest.mock('next/font/google', () => ({
    Inter: () => ({
      style: {
        fontFamily: 'mocked',
      },
    }),
    Roboto_Mono: () => ({
        style: {
          fontFamily: 'mocked',
        },
      }),
}));

describe('PlayerPagination', () => {
    const mockOnPageChange = jest.fn();

    beforeEach(() => {
        mockOnPageChange.mockClear();
    });

    it('renders pagination controls', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        expect(screen.getByText('Showing 1 - 10 of 50 players')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('displays correct page information', () => {
        render(
            <PlayerPagination
                currentPage={3}
                totalPages={10}
                totalItems={100}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        expect(screen.getByText('Showing 21 - 30 of 100 players')).toBeInTheDocument();
    });

    it('calls onPageChange when next button is clicked', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        fireEvent.click(nextButton);

        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when previous button is clicked', () => {
        render(
            <PlayerPagination
                currentPage={3}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const prevButton = screen.getByRole('button', { name: /previous/i });
        fireEvent.click(prevButton);

        expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('calls onPageChange when page number is clicked', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const page3Button = screen.getByText('3');
        fireEvent.click(page3Button);

        expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('disables previous button on first page', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const prevButton = screen.getByRole('button', { name: /previous/i });
        expect(prevButton).toBeDisabled();
    });

    it('disables next button on last page', () => {
        render(
            <PlayerPagination
                currentPage={5}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const nextButton = screen.getByRole('button', { name: /next/i });
        expect(nextButton).toBeDisabled();
    });

    it('handles single page', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={1}
                totalItems={5}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        expect(screen.getByText('Showing 1 - 5 of 5 players')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /previous/i })).toBeDisabled();
        expect(screen.queryByRole('button', { name: /next/i })).toBeDisabled();
    });

    it('handles empty results', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={0}
                totalItems={0}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        expect(screen.getByText('Showing 0 - 0 of 0 players')).toBeInTheDocument();
    });

    it('displays correct item name', () => {
        render(
            <PlayerPagination
                currentPage={1}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="events"
            />
        );

        expect(screen.getByText('Showing 1 - 10 of 50 events')).toBeInTheDocument();
    });

    it('highlights current page', () => {
        render(
            <PlayerPagination
                currentPage={3}
                totalPages={5}
                totalItems={50}
                itemsPerPage={10}
                onPageChange={mockOnPageChange}
                itemName="players"
            />
        );

        const currentPageButton = screen.getByText('3');
        expect(currentPageButton).toHaveClass('bg-blue-600');
    });
}); 