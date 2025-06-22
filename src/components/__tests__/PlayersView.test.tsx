import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayersView from '@/components/PlayersView';
import { Player } from '@/types/PlayerTypes';

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

const mockPlayers: Player[] = [
    { id: 1, first_name: 'John', last_name: 'Doe', skill: 5, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', skill: 8, is_defense: true, is_goalie: false, group_id: '1' },
    { id: 3, first_name: 'Peter', last_name: 'Jones', skill: 3, is_defense: false, is_goalie: false, group_id: '1' },
];

describe('PlayersView', () => {
    it('renders the empty state when no players are provided', () => {
        render(<PlayersView players={[]} setPlayers={jest.fn()} loading={false} isDirty={false} />);
        expect(screen.getByText('No Players in Roster')).toBeInTheDocument();
        expect(screen.getByText(/Click "Add Player" or "Upload CSV" to get started./i)).toBeInTheDocument();
    });

    it('renders a list of players', () => {
        render(<PlayersView players={mockPlayers} setPlayers={jest.fn()} loading={false} isDirty={false} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Peter Jones')).toBeInTheDocument();
    });

    it('toggles edit mode when the edit button is clicked', () => {
        render(<PlayersView players={mockPlayers} setPlayers={jest.fn()} loading={false} isDirty={false} />);
        
        // Initially not in edit mode
        expect(screen.queryByText('Actions')).not.toBeInTheDocument();

        const editButton = screen.getByRole('button', { name: /edit roster/i });
        fireEvent.click(editButton);

        // After clicking, should be in edit mode
        expect(screen.getByText('Actions')).toBeInTheDocument();
        
        const doneButton = screen.getByRole('button', { name: /done/i });
        fireEvent.click(doneButton);

        // After clicking done, should not be in edit mode
        expect(screen.queryByText('Actions')).not.toBeInTheDocument();
    });

    it('filters players by position', () => {
        render(<PlayersView players={mockPlayers} setPlayers={jest.fn()} loading={false} isDirty={false} />);
        
        const positionFilter = screen.getByTestId('position-filter');
        fireEvent.change(positionFilter, { target: { value: 'defense' } });

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Peter Jones')).not.toBeInTheDocument();
    });
}); 