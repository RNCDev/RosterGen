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

interface ActionHeaderProps {
    activeTab: 'players' | 'teams';
    // Group props
    groupCode: string;
    onGroupCodeChange: (code: string) => void;
    onLoadGroup: () => void;
    onSaveGroup: () => void;
    onClearGroup: () => void;
    onDeleteGroup: () => void;
    isDirty: boolean;
    isLoading: boolean;
    // Player view props
    isBulkEditing?: boolean;
    onToggleBulkEdit?: () => void;
    onAddPlayer?: () => void;
    onUploadCsv?: () => void;
    // Both views
    onGenerateTeams: () => void;
    playerCount: number;
    totalPlayerCount: number;
}

export default function ActionHeader({
    groupCode,
    onGroupCodeChange,
    onLoadGroup,
    onSaveGroup,
    onClearGroup,
    onDeleteGroup,
    isDirty,
    isLoading,
}: ActionHeaderProps) {

    const handleLoadWithPrompt = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to load a new group? Your current changes will be lost.')) {
            return;
        }
        onLoadGroup();
    };
    
    const handleClearWithPrompt = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to clear the workspace?')) {
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
        <div className="bg-white/40 backdrop-blur-md border-b border-white/30 sticky top-16 z-30">
            <div className="max-w-7xl mx-auto px-8 py-4">
                <div className="flex items-center justify-start">
                    <div className="flex items-center gap-4">
                        {/* Group Code Input */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold text-gray-700">GROUP</label>
                            <div className="card-modern flex items-center gap-2 px-3 py-2">
                                <input
                                    type="text"
                                    value={groupCode}
                                    onChange={(e) => onGroupCodeChange(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleLoadWithPrompt()}
                                    placeholder="Enter group code"
                                    className="bg-transparent focus:outline-none px-2 py-1 text-sm font-medium placeholder:text-gray-400 w-40"
                                    aria-label="Group Code"
                                />
                                <button
                                    onClick={handleLoadWithPrompt}
                                    disabled={!groupCode.trim() || isLoading}
                                    className="p-2 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                                    title="Load Group"
                                >
                                    <Search size={16} className="text-blue-600" />
                                </button>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-sm rounded-lg p-1 border border-white/30">
                            <button
                                onClick={onSaveGroup}
                                disabled={!groupCode.trim() || !isDirty || isLoading}
                                className={`p-2 rounded-md transition-all ${
                                    isDirty 
                                        ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                                        : 'text-gray-400 hover:bg-gray-50'
                                }`}
                                title="Save Changes"
                            >
                                {isDirty ? (
                                    <Save size={16} className="animate-pulse" />
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
                                disabled={!groupCode.trim() || isLoading}
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