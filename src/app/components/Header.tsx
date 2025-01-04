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
        <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => onGroupCodeChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter group code"
                                className="block w-full sm:w-44 rounded-md border border-gray-300 px-3 py-2 text-sm 
                                         focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            <button
                                onClick={onRetrieveGroupCode}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                                         transition-colors text-sm font-medium shadow-sm"
                            >
                                Load
                            </button>
                            <button
                                onClick={onSaveGroupCode}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                                         transition-colors text-sm font-medium shadow-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={onCancelGroupCode}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 
                                         transition-colors text-sm font-medium shadow-sm"
                            >
                                Clear
                            </button>
                            <button
                                onClick={onDeleteGroup}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                                         transition-colors text-sm font-medium shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-end bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                ${activeTab === 'players' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-600 hover:bg-white/50'}`}
                        >
                            <Users size={18} />
                            <span className="font-medium">Players</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('roster')}
                            className={`py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2
                                ${activeTab === 'roster' 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-600 hover:bg-white/50'}`}
                        >
                            <ListChecks size={18} />
                            <span className="font-medium">Teams</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}