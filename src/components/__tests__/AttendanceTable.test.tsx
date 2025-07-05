import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AttendanceTable from '@/components/AttendanceTable';
import { PlayerWithAttendance } from '@/types/PlayerTypes';

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

const mockPlayersWithAttendance: PlayerWithAttendance[] = [
    { 
        id: 1, 
        first_name: 'John', 
        last_name: 'Doe', 
        skill: 5, 
        is_defense: false, 
        is_goalie: false, 
        group_id: '1',
        is_attending_event: true,
        notes: ''
    },
    { 
        id: 2, 
        first_name: 'Jane', 
        last_name: 'Smith', 
        skill: 8, 
        is_defense: true, 
        is_goalie: false, 
        group_id: '1',
        is_attending_event: false,
        notes: 'Can\'t make it'
    },
    { 
        id: 3, 
        first_name: 'Peter', 
        last_name: 'Jones', 
        skill: 3, 
        is_defense: false, 
        is_goalie: false, 
        group_id: '1',
        is_attending_event: true,
        notes: ''
    },
];

describe('AttendanceTable', () => {
    const mockOnAttendanceToggle = jest.fn();

    beforeEach(() => {
        mockOnAttendanceToggle.mockClear();
    });

    it('renders attendance table with players', () => {
        render(
            <AttendanceTable 
                players={mockPlayersWithAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Peter Jones')).toBeInTheDocument();
    });

    it('displays attendance status correctly', () => {
        render(
            <AttendanceTable 
                players={mockPlayersWithAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        // Check that attending players show as checked
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes[0]).toBeChecked(); // John
        expect(checkboxes[1]).not.toBeChecked(); // Jane
        expect(checkboxes[2]).toBeChecked(); // Peter
    });

    it('displays position labels correctly', () => {
        render(
            <AttendanceTable 
                players={mockPlayersWithAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        expect(screen.getByText('Forward')).toBeInTheDocument();
        expect(screen.getByText('Defense')).toBeInTheDocument();
    });

    it('calls onAttendanceToggle when checkbox is clicked', () => {
        render(
            <AttendanceTable 
                players={mockPlayersWithAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        const checkboxes = screen.getAllByRole('checkbox');
        fireEvent.click(checkboxes[1]); // Jane's checkbox
        
        expect(mockOnAttendanceToggle).toHaveBeenCalledWith(2); // Jane's player ID
    });

    it('handles empty players array', () => {
        render(
            <AttendanceTable 
                players={[]} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        // Should show table headers but no player rows
        expect(screen.getByText('Player')).toBeInTheDocument();
        expect(screen.getByText('Position')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays table headers correctly', () => {
        render(
            <AttendanceTable 
                players={mockPlayersWithAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        expect(screen.getByText('Player')).toBeInTheDocument();
        expect(screen.getByText('Position')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('handles null attendance status', () => {
        const playersWithNullAttendance = [
            { 
                ...mockPlayersWithAttendance[0], 
                is_attending_event: null 
            }
        ];
        
        render(
            <AttendanceTable 
                players={playersWithNullAttendance} 
                onAttendanceToggle={mockOnAttendanceToggle} 
            />
        );
        
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).not.toBeChecked();
    });
}); 