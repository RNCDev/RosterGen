// src/app/components/Header.tsx
'use client';

import React from 'react';
import { Download, Save, X, Trash2 } from 'lucide-react';
import _ from 'lodash';

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
    return (
        <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4">
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
                    <div 
                        className="flex items-center gap-2 w-full sm:w-auto"
                        data-form-type="other"
                        data-dashlane-ignore="true"
                    >
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => onGroupCodeChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && groupCode.trim()) {
                                    onRetrieveGroupCode();
                                }
                            }}
                            placeholder="Group Code"
                            className="input-neo flex-grow sm:w-48"
                            data-form-type="other"
                            data-dashlane-ignore="true"
                            autoComplete="off"
                            aria-label="Group Code"
                        />
                        <div className="flex gap-1 flex-shrink-0">
                            <button 
                                onClick={onRetrieveGroupCode}
                                disabled={!groupCode.trim()}
                                className="button-neo bg-gradient-to-b from-blue-500 to-blue-600 
                                         text-white hover:from-blue-600 hover:to-blue-700
                                         disabled:opacity-50 disabled:cursor-not-allowed p-2"
                                title="Load Group"
                                data-dashlane-ignore="true"
                                type="button"
                            >
                                <Download size={16} />
                            </button>
                            <button 
                                onClick={onCancelGroupCode}
                                className="button-neo p-2 text-slate-600"
                                title="Clear"
                                data-dashlane-ignore="true"
                                type="button"
                            >
                                <X size={16} />
                            </button>
                            <button 
                                onClick={onDeleteGroup}
                                className="button-neo p-2 text-red-600"
                                title="Delete Group"
                                data-dashlane-ignore="true"
                                type="button"
                                disabled={!groupCode.trim()}
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