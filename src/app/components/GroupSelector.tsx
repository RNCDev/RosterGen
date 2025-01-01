// components/GroupSelector.tsx
import React, { useState } from 'react';

interface GroupSelectorProps {
    currentGroup: string;
    onGroupChange: (groupCode: string) => void;
    onGetPlayers: (groupCode: string) => void;
}

export default function GroupSelector({ currentGroup, onGroupChange, onGetPlayers }: GroupSelectorProps) {
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

    const handleGetPlayers = () => {
        const trimmedGroup = groupInput.trim().toLowerCase();
        onGetPlayers(trimmedGroup);
    };

    if (!isEditing) {
        return (
            <div>
                <button onClick={() => setIsEditing(true)}>
                    Current Group: {currentGroup}
                </button>
                <button onClick={handleGetPlayers}>Get Players</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
                placeholder="Enter group code"
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>
                Cancel</button>
        </form>
    );
}