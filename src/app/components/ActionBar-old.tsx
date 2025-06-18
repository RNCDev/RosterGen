// src/app/components/ActionBar.tsx

'use client';

import React from 'react';
import { Upload, UserPlus, ArrowLeftRight, Info } from 'lucide-react';

interface ActionBarProps {
    onAddPlayer: () => void;
    onUploadCsv: () => void;
    onGenerateTeams?: () => void;
    showGenerateTeams?: boolean;
}

export default function ActionBar({
    onAddPlayer,
    onUploadCsv,
    onGenerateTeams,
    showGenerateTeams = true,
}: ActionBarProps) {
    const csvTemplate = `firstName,lastName,skill,is_defense,is_attending
John,Smith,8,false,true
Jane,Doe,7,true,true`;

    return (
        <div className="mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={onAddPlayer}
                        className="button-neo bg-gradient-to-b from-blue-500 to-blue-600 
                                 text-white hover:from-blue-600 hover:to-blue-700
                                 inline-flex items-center gap-2"
                    >
                        <UserPlus size={18} />
                        Add Player
                    </button>

                    <div className="relative flex items-center gap-1">
                        <button
                            onClick={onUploadCsv}
                            className="button-neo bg-gradient-to-b from-indigo-500 to-indigo-600
                                     text-white hover:from-indigo-600 hover:to-indigo-700
                                     inline-flex items-center gap-2"
                        >
                            <Upload size={18} />
                            Upload CSV
                        </button>
                        <div className="group relative">
                            <span
                                className="p-1 text-slate-500 hover:text-slate-700 transition-colors"
                                aria-label="CSV template format"
                            >
                                <Info size={16} />
                            </span>
                            <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-10 w-max">
                                <div className="card-neo p-4 whitespace-pre font-mono text-xs bg-white">
                                    <h4 className="font-bold text-sm mb-2">CSV Format</h4>
                                    <p className="mb-2">Required headers: `firstName`, `lastName`, `skill`.</p>
                                    <p className="font-semibold mb-1">Example:</p>
                                    {csvTemplate}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showGenerateTeams && onGenerateTeams && (
                    <button
                        onClick={onGenerateTeams}
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