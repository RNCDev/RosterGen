// src/app/components/ActionBar.tsx

'use client';

import React from 'react';
import { Upload, UserPlus, ArrowLeftRight, Info } from 'lucide-react';

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

    const csvTemplate = `first_name,last_name,skill,defense,attending
John,Smith,3,0,1
Peter,Parker,5,1,1
Joe,Jones,1,1,0
Sam,Davis,2,0,0
Jeff,Smithers,2,1,0
Jane,Doe,1,1,1`; 

    return (
        <div className="px-6 py-4 border-b">
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

                    <div className="relative flex items-center gap-1">
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
                        <div className="group relative">
                            <button
                                className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                                aria-label="CSV template format"
                            >
                                <Info size={16} />
                            </button>
                            <div className="absolute top-full right-0 mt-2 hidden group-hover:block z-10">
                                <div className="card-neo p-3 whitespace-pre font-mono text-sm bg-white">
                                    {csvTemplate}
                                </div>
                            </div>
                        </div>
                    </div>
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