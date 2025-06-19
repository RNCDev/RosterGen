'use client';

import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';

interface AppHeaderProps {
    activeTab: 'players' | 'teams';
    setActiveTab: (tab: 'players' | 'teams') => void;
}

export default function AppHeader({ activeTab, setActiveTab }: AppHeaderProps) {
    return (
        <header className="glass border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Simple Title */}
                    <h1 className="text-xl font-bold text-gray-800">
                        Hockey Roster Manager
                    </h1>

                    {/* Right side: Navigation Tabs */}
                    <nav className="flex items-center bg-white/40 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/30">
                        <TabButton
                            icon={Users}
                            label="Players"
                            isActive={activeTab === 'players'}
                            onClick={() => setActiveTab('players')}
                        />
                        <TabButton
                            icon={ArrowRightLeft}
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
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = ({ icon: Icon, label, isActive, onClick }: TabButtonProps) => (
    <button
        onClick={onClick}
        className={`
            relative flex items-center gap-3 px-6 py-3 rounded-lg font-semibold 
            transition-all duration-200 transform hover:scale-105
            ${isActive 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
            }
        `}
    >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        <span className="font-semibold">{label}</span>
        
        {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg opacity-20 animate-pulse" />
        )}
    </button>
); 