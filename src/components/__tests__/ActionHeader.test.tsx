import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionHeader from '@/components/ActionHeader';

describe('ActionHeader', () => {
    const mockProps = {
        groupCode: 'TEST',
        onGroupCodeChange: jest.fn(),
        onLoadGroup: jest.fn(),
        onSaveGroup: jest.fn(),
        onClearGroup: jest.fn(),
        onDeleteGroup: jest.fn(),
        isGroupNameDirty: false,
        isPlayerListDirty: false,
        isLoading: false,
        isGroupLoaded: true,
    };

    it('renders the group code input with the correct value', () => {
        render(<ActionHeader {...mockProps} />);
        const inputElement = screen.getByLabelText(/group code/i);
        expect(inputElement).toBeInTheDocument();
        expect(inputElement).toHaveValue('TEST');
    });

    it('calls onGroupCodeChange when the input value changes', () => {
        render(<ActionHeader {...mockProps} />);
        const inputElement = screen.getByLabelText(/group code/i);
        fireEvent.change(inputElement, { target: { value: 'NEWCODE' } });
        expect(mockProps.onGroupCodeChange).toHaveBeenCalledWith('NEWCODE');
    });

    it('calls onLoadGroup when the load button is clicked', () => {
        render(<ActionHeader {...mockProps} />);
        const loadButton = screen.getByTitle(/load group/i);
        fireEvent.click(loadButton);
        expect(mockProps.onLoadGroup).toHaveBeenCalled();
    });
}); 