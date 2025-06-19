'use client';

import React from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import packageJson from '../../package.json';

interface AppHeaderProps {
    activeTab: 'players' | 'teams';
    setActiveTab: (tab: 'players' | 'teams') => void;
}

export default function AppHeader({ activeTab, setActiveTab }: AppHeaderProps) {
    return (
        <header className="glass border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left side: Title with version */}
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold text-gray-800">
                            Hockey Roster Manager
                        </h1>
                        <span className="text-xs text-gray-400 font-medium">
                            v{packageJson.version}
                        </span>
                    </div>

                    {/* Right side: Navigation Tabs with sliding indicator */}
                    <nav className="relative flex items-center bg-white/40 backdrop-blur-sm rounded-xl p-1 shadow-lg border border-white/30">
                        {/* Sliding Background Indicator */}
                        <div 
                            className={`absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg transition-all duration-300 ease-out ${
                                activeTab === 'players' 
                                    ? 'left-1 right-[calc(50%-2px)]' 
                                    : 'right-1 left-[calc(50%-2px)]'
                            }`}
                        />
                        
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
            relative z-10 flex items-center gap-3 px-6 py-3 rounded-lg font-semibold 
            transition-all duration-300 ease-out transform hover:scale-[1.02]
            ${isActive 
                ? 'text-white shadow-lg' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
            }
        `}
    >
        <Icon className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`} />
        <span className="font-semibold transition-colors duration-300">{label}</span>
    </button>
); 