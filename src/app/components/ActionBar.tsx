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
        <div className="p-6 bg-slate-50/80 backdrop-blur-sm border-b">
            <div className="flex flex-wrap gap-4 justify-between">
                <div className="flex gap-3 flex-1 sm:flex-none">
                    <button
                        onClick={onAddPlayer}
                        disabled={disabled}
                        className="button-neo bg-gradient-to-b from-blue-500 to-blue-600 
                                 text-white hover:from-blue-600 hover:to-blue-700
                                 inline-flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Add Player
                    </button>

                    <button
                        onClick={handleUploadClick}
                        disabled={disabled}
                        className="button-neo bg-gradient-to-b from-indigo-500 to-indigo-600
                                 text-white hover:from-indigo-600 hover:to-indigo-700
                                 inline-flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Upload CSV
                    </button>
                </div>

                {showGenerateTeams && onGenerateTeams && (
                    <button
                        onClick={onGenerateTeams}
                        disabled={disabled}
                        className="button-neo bg-gradient-to-b from-purple-500 to-purple-600
                                 text-white hover:from-purple-600 hover:to-purple-700
                                 inline-flex items-center gap-2"
                    >
                        <ArrowLeftRight size={18} />
                        Generate Teams
                    </button>
                )}
            </div>
        </div>
    );
}