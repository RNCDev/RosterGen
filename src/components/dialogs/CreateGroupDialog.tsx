'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';

interface CreateGroupDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (groupCode: string) => Promise<void>;
}

export default function CreateGroupDialog({ isOpen, onClose, onCreate }: CreateGroupDialogProps) {
    const [groupCode, setGroupCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (!groupCode.trim()) {
            setError('Group code cannot be empty.');
            return;
        }

        setIsLoading(true);
        try {
            await onCreate(groupCode);
            onClose(); // Close dialog on success
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Group</DialogTitle>
                    <DialogDescription>
                        Enter a unique code for your new group. This code will be used to load, save, and share your roster.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <input
                        type="text"
                        value={groupCode}
                        onChange={(e) => setGroupCode(e.target.value)}
                        placeholder="e.g., Friday-Night-Hockey"
                        className="input-neo w-full"
                        aria-label="New Group Code"
                        disabled={isLoading}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !groupCode.trim()}>
                        {isLoading ? 'Creating...' : 'Create Group'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 