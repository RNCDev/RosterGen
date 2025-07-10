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
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
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
    isGroupLoaded
}: ActionHeaderProps) {
    const confirmDialog = useConfirmDialog();

    const handleLoadWithPrompt = async () => {
        if (isPlayerListDirty) {
            const confirmed = await confirmDialog.confirmUnsavedChanges('load a new group');
            if (!confirmed) return;
        }
        onLoadGroup();
    };
    
    const handleClearWithPrompt = async () => {
        if (isPlayerListDirty) {
            const confirmed = await confirmDialog.confirmUnsavedChanges('clear the workspace');
            if (!confirmed) return;
        }
        onClearGroup();
    };

    const handleDeleteWithPrompt = async () => {
        const confirmed = await confirmDialog.confirmDeletion(groupCode, 'group');
        if (confirmed) {
            onDeleteGroup();
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
                </div>
            </div>
        </div>
    );
} 