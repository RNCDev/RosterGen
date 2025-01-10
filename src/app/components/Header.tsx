// src/app/components/Header.tsx
'use client';

import React from 'react';
import { Download, Save, X, Trash2 } from 'lucide-react';

interface HeaderProps {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    onRetrieveGroupCode: () => Promise<void>;
    onSaveGroupCode: () => Promise<void>;
    onCancelGroupCode: () => void;
    onDeleteGroup: () => Promise<void>;
}

export default function Header({
    activeTab,
    setActiveTab,
    groupCode,
    onGroupCodeChange,
    onRetrieveGroupCode,
    onSaveGroupCode,
    onCancelGroupCode,
    onDeleteGroup
}: HeaderProps) {
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onRetrieveGroupCode();
        }
    };

    return (
        <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4">
                {/* Stack vertically on mobile, space between on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Left side: Simple text tabs */}
                    <nav className="flex gap-8">
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`relative py-2 text-sm font-medium transition-colors
                                ${activeTab === 'players' 
                                    ? 'text-blue-600' 
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Players
                            {activeTab === 'players' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveTab('roster')}
                            className={`relative py-2 text-sm font-medium transition-colors
                                ${activeTab === 'roster' 
                                    ? 'text-blue-600' 
                                    : 'text-slate-600 hover:text-slate-900'}`}
                        >
                            Teams
                            {activeTab === 'roster' && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                            )}
                        </button>
                    </nav>

                    {/* Right side: Group Code - Full width on mobile */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => onGroupCodeChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Group Code"
                            className="input-neo flex-grow sm:w-48"
                        />
                        <div className="flex gap-1 flex-shrink-0">
                            <button 
                                onClick={onRetrieveGroupCode} 
                                className="button-neo p-2 text-blue-600" 
                                title="Load"
                            >
                                <Download size={16} />
                            </button>
                            <button 
                                onClick={onSaveGroupCode}
                                className="button-neo p-2 text-emerald-600"
                                title="Save"
                            >
                                <Save size={16} />
                            </button>
                            <button 
                                onClick={onCancelGroupCode}
                                className="button-neo p-2 text-slate-600"
                                title="Clear"
                            >
                                <X size={16} />
                            </button>
                            <button 
                                onClick={onDeleteGroup}
                                className="button-neo p-2 text-red-600"
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