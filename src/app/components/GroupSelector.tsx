import { useState } from 'react';
import { Users, Trash2 } from 'lucide-react';
import Dialog from './Dialog';

interface GroupSelectorProps {
    currentGroup: string;
    onGroupChange: (groupCode: string) => void;
    onGroupDelete?: () => Promise<void>;
}

export default function GroupSelector({
    currentGroup,
    onGroupChange,
    onGroupDelete
}: GroupSelectorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [groupInput, setGroupInput] = useState(currentGroup);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedGroup = groupInput.trim().toLowerCase();
        if (trimmedGroup) {
            try {
                // Make an API call to update the group name
                const response = await fetch('/api/groups', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        oldGroupCode: currentGroup,
                        newGroupCode: trimmedGroup,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update group');
                }

                onGroupChange(trimmedGroup);
                setIsEditing(false);
            } catch (error) {
                console.error('Error updating group:', error);
                // You might want to show an error message to the user here
            }
        }
    };

    const handleDelete = async () => {
        if (onGroupDelete) {
            try {
                setIsDeleting(true);
                await onGroupDelete();
                // Reset to default group after deletion
                onGroupChange('default');
            } catch (error) {
                console.error('Error deleting group:', error);
                // You might want to show an error message to the user here
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (!isEditing) {
        return (
            <>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 rounded hover:bg-gray-100"
                    >
                        <Users className="h-5 w-5" />
                        <span>Group: {currentGroup}</span>
                    </button>
                    {currentGroup !== 'default' && (
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            className="p-1.5 text-red-600 rounded hover:bg-red-50"
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    )}
                </div>

                <Dialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={handleDelete}
                    title="Delete Group"
                    description={`This will permanently delete the group "${currentGroup}" and all associated players and team history. This action cannot be undone.`}
                    confirmLabel="Delete Group"
                    cancelLabel="Cancel"
                />
            </>
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