'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { 
    Search, 
    Save, 
    X, 
    Trash2, 
    ShieldCheck
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

    return (
        <div className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-start gap-3 sm:gap-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
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
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-white/30">
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
                </div>
            </div>
        </div>
    );
} 