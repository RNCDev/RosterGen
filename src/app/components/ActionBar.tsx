// src/app/components/ActionBar.tsx
'use client';

import React from 'react';
import { Upload, UserPlus, ArrowLeftRight } from 'lucide-react';

interface ActionBarProps {
    onAddPlayer: () => void;
    onUploadClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
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
    const handleUploadClick = () => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        fileInput?.click();
    };

    return (
        <div className="flex flex-wrap gap-3 my-6 px-1">
            <div className="flex gap-3 flex-1 sm:flex-none">
                <button
                    onClick={onAddPlayer}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                             text-sm font-medium shadow-sm"
                >
                    <UserPlus size={18} />
                    Add Player
                </button>

                <button
                    onClick={handleUploadClick}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg 
                             hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                             text-sm font-medium shadow-sm"
                >
                    <Upload size={18} />
                    Upload CSV
                </button>
            </div>

            {showGenerateTeams && onGenerateTeams && (
                <button
                    onClick={onGenerateTeams}
                    disabled={disabled}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg 
                             hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                             text-sm font-medium shadow-sm ml-auto"
                >
                    <ArrowLeftRight size={18} />
                    Generate Teams
                </button>
            )}
        </div>
    );
}