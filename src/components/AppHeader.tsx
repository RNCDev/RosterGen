'use client';

import React from 'react';

interface AppHeaderProps {
    activeTab: 'players' | 'teams';
    setActiveTab: (tab: 'players' | 'teams') => void;
}

export default function AppHeader({ activeTab, setActiveTab }: AppHeaderProps) {
    return (
        <header className="bg-white border-b sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Title */}
                    <h1 className="text-xl font-bold text-slate-800">
                        Hockey Roster Manager
                    </h1>

                    {/* Right side: Navigation Tabs */}
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