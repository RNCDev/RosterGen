// Sidebar.tsx
'use client';

import { Users, ListChecks } from 'lucide-react';

interface SidebarProps {
    activeTab: 'players' | 'roster';
    setActiveTab: (tab: 'players' | 'roster') => void;
    groupCode: string;
    onGroupCodeChange: (groupCode: string) => void;
    onSaveGroupCode: () => Promise<void>;
    onCancelGroupCode: () => void;
    onDeleteGroup: () => Promise<void>;
}

export default function Sidebar({
    activeTab,
    setActiveTab,
    groupCode,
    onGroupCodeChange,
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
        <aside className="w-64 bg-white shadow-lg">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900">Hockey Roster</h1>
                <div className="mt-4 px-4 py-2 bg-gray-50 rounded-lg">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Group Code:</span>
                            <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => onGroupCodeChange(e.target.value)}
                                className="ml-2 px-2 py-1 text-sm border rounded"
                                placeholder="Enter group code"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={onRetrieveGroupCode}
                            >
                                Retrieve
                            </button>
                            <button
                                className="flex-1 text-sm px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={onSaveGroupCode}
                                disabled={!groupCode}
                            >
                                Save
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="flex-1 text-sm px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                onClick={onCancelGroupCode}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 text-sm px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={onDeleteGroup}
                                disabled={!groupCode}
                            >
                                Delete Group
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}