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
    CheckCircle, // For success
    Clipboard,
    Pencil
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
                    {/* Group Code Input (pill style) and Main Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-3 sm:gap-4 w-full">
                        {/* Group Code Input with Label, styled as pill */}
                        <div className="flex flex-col items-start gap-2 w-full sm:w-auto">
                            <div className="flex flex-row items-center gap-2 w-full sm:w-auto">
                                <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm min-w-[140px]">
                                    <span className="text-xs font-semibold text-gray-500 uppercase mr-2">GROUP</span>
                                    <input
                                        type="text"
                                        value={groupCode}
                                        onChange={(e) => onGroupCodeChange(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLoadWithPrompt()}
                                        placeholder="Group Code"
                                        className="bg-transparent focus:outline-none text-base font-bold text-blue-800 w-28 min-w-0 px-1"
                                        aria-label="Group Code"
                                    />
                                    <button
                                        onClick={handleLoadWithPrompt}
                                        disabled={!groupCode.trim() || isLoading}
                                        className="p-2 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 flex-shrink-0"
                                        title="Load Group"
                                    >
                                        <Search size={18} className="text-blue-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        {/* Action Buttons (more prominent) */}
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 border border-blue-200 shadow-md sm:ml-auto">
                            <button
                                onClick={onSaveGroup}
                                disabled={!isGroupNameDirty || isLoading || !isGroupLoaded}
                                className={`px-3 py-2 rounded-md font-semibold transition-all shadow-sm border ${
                                    isGroupNameDirty && isGroupLoaded
                                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200 animate-pulse'
                                        : 'bg-gray-100 text-gray-400 border-gray-200'
                                }`}
                                title={isGroupNameDirty ? "Save New Group Name" : "Group Name Saved"}
                            >
                                {isGroupNameDirty ? (
                                    <Save size={18} />
                                ) : (
                                    <ShieldCheck size={18} />
                                )}
                            </button>
                            <button
                                onClick={handleClearWithPrompt}
                                className="px-3 py-2 rounded-md font-semibold bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 transition-colors shadow-sm"
                                title="Clear Workspace"
                            >
                                <X size={18} />
                            </button>
                            <button
                                onClick={handleDeleteWithPrompt}
                                disabled={!groupCode.trim() || isLoading || !isGroupLoaded}
                                className="px-3 py-2 rounded-md font-semibold bg-red-100 text-red-600 border border-red-200 hover:bg-red-200 transition-colors shadow-sm disabled:opacity-50"
                                title="Delete Group"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Team Aliases (card/chip style, match group style) */}
                    {isGroupLoaded && (
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                            {/* Team 1 Chip */}
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                                <span className="text-xs font-semibold text-gray-500 uppercase mr-2">TEAM 1</span>
                                <input
                                    id="team1-name"
                                    type="text"
                                    value={teamAlias1}
                                    onChange={(e) => setTeamAlias1(e.target.value)}
                                    onBlur={() => handleUpdateAlias1(teamAlias1)}
                                    placeholder="Red"
                                    className="bg-transparent focus:outline-none text-base font-bold text-blue-800 w-20 min-w-0 px-1"
                                    aria-label="Team 1 Name"
                                />
                                <span className="ml-1 flex items-center">
                                    {isSavingAlias1 ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Pencil size={16} className="text-blue-400 cursor-pointer hover:text-blue-600 transition" aria-label="Edit team name" />}
                                    {showAlias1Success && <CheckCircle size={16} className="text-green-500 ml-1" />}
                                </span>
                            </div>
                            {/* Team 2 Chip */}
                            <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 border border-blue-200 shadow-sm">
                                <span className="text-xs font-semibold text-gray-500 uppercase mr-2">TEAM 2</span>
                                <input
                                    id="team2-name"
                                    type="text"
                                    value={teamAlias2}
                                    onChange={(e) => setTeamAlias2(e.target.value)}
                                    onBlur={() => handleUpdateAlias2(teamAlias2)}
                                    placeholder="White"
                                    className="bg-transparent focus:outline-none text-base font-bold text-blue-800 w-20 min-w-0 px-1"
                                    aria-label="Team 2 Name"
                                />
                                <span className="ml-1 flex items-center">
                                    {isSavingAlias2 ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <Pencil size={16} className="text-blue-400 cursor-pointer hover:text-blue-600 transition" aria-label="Edit team name" />}
                                    {showAlias2Success && <CheckCircle size={16} className="text-green-500 ml-1" />}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 