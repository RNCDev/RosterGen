// Sidebar.tsx
'use client';
import { Users, ListChecks } from 'lucide-react';

interface SidebarProps {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    onRetrieveGroupCode: () => Promise<void>;
    onSaveGroupCode: () => Promise<void>;
    onCancelGroupCode: () => void;
    onDeleteGroup: () => Promise<void>;
}

export default function Sidebar({
    activeTab,
    setActiveTab,
    groupCode,
    onGroupCodeChange,
    onRetrieveGroupCode,
    onSaveGroupCode,
    onCancelGroupCode,
    onDeleteGroup
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
        <aside className="w-64 bg-white shadow-lg min-h-screen">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Hockey Roster</h1>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group Code:
                            </label>
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => onGroupCodeChange(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-md"
                                placeholder="Enter group code"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                className="w-full h-9 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                                onClick={onRetrieveGroupCode}
                            >
                                Retrieve
                            </button>
                            <button
                                className="w-full h-9 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                onClick={onSaveGroupCode}
                                disabled={!groupCode}
                            >
                                Save
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                className="w-full h-9 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                onClick={onCancelGroupCode}
                            >
                                Cancel
                            </button>
                            <button
                                className="w-full h-9 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                                onClick={onDeleteGroup}
                                disabled={!groupCode}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id
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