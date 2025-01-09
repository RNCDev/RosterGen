// src/app/components/Header.tsx
'use client';

import React from 'react';
import { Users, ListChecks } from 'lucide-react';

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
            e.preventDefault();
            onRetrieveGroupCode();
        }
    };

    return (
        <div className="w-full bg-slate-50/80 backdrop-blur-sm border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                    {/* Group Code Input Section */}
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <input
                            type="text"
                            value={groupCode}
                            onChange={(e) => onGroupCodeChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter group code"
                            className="input-neo w-full sm:w-48"
                        />
                        <div className="flex gap-2">
                            <button onClick={onRetrieveGroupCode} 
                                    className="button-neo text-blue-600">
                                Load
                            </button>
                            <button onClick={onSaveGroupCode}
                                    className="button-neo text-emerald-600">
                                Save
                            </button>
                            <button onClick={onCancelGroupCode}
                                    className="button-neo text-slate-600">
                                Clear
                            </button>
                            <button onClick={onDeleteGroup}
                                    className="button-neo text-red-600">
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <nav className="flex gap-1 p-1.5 card-neo">
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`tab-neo flex items-center gap-2
                                ${activeTab === 'players' ? 'active' : 'text-slate-600'}`}
                        >
                            <Users size={18} />
                            <span className="font-medium">Players</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('roster')}
                            className={`tab-neo flex items-center gap-2
                                ${activeTab === 'roster' ? 'active' : 'text-slate-600'}`}
                        >
                            <ListChecks size={18} />
                            <span className="font-medium">Teams</span>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}