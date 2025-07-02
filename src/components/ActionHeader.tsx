'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
    Search, 
    Save, 
    X, 
    Trash2, 
    ShieldCheck,
    Loader2, // For spinner
    CheckCircle // For success
} from 'lucide-react';
// Import package.json to get version
import packageJson from '../../package.json';

interface ActionHeaderProps {
    // Group props
    groupCode: string;
    onGroupCodeChange: (code: string) => void;
    onLoadGroup: () => void;
    onSaveGroup: () => void;
    onClearGroup: () => void;
    onDeleteGroup: () => void;
    isGroupNameDirty: boolean;
    isPlayerListDirty: boolean;
    isLoading: boolean;
    isGroupLoaded: boolean;
    // Team alias props
    teamAlias1: string;
    setTeamAlias1: React.Dispatch<React.SetStateAction<string>>;
    teamAlias2: string;
    setTeamAlias2: React.Dispatch<React.SetStateAction<string>>;
    onUpdateTeamAliases: (alias1: string, alias2: string) => Promise<void>;
}

export default function ActionHeader({
    groupCode,
    onGroupCodeChange,
    onLoadGroup,
    onSaveGroup,
    onClearGroup,
    onDeleteGroup,
    isGroupNameDirty,
    isPlayerListDirty,
    isLoading,
    isGroupLoaded,
    teamAlias1,
    setTeamAlias1,
    teamAlias2,
    setTeamAlias2,
    onUpdateTeamAliases
}: ActionHeaderProps) {

    const [isSavingAlias1, setIsSavingAlias1] = useState(false);
    const [isSavingAlias2, setIsSavingAlias2] = useState(false);
    const [showAlias1Success, setShowAlias1Success] = useState(false);
    const [showAlias2Success, setShowAlias2Success] = useState(false);

    const handleLoadWithPrompt = () => {
        if (isPlayerListDirty && !window.confirm('You have unsaved changes to your roster. Are you sure you want to load a new group? Your current changes will be lost.')) {
            return;
        }
        onLoadGroup();
    };
    
    const handleClearWithPrompt = () => {
        if (isPlayerListDirty && !window.confirm('You have unsaved changes to your roster. Are you sure you want to clear the workspace?')) {
            return;
        }
        onClearGroup();
    };

    const handleDeleteWithPrompt = () => {
        if (!window.confirm(`Are you sure you want to permanently delete the group "${groupCode}"? This action cannot be undone.`)) {
            return;
        }
        onDeleteGroup();
    };

    const handleUpdateAlias1 = async (value: string) => {
        setIsSavingAlias1(true);
        try {
            await onUpdateTeamAliases(value, teamAlias2);
            setShowAlias1Success(true);
            setTimeout(() => setShowAlias1Success(false), 2000); // Hide after 2 seconds
        } catch (error) {
            console.error("Failed to update Team 1 alias:", error);
            // Handle error feedback if necessary
        } finally {
            setIsSavingAlias1(false);
        }
    };

    const handleUpdateAlias2 = async (value: string) => {
        setIsSavingAlias2(true);
        try {
            await onUpdateTeamAliases(teamAlias1, value);
            setShowAlias2Success(true);
            setTimeout(() => setShowAlias2Success(false), 2000); // Hide after 2 seconds
        } catch (error) {
            console.error("Failed to update Team 2 alias:", error);
            // Handle error feedback if necessary
        } finally {
            setIsSavingAlias2(false);
        }
    };

    return (
        <div className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
                {/* Main container for group code, team aliases, and action buttons */}
                <div className="flex flex-col gap-4">
                    {/* Group Code Input and Main Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-3 sm:gap-4 w-full">
                        {/* Group Code Input */}
                        <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                                <div className="card-modern flex items-center gap-2 px-3 py-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={groupCode}
                                        onChange={(e) => onGroupCodeChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLoadWithPrompt()}
                                        placeholder="Enter group code"
                                        className="bg-transparent focus:outline-none px-2 py-1 text-sm font-medium placeholder:text-gray-400 w-full sm:w-40 min-w-0"
                                        aria-label="Group Code"
                                    />
                                    <button
                                        onClick={handleLoadWithPrompt}
                                        disabled={!groupCode.trim() || isLoading}
                                        className="p-2 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 flex-shrink-0"
                                        title="Load Group"
                                    >
                                        <Search size={16} className="text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons (positioned after Group Code input horizontally) */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-white/30 sm:ml-auto">
                            <button
                                onClick={onSaveGroup}
                                disabled={!isGroupNameDirty || isLoading || !isGroupLoaded}
                                className={`p-2 rounded-md transition-all ${
                                    isGroupNameDirty && isGroupLoaded
                                        ? 'bg-green-50 text-green-600 hover:bg-green-100 animate-pulse'
                                        : 'text-gray-400'
                                }`}
                                title={isGroupNameDirty ? "Save New Group Name" : "Group Name Saved"}
                            >
                                {isGroupNameDirty ? (
                                    <Save size={16} />
                                ) : (
                                    <ShieldCheck size={16} />
                                )}
                            </button>
                            <button
                                onClick={handleClearWithPrompt}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                title="Clear Workspace"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={handleDeleteWithPrompt}
                                disabled={!groupCode.trim() || isLoading || !isGroupLoaded}
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                title="Delete Group"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Team Aliases (positioned below Group Code and Action Buttons) */}
                    {isGroupLoaded && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                            <div className="card-modern flex items-center gap-2 px-3 py-2 w-full sm:w-auto">
                                <label htmlFor="team1-name" className="text-sm font-medium text-gray-700">Team 1:</label>
                                <input
                                    id="team1-name"
                                    type="text"
                                    value={teamAlias1}
                                    onChange={(e) => setTeamAlias1(e.target.value)}
                                    onBlur={() => handleUpdateAlias1(teamAlias1)}
                                    placeholder="Team 1 Name"
                                    className="bg-transparent focus:outline-none px-2 py-1 text-sm font-medium placeholder:text-gray-400 w-full sm:w-40 min-w-0"
                                    aria-label="Team 1 Name"
                                />
                                {isSavingAlias1 && <Loader2 size={16} className="animate-spin text-blue-500" />}
                                {showAlias1Success && <CheckCircle size={16} className="text-green-500" />}
                            </div>
                            <div className="card-modern flex items-center gap-2 px-3 py-2 w-full sm:w-auto">
                                <label htmlFor="team2-name" className="text-sm font-medium text-gray-700">Team 2:</label>
                                <input
                                    id="team2-name"
                                    type="text"
                                    value={teamAlias2}
                                    onChange={(e) => setTeamAlias2(e.target.value)}
                                    onBlur={() => handleUpdateAlias2(teamAlias2)}
                                    placeholder="Team 2 Name"
                                    className="bg-transparent focus:outline-none px-2 py-1 text-sm font-medium placeholder:text-gray-400 w-full sm:w-40 min-w-0"
                                    aria-label="Team 2 Name"
                                />
                                {isSavingAlias2 && <Loader2 size={16} className="animate-spin text-blue-500" />}
                                {showAlias2Success && <CheckCircle size={16} className="text-green-500" />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 