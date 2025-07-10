'use client';

import { useState, useEffect, useCallback } from 'react';
import { type Group } from '@/types/PlayerTypes';

export interface GroupState {
  groupCodeInput: string;
  activeGroup: Group | null;
  loading: boolean;
  error: string | null;
  isGroupNameDirty: boolean;
  setGroupCodeInput: (code: string) => void;
  setError: (error: string | null) => void;
  handleLoadGroup: (code: string) => Promise<void>;
  handleCreateGroup: (code: string) => Promise<Group>;
  handleRenameGroup: (newCode: string) => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
  handleClearGroup: () => void;
  handleUpdateTeamAliases: (alias1: string, alias2: string) => Promise<void>;
  teamAlias1: string;
  teamAlias2: string;
  setTeamAlias1: (alias: string) => void;
  setTeamAlias2: (alias: string) => void;
}

export function useGroupState(): GroupState {
  const [groupCodeInput, setGroupCodeInput] = useState<string>('');
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [teamAlias1, setTeamAlias1] = useState<string>('Red');
  const [teamAlias2, setTeamAlias2] = useState<string>('White');

  // Initial load from localStorage
  useEffect(() => {
    const savedGroupCode = localStorage.getItem('activeGroupCode');
    if (savedGroupCode) {
      setGroupCodeInput(savedGroupCode);
      handleLoadGroup(savedGroupCode);
    }
  }, []);

  const clearGroupState = () => {
    setActiveGroup(null);
    localStorage.removeItem('activeGroupCode');
  };

  const handleLoadGroup = useCallback(async (code: string) => {
    if (!code) {
      clearGroupState();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const groupResponse = await fetch(`/api/groups?code=${code}`);
      if (!groupResponse.ok) {
        if (groupResponse.status === 404) {
          throw new Error('Group not found. Check the code or create a new one.');
        }
        const errorData = await groupResponse.json();
        throw new Error(errorData.error || 'Failed to fetch group');
      }
      const groupData: Group = await groupResponse.json();
      const sanitizedGroupData = {
        ...groupData,
        "team-alias-1": groupData["team-alias-1"] && groupData["team-alias-1"].trim() !== '' ? groupData["team-alias-1"] : 'Red',
        "team-alias-2": groupData["team-alias-2"] && groupData["team-alias-2"].trim() !== '' ? groupData["team-alias-2"] : 'White',
      };
      setActiveGroup(sanitizedGroupData);
      setGroupCodeInput(sanitizedGroupData.code);
      localStorage.setItem('activeGroupCode', sanitizedGroupData.code);
      setTeamAlias1(sanitizedGroupData["team-alias-1"]);
      setTeamAlias2(sanitizedGroupData["team-alias-2"]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
      clearGroupState();
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateGroup = async (newGroupCode: string): Promise<Group> => {
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: newGroupCode })
    });
    if (!response.ok) {
      const { error } = await response.json();
      throw new Error(error || 'Failed to create group.');
    }
    const newGroup: Group = await response.json();
    await handleLoadGroup(newGroup.code);
    return newGroup;
  };

  const handleRenameGroup = useCallback(async (newCode: string) => {
    if (!activeGroup || !isGroupNameDirty) return;
    try {
      const response = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: activeGroup.id, newCode })
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to rename group');
      }
      const updatedGroup: Group = await response.json();
      setActiveGroup(updatedGroup);
      setGroupCodeInput(updatedGroup.code);
      localStorage.setItem('activeGroupCode', updatedGroup.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename group');
      setGroupCodeInput(activeGroup.code);
    }
  }, [activeGroup]);

  const handleUpdateTeamAliases = useCallback(async (alias1: string, alias2: string) => {
    if (!activeGroup) return;
    try {
      const response = await fetch('/api/groups/aliases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: activeGroup.id, teamAlias1: alias1, teamAlias2: alias2 })
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update team aliases');
      }
      const updatedGroup: Group = await response.json();
      setActiveGroup(updatedGroup);
      setTeamAlias1(updatedGroup["team-alias-1"] && updatedGroup["team-alias-1"].trim() !== '' ? updatedGroup["team-alias-1"] : 'Red');
      setTeamAlias2(updatedGroup["team-alias-2"] && updatedGroup["team-alias-2"].trim() !== '' ? updatedGroup["team-alias-2"] : 'White');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team aliases');
    }
  }, [activeGroup]);

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;
    try {
      const response = await fetch(`/api/groups?groupId=${activeGroup.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete group');
      setGroupCodeInput('');
      clearGroupState();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const handleClearGroup = () => {
    setGroupCodeInput('');
    clearGroupState();
  };

  const isGroupNameDirty = activeGroup ? groupCodeInput !== activeGroup.code : false;

  return {
    groupCodeInput,
    activeGroup,
    loading,
    error,
    isGroupNameDirty,
    setGroupCodeInput,
    setError,
    handleLoadGroup,
    handleCreateGroup,
    handleRenameGroup,
    handleDeleteGroup,
    handleClearGroup,
    handleUpdateTeamAliases,
    teamAlias1,
    teamAlias2,
    setTeamAlias1,
    setTeamAlias2,
  };
} 