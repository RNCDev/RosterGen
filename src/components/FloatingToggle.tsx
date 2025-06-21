'use client';

import React from 'react';
import { Users, Calendar } from 'lucide-react';
import packageJson from '../../package.json';

interface FloatingToggleProps {
    activeTab: 'players' | 'events';
    setActiveTab: (tab: 'players' | 'events') => void;
}

export default function FloatingToggle({ activeTab, setActiveTab }: FloatingToggleProps) {
    return (
        <div className="fixed top-6 left-6 z-50 flex flex-col items-center gap-2 select-none">
            {/* Segmented control */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl border border-white/40 overflow-hidden">
                <button
                    onClick={() => setActiveTab('players')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors w-full
                        ${activeTab === 'players' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'hover:bg-white/40 text-gray-700'}`}
                >
                    <Users className="w-5 h-5" />
                    Players
                </button>
                <div className="w-full h-px bg-white/40" />
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors w-full
                        ${activeTab === 'events' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' : 'hover:bg-white/40 text-gray-700'}`}
                >
                    <Calendar className="w-5 h-5" />
                    Events
                </button>
            </div>
            {/* Version badge */}
            <span className="text-[10px] font-medium text-gray-500 bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-md shadow-md">
                v{packageJson.version}
            </span>
        </div>
    );
} 