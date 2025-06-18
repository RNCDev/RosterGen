'use client';

import React from 'react';
import { Search, Save, X, Trash2, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    activeTab: 'players' | 'teams';
    setActiveTab: (tab: 'players' | 'teams') => void;
    groupCode: string;
    onGroupCodeChange: (code: string) => void;
    onLoadGroup: () => void;
    onSaveGroup: () => void;
    onClearGroup: () => void;
    onDeleteGroup: () => void;
    isDirty: boolean;
    isLoading: boolean;
}

export default function Header({
    activeTab,
    setActiveTab,
    groupCode,
    onGroupCodeChange,
    onLoadGroup,
    onSaveGroup,
    onClearGroup,
    onDeleteGroup,
    isDirty,
    isLoading,
}: HeaderProps) {

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
        <header className="bg-white border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side: Navigation Tabs */}
                    <nav className="flex gap-8">
                        <TabButton
                            label="Players"
                            isActive={activeTab === 'players'}
                            onClick={() => setActiveTab('players')}
                        />
                        <TabButton
                            label="Teams"
                            isActive={activeTab === 'teams'}
                            onClick={() => setActiveTab('teams')}
                        />
                    </nav>

                    {/* Right side: Group Code Management */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => onGroupCodeChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLoadWithPrompt()}
                            placeholder="Enter Group Code"
                            className="input-neo flex-grow sm:w-48"
                            aria-label="Group Code"
                        />
                        <div className="flex gap-1 flex-shrink-0">
                            <button
                                onClick={handleLoadWithPrompt}
                                disabled={!groupCode.trim() || isLoading}
                                className="button-neo p-2 text-slate-600"
                                title="Load Group"
                            >
                                <Search size={16} />
                            </button>
                            <button
                                onClick={onSaveGroup}
                                disabled={!groupCode.trim() || !isDirty || isLoading}
                                className="button-neo p-2 text-green-600 disabled:text-slate-400 disabled:cursor-not-allowed"
                                title="Save Changes"
                            >
                                {isDirty ? <Save size={16} className="text-green-500 animate-pulse" /> : <ShieldCheck size={16} />}
                            </button>
                            <button
                                onClick={handleClearWithPrompt}
                                className="button-neo p-2 text-slate-600"
                                title="Clear Workspace"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={handleDeleteWithPrompt}
                                disabled={!groupCode.trim() || isLoading}
                                className="button-neo p-2 text-red-600"
                                title="Delete Group"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

interface TabButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = ({ label, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`relative py-2 text-sm font-medium transition-colors ${
            isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
        }`}
    >
        {label}
        {isActive && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
        )}
    </button>
); 