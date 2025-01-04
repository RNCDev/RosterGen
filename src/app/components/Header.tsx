// src/app/components/Header.tsx
'use client';

import React from 'react';

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
        <div className="w-full bg-white border-b shadow-sm">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                    {/* Group Code Management */}
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        <input 
                            type="text"
                            value={groupCode}
                            onChange={(e) => onGroupCodeChange(e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm w-full sm:w-32"
                            placeholder="Group Code"
                        />
                        <div className="flex gap-2 flex-wrap">
                            <button 
                                onClick={onRetrieveGroupCode}
                                className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex-1 sm:flex-none"
                            >
                                Load
                            </button>
                            <button 
                                onClick={onSaveGroupCode}
                                disabled={!groupCode}
                                className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                Save
                            </button>
                            <button 
                                onClick={onCancelGroupCode}
                                className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex-1 sm:flex-none"
                            >
                                Clear
                            </button>
                            <button 
                                onClick={onDeleteGroup}
                                disabled={!groupCode}
                                className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-4 w-full sm:w-auto justify-center sm:justify-end">
                        <button 
                            onClick={() => setActiveTab('players')}
                            className={`py-2 px-4 rounded-md transition-colors flex-1 sm:flex-none ${
                                activeTab === 'players' 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Players
                        </button>
                        <button 
                            onClick={() => setActiveTab('roster')}
                            className={`py-2 px-4 rounded-md transition-colors flex-1 sm:flex-none ${
                                activeTab === 'roster' 
                                    ? 'bg-blue-50 text-blue-600' 
                                    : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            Teams
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}