'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Search, Save, X, Trash2, ShieldCheck, UserPlus, Upload, ArrowLeftRight, Pencil } from 'lucide-react';

interface ActionHeaderProps {
    activeTab: 'players' | 'teams';
    // Group props
    groupCode: string;
    onGroupCodeChange: (code: string) => void;
    onLoadGroup: () => void;
    onSaveGroup: () => void;
    onClearGroup: () => void;
    onDeleteGroup: () => void;
    isDirty: boolean;
    isLoading: boolean;
    // Player view props
    isBulkEditing?: boolean;
    onToggleBulkEdit?: () => void;
    onAddPlayer?: () => void;
    onUploadCsv?: () => void;
    // Both views
    onGenerateTeams: () => void;
    playerCount: number;
    totalPlayerCount: number;
}

export default function ActionHeader({
    activeTab,
    groupCode,
    onGroupCodeChange,
    onLoadGroup,
    onSaveGroup,
    onClearGroup,
    onDeleteGroup,
    isDirty,
    isLoading,
    isBulkEditing,
    onToggleBulkEdit,
    onAddPlayer,
    onUploadCsv,
    onGenerateTeams,
    playerCount,
    totalPlayerCount,
}: ActionHeaderProps) {

    const handleLoadWithPrompt = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to load a new group? Your current changes will be lost.')) {
            return;
        }
        onLoadGroup();
    };
    
    const handleClearWithPrompt = () => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to clear the workspace?')) {
            return;
        }
        onClearGroup();
    };

    const handleDeleteWithPrompt = () => {
        if (!window.confirm(`Are you sure you want to permanently delete the group "${groupCode}"? This action cannot be undone.`)) {
            return;
        }
        onDeleteGroup();
    };
    
    const attendingPlayerCount = playerCount; // This will be adjusted later

    const isGroupActive = groupCode.trim().length > 0;

    return (
        <div className="bg-slate-100 border-b border-slate-200 sticky top-[69px] z-30">
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    
                    {/* Left side: Contextual Actions */}
                    <div className="flex items-center gap-2">
                        {activeTab === 'players' && onAddPlayer && onUploadCsv && onToggleBulkEdit && (
                            <>
                                <Button variant="outline" onClick={onAddPlayer} disabled={!isGroupActive}>
                                    <UserPlus size={16} className="mr-2"/> Add Player
                                </Button>
                                <Button variant="outline" onClick={onUploadCsv} disabled={!isGroupActive}>
                                    <Upload size={16} className="mr-2"/> Upload CSV
                                </Button>
                                <Button variant="outline" onClick={onToggleBulkEdit} disabled={totalPlayerCount === 0}>
                                    <Pencil size={16} className="mr-2"/> {isBulkEditing ? 'Finish Editing' : 'Bulk Edit'}
                                </Button>
                            </>
                        )}
                    </div>
                    
                    {/* Right side: Primary Actions & Group Management */}
                    <div className="flex items-center gap-2">
                        <Button 
                            onClick={onGenerateTeams} 
                            disabled={attendingPlayerCount < 2 || isBulkEditing}
                            variant="default"
                        >
                            <ArrowLeftRight size={16} className="mr-2" />
                            {activeTab === 'teams' ? 'Regenerate' : 'Generate Teams'}
                        </Button>
                        <div className="flex items-center gap-1 rounded-md shadow-inner bg-slate-200 p-1">
                             <input
                                type="text"
                                value={groupCode}
                                onChange={(e) => onGroupCodeChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLoadWithPrompt()}
                                placeholder="Group Code"
                                className="input-neo flex-grow sm:w-40 bg-transparent focus:outline-none px-2 text-sm"
                                aria-label="Group Code"
                            />
                            <Button variant="ghost" size="icon" onClick={handleLoadWithPrompt} disabled={!groupCode.trim() || isLoading} title="Load Group">
                                <Search size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={onSaveGroup} disabled={!groupCode.trim() || !isDirty || isLoading} title="Save Changes">
                                {isDirty ? <Save size={18} className="text-green-500 animate-pulse" /> : <ShieldCheck size={18} />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleClearWithPrompt} title="Clear Workspace">
                                <X size={18} />
                            </Button>
                             <Button variant="ghost" size="icon" onClick={handleDeleteWithPrompt} disabled={!groupCode.trim() || isLoading} title="Delete Group">
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
} 