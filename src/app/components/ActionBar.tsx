// src/app/components/ActionBar.tsx
'use client';

import React from 'react';
import { Upload, Users, ArrowLeftRight } from 'lucide-react';

interface ActionBarProps {
    onAddPlayer: () => void;
    onUploadClick: () => void;
    onGenerateTeams?: () => void;
    showGenerateTeams?: boolean;
    disabled?: boolean;
}

export default function ActionBar({
    onAddPlayer,
    onUploadClick,
    onGenerateTeams,
    showGenerateTeams = true,
    disabled = false
}: ActionBarProps) {
    return (
        <div className="px-4 py-2 border-b bg-white flex gap-2">
            <button 
                onClick={onAddPlayer}
                disabled={disabled}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Users size={18} />
                Add Player
            </button>
            
            <label className={`inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}>
                <Upload size={18} />
                Upload CSV
                <input
                    type="file"
                    onChange={(e) => {
                        if (!disabled && e.target.files && e.target.files.length > 0) {
                            onUploadClick();
                        }
                    }}
                    accept=".csv"
                    className="hidden"
                    disabled={disabled}
                />
            </label>

            {showGenerateTeams && onGenerateTeams && (
                <button 
                    onClick={onGenerateTeams}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftRight size={18} />
                    Generate Teams
                </button>
            )}
        </div>
    );
}