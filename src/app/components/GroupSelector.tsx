// GroupSelector.tsx
'use client';

import { useState } from 'react';
import { Users } from 'lucide-react';

interface GroupSelectorProps {
    currentGroup: string;
    onGroupChange: (groupCode: string) => void;
}

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
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 rounded hover:bg-gray-100"
            >
                <Users className="h-5 w-5" />
                <span>Group: {currentGroup}</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                className="px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter group code"
                autoFocus
            />
            <button
                type="submit"
                className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
                Save
            </button>
            <button
                type="button"
                onClick={() => {
                    setIsEditing(false);
                    setGroupInput(currentGroup);
                }}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
                Cancel
            </button>
        </form>
    );
}