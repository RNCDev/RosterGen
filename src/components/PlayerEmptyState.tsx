'use client';

import React from 'react';
import { Users } from 'lucide-react';

export default function PlayerEmptyState() {
    return (
        <div className="text-center py-12">
            <Users size={48} className="mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700">No Players in Roster</h3>
            <p className="mt-1 text-sm text-gray-500">
                Click &quot;Add Player&quot; or &quot;Upload CSV&quot; to get started.
            </p>
        </div>
    );
} 