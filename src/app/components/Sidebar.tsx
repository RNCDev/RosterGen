// Sidebar.tsx
'use client';

import { Users, ListChecks } from 'lucide-react';

interface SidebarProps {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const navItems = [
        {
            id: 'players' as const,
            label: 'Players',
            icon: Users
        },
        {
            id: 'roster' as const,
            label: 'Teams',
            icon: ListChecks
        }
    ];

    return (
        <aside className="w-64 bg-white shadow-lg">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Hockey Roster</h1>
                <nav className="mt-6 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeTab === item.id
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}