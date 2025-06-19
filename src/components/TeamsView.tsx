'use client';

import React, { useRef } from 'react';
import { type Teams, type Player } from '@/types/PlayerTypes';
import { Clipboard, Users, BarChart2, Hash, Trophy, Zap, Shield, Target, RefreshCw } from 'lucide-react';
import _ from 'lodash';
import { Button } from '@/components/ui/Button';

interface TeamsViewProps {
    teams: Teams;
    teamNames: { team1: string; team2: string };
    setTeamNames: (names: { team1: string; team2: string }) => void;
    onGenerateTeams: () => void;
    attendingPlayerCount: number;
}

// Helper to calculate team stats
const calculateStats = (team: Teams['red']) => {
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
                            <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
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

export default function TeamsView({ teams, teamNames, setTeamNames, onGenerateTeams, attendingPlayerCount }: TeamsViewProps) {
    const teamsContainerRef = useRef<HTMLDivElement>(null);

    const handleCopyToClipboard = () => {
        if (teamsContainerRef.current) {
            const textToCopy = teamsContainerRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Could add a toast notification here
                alert('Teams copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy teams: ', err);
                alert('Failed to copy teams.');
            });
        }
    };
    
    const totalPlayers = teams.red.forwards.length + teams.red.defensemen.length + teams.white.forwards.length + teams.white.defensemen.length;
    const redStats = calculateStats(teams.red);
    const whiteStats = calculateStats(teams.white);
    const skillDifference = Math.abs(redStats.totalSkill - whiteStats.totalSkill);

    if (totalPlayers === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center p-12 card-elevated max-w-lg animate-slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="heading-secondary mb-3">No Teams Generated</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Go to the <span className="font-semibold text-blue-600">Players</span> tab and click 'Generate Teams' to create balanced teams.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Trophy className="w-4 h-4" />
                        <span>Teams will appear here once generated</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Stats - De-emphasized */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-md flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Total Players</p>
                            <p className="text-lg font-bold text-gray-900">{totalPlayers}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-green-100 rounded-md flex items-center justify-center">
                            <BarChart2 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Skill Difference</p>
                            <p className="text-lg font-bold text-gray-900">{skillDifference}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-md flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">Balance Score</p>
                            <p className="text-lg font-bold text-gray-900">
                                {skillDifference <= 2 ? 'Excellent' : skillDifference <= 5 ? 'Good' : 'Fair'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Generated Teams</h2>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={onGenerateTeams} 
                        disabled={attendingPlayerCount < 2}
                        className="btn-primary"
                    >
                        <RefreshCw size={16} className="mr-2" /> 
                        Regenerate Teams
                    </Button>
                    <Button onClick={handleCopyToClipboard} variant="outline" className="btn-secondary">
                        <Clipboard size={16} className="mr-2" /> 
                        Copy to Clipboard
                    </Button>
                </div>
            </div>
            
            {/* Teams Grid */}
            <div ref={teamsContainerRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TeamCard
                    name={teamNames.team1}
                    team={teams.red}
                    onNameChange={(name) => setTeamNames({ ...teamNames, team1: name })}
                    teamColor="red"
                />
                <TeamCard
                    name={teamNames.team2}
                    team={teams.white}
                    onNameChange={(name) => setTeamNames({ ...teamNames, team2: name })}
                    teamColor="blue"
                />
            </div>
        </div>
    );
} 