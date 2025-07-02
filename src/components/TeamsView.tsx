'use client';

import React, { useRef } from 'react';
import { type Teams, type Player, type Team } from '@/types/PlayerTypes';
import { Clipboard, Users, BarChart2, Hash, Trophy, Zap, Shield, Target, RefreshCw } from 'lucide-react';
import _ from 'lodash';
import { Button } from '@/components/ui/Button';
import { toBlob } from 'html-to-image';

interface TeamsViewProps {
    teams: Teams;
    teamNames: { team1: string; team2: string };
    setTeamNames: (names: { team1: string; team2: string }) => void;
    onGenerateTeams: () => void;
    attendingPlayerCount: number;
    isGenerating: boolean;
    onBack: () => void;
    onSaveTeamNames: (alias1: string, alias2: string) => Promise<void>;
}

// Helper to calculate team stats
const calculateStats = (team: Team) => {
    const allPlayers = [...team.forwards, ...team.defensemen];
    if (allPlayers.length === 0) {
        return {
            totalPlayers: 0,
            averageSkill: 0,
            totalSkill: 0,
        };
    }
    return {
        totalPlayers: allPlayers.length,
        averageSkill: _.round(_.meanBy(allPlayers, 'skill'), 1),
        totalSkill: _.sumBy(allPlayers, 'skill'),
    };
};

// Internal component for displaying a single team
const TeamCard = ({ 
    name, 
    team, 
    onNameChange, 
    teamColor 
}: { 
    name: string; 
    team: Teams['red']; 
    onNameChange: (newName: string) => void;
    teamColor: 'red' | 'blue';
}) => {
    const stats = calculateStats(team);
    
    const colorClasses = {
        red: {
            gradient: 'from-red-500 to-rose-600',
            bgGradient: 'from-red-50 to-rose-50',
            border: 'border-red-200/30',
            accent: 'text-red-600',
            headerBg: 'bg-red-100',
            forwardBg: 'bg-orange-50',
            defenseBg: 'bg-purple-50'
        },
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200/30',
            accent: 'text-blue-600',
            headerBg: 'bg-blue-100',
            forwardBg: 'bg-orange-50',
            defenseBg: 'bg-purple-50'
        }
    };
    
    const colors = colorClasses[teamColor];
    
    return (
        <div className={`bg-white/70 backdrop-blur-sm rounded-lg border-2 ${colors.border} overflow-hidden`}>
            {/* Compact Team Header */}
            <div className={`${colors.headerBg} px-4 py-3 border-b ${colors.border}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            onBlur={() => onNameChange(name)}
                            className={`text-lg font-bold bg-transparent border-b border-transparent focus:border-gray-400 outline-none ${colors.accent}`}
                            placeholder="Team Name"
                        />
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-bold text-gray-700">
                            {team.forwards.length}F {team.defensemen.length}D
                        </div>
                        <div className="text-xs text-gray-500">Avg: {stats.averageSkill.toFixed(1)}</div>
                    </div>
                </div>
            </div>
            
            {/* Compact Player Lists */}
            <div className="p-3 space-y-3">
                {/* Forwards - Compact List */}
                {team.forwards.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                                Forwards ({team.forwards.length})
                            </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {team.forwards.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-2 py-1 bg-orange-50/70 rounded text-xs">
                                    <span className="font-medium text-gray-800 truncate">{p.first_name} {p.last_name}</span>
                                    <span className="bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                                        {p.skill}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Defense - Compact List */}
                {team.defensemen.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                                Defense ({team.defensemen.length})
                            </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {team.defensemen.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-2 py-1 bg-purple-50/70 rounded text-xs">
                                    <span className="font-medium text-gray-800 truncate">{p.first_name} {p.last_name}</span>
                                    <span className="bg-purple-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
                                        {p.skill}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Empty State */}
                {team.forwards.length === 0 && team.defensemen.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">No players assigned</div>
                )}
            </div>
        </div>
    );
};

export default function TeamsView({ teams, teamNames, setTeamNames, onGenerateTeams, attendingPlayerCount, isGenerating, onBack, onSaveTeamNames }: TeamsViewProps) {
    const teamsContainerRef = useRef<HTMLDivElement>(null);

    const handleCopyToClipboard = () => {
        if (teamsContainerRef.current === null) {
            return;
        }

        toBlob(teamsContainerRef.current, { cacheBust: true })
            .then((blob) => {
                if (blob) {
                    navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]).then(() => {
                        alert('Teams image copied to clipboard!');
                    }).catch(err => {
                        console.error('Failed to copy image: ', err);
                        alert('Failed to copy image to clipboard.');
                    });
                }
            })
            .catch((err) => {
                console.error('Failed to convert HTML to image: ', err);
                alert('Failed to create image of teams.');
            });
    };
    
    // Access teams using dynamic keys from teamNames
    const team1Data = teams[teamNames.team1.toLowerCase()];
    const team2Data = teams[teamNames.team2.toLowerCase()];

    // Ensure team data exists before calculating stats or rendering
    if (!team1Data || !team2Data) {
        // This case should ideally not happen if teams are always generated correctly,
        // but provides a safe fallback for rendering or initial state.
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center p-12 card-elevated max-w-lg animate-slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="heading-secondary mb-3">Generating Teams...</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Please wait while teams are generated based on attendance.
                    </p>
                </div>
            </div>
        );
    }

    const totalPlayers = team1Data.forwards.length + team1Data.defensemen.length + team2Data.forwards.length + team2Data.defensemen.length;
    const team1Stats = calculateStats(team1Data);
    const team2Stats = calculateStats(team2Data);
    const skillDifference = Math.abs(team1Stats.totalSkill - team2Stats.totalSkill);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span><strong className="text-gray-800">{totalPlayers}</strong> Players</span>
                    <span className="h-4 w-px bg-gray-300"></span>
                    <span>Skill Diff: <strong className="text-gray-800">{skillDifference}</strong></span>
                    <span className="h-4 w-px bg-gray-300"></span>
                     <span>Balance: <strong className="text-gray-800">{skillDifference <= 2 ? 'Excellent' : skillDifference <= 5 ? 'Good' : 'Fair'}</strong></span>
                </div>
                <Button variant="outline" onClick={onBack}>
                    Back to Attendance
                </Button>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2">
                <Button onClick={onGenerateTeams} disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Regenerate Teams'}
                </Button>
                <Button variant="outline" onClick={handleCopyToClipboard}>
                    <Clipboard className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                </Button>
            </div>

            {/* Teams Grid */}
            <div ref={teamsContainerRef} className="grid md:grid-cols-2 gap-4 items-start">
                <TeamCard
                    name={teamNames.team1}
                    team={team1Data}
                    onNameChange={(name) => {
                        setTeamNames({ ...teamNames, team1: name });
                        onSaveTeamNames(name, teamNames.team2);
                    }}
                    teamColor="red"
                />
                <TeamCard
                    name={teamNames.team2}
                    team={team2Data}
                    onNameChange={(name) => {
                        setTeamNames({ ...teamNames, team2: name });
                        onSaveTeamNames(teamNames.team1, name);
                    }}
                    teamColor="blue"
                />
            </div>
        </div>
    );
} 