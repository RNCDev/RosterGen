import React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorAlert from '@/components/ErrorAlert';

describe('ErrorAlert', () => {
    it('renders error message when provided', () => {
        const errorMessage = 'Something went wrong';
        render(<ErrorAlert error={errorMessage} onDismiss={() => {}} />);
        
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('does not render when no error is provided', () => {
        render(<ErrorAlert error={null} onDismiss={() => {}} />);
        
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('calls onDismiss when close button is clicked', () => {
        const mockOnDismiss = jest.fn();
        const errorMessage = 'Test error';
        
        render(<ErrorAlert error={errorMessage} onDismiss={mockOnDismiss} />);
        
        const closeButton = screen.getByRole('button', { name: /close/i });
        closeButton.click();
        
        expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('displays error icon', () => {
        const errorMessage = 'Test error';
        render(<ErrorAlert error={errorMessage} onDismiss={() => {}} />);
        
        // Should have an alert role for accessibility
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('handles empty string error', () => {
        render(<ErrorAlert error="" onDismiss={() => {}} />);
        
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('handles undefined error', () => {
        render(<ErrorAlert error={undefined} onDismiss={() => {}} />);
        
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
}); 