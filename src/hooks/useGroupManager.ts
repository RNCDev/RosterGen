'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Player } from '@/types/PlayerTypes';
import _ from 'lodash';

export function useGroupManager() {
    const [groupCode, setGroupCode] = useState<string>('');
    const [loadedGroupCode, setLoadedGroupCode] = useState<string>('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [originalPlayers, setOriginalPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Using a callback for handleLoadGroup to use it in useEffect
    const handleLoadGroup = useCallback(async (code: string) => {
        if (!code) {
            setPlayers([]);
            setOriginalPlayers([]);
            setLoadedGroupCode('');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/groups?groupCode=${code}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch players');
            }
            const data: Player[] = await response.json();
            setPlayers(data);
            setOriginalPlayers(data); // Set original state after fetching
            setLoadedGroupCode(code);
            localStorage.setItem('groupCode', code);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
            setPlayers([]);
            setOriginalPlayers([]);
            setLoadedGroupCode('');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load initial group code from localStorage
    useEffect(() => {
        const savedGroupCode = localStorage.getItem('groupCode');
        if (savedGroupCode) {
            setGroupCode(savedGroupCode);
            handleLoadGroup(savedGroupCode);
        } else {
            setLoading(false);
        }
    }, [handleLoadGroup]);

    const isDirty = !_.isEqual(players, originalPlayers);

    const handleSaveGroup = async () => {
        if (!groupCode) {
            setError('Please enter a group code to save.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupCode, players }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save group');
            }

            const savedPlayers: Player[] = await response.json();
            setPlayers(savedPlayers);
            setOriginalPlayers(savedPlayers); // Update original state after saving
            setLoadedGroupCode(groupCode);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearGroup = () => {
        setGroupCode('');
        setLoadedGroupCode('');
        setPlayers([]);
        setOriginalPlayers([]);
        localStorage.removeItem('groupCode');
        setError(null);
    };

    const handleDeleteGroup = async () => {
        if (!groupCode) {
            setError('No group code selected to delete.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/groups', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupCode }),
            });

            if (!response.ok) {
                // If there's an error, try to parse JSON, but handle cases where it might not be
                let errorMessage = 'Failed to delete group';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    // Response was not JSON, use status text
                    errorMessage = `${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            // On success (e.g., 204 No Content), just clear the group
            handleClearGroup();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete group');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        groupCode,
        setGroupCode,
        loadedGroupCode,
        players,
        setPlayers,
        originalPlayers,
        loading,
        error,
        isDirty,
        handleLoadGroup,
        handleSaveGroup,
        handleClearGroup,
        handleDeleteGroup,
        setError,
    };
}