// components/GroupSelector.tsx
import React, { useState } from 'react';
import { type GroupSelectorProps } from '@/types/PlayerTypes';

export default function GroupSelector({ currentGroup, onGroupChange }: GroupSelectorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [groupInput, setGroupInput] = useState(currentGroup);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedGroup = groupInput.trim().toLowerCase();
        if (trimmedGroup) {
            onGroupChange(trimmedGroup);
            setIsEditing(false);
        }
    };

    if (!isEditing) {
        return (
            <button 
                onClick={() => setIsEditing(true)} 
                className="text-sm text-gray-500 hover:text-gray-700"
            >
                Group: {currentGroup}
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                placeholder="Enter group code"
                className="px-2 py-1 border rounded text-sm"
            />
            <button 
                type="submit" 
                className="px-2 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
                Save
            </button>
            <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
            >
                Cancel
            </button>
        </form>
    );
}