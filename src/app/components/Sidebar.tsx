// Sidebar.tsx
'use client';

import { Users, ListChecks } from 'lucide-react';

interface SidebarProps {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
}

export default function Sidebar({
    activeTab,
    setActiveTab,
    groupCode,
    onGroupCodeChange
}: SidebarProps) {
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
                {groupCode !== 'default' && (
                    <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                        <button
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                            onClick={() => onGroupCodeChange('default')}
                        >
                            <span>Group: {groupCode}</span>
                            <Users className="h-5 w-5" />
                        </button>
                    </div>
                )}
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