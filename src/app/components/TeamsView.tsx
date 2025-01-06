// TeamsView.tsx
'use client';

import { type Teams, type Player } from '@/types/PlayerTypes';
import { ListChecks, User, Shield } from 'lucide-react';
import { Button } from './button';

interface TeamsViewProps {
    teams: Teams;
    hasPlayers: boolean;
    groupCode: string;
    onRegenerateTeams?: () => void;
}

interface TeamStats {
    forwardCount: number;
    defenseCount: number;
    totalPlayers: number;
    totalSkill: number;
    averageSkill: string;
}

interface TeamSectionProps {
    teamName: string;
    players: {
        forwards: Player[];
        defensemen: Player[];
    };
    colorScheme: {
        bg: string;
        text: string;
        card: string;
        border: string;
    };
    stats: TeamStats;
}

export default function TeamsView({ teams, hasPlayers, groupCode, onRegenerateTeams }: TeamsViewProps) {
    const TeamSection = ({ teamName, players, colorScheme, stats }: TeamSectionProps) => {
        const { bg, text, card, border } = colorScheme;

        const PlayerList = ({ players, type }: { players: Player[], type: 'forwards' | 'defensemen' }) => (
            <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {type === 'forwards' ? 'Forwards' : 'Defense'}
                </h4>
                <div className="space-y-1">
                    {players.map((player) => (
                        <div 
                            key={player.id} 
                            className={`flex items-center justify-between p-2 rounded-lg ${card} border ${border} transition-colors`}
                        >
                            <div className="flex items-center gap-2">
                                {type === 'forwards' ? (
                                    <User className="h-4 w-4 text-gray-400" />
                                ) : (
                                    <Shield className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-sm font-medium">
                                    {player.first_name} {player.last_name}
                                </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
                                {player.skill}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className={`px-4 py-3 ${bg} ${text} border-b ${border}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{teamName} Team</h3>
                        <span className="text-sm">
                            Avg Skill: {stats.averageSkill}
                        </span>
                    </div>
                </div>
                <div className="p-4 space-y-6">
                    <PlayerList players={players.forwards} type="forwards" />
                    <PlayerList players={players.defensemen} type="defensemen" />
                </div>
                <div className={`px-4 py-3 ${bg} border-t ${border}`}>
                    <div className="grid grid-cols-4 gap-4 text-xs">
                        <div>
                            <span className="block text-gray-500">Forwards</span>
                            <span className={`font-medium ${text}`}>{stats.forwardCount}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Defense</span>
                            <span className={`font-medium ${text}`}>{stats.defenseCount}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Total Players</span>
                            <span className={`font-medium ${text}`}>{stats.totalPlayers}</span>
                        </div>
                        <div>
                            <span className="block text-gray-500">Total Skill</span>
                            <span className={`font-medium ${text}`}>{stats.totalSkill}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const calculateTeamStats = (players: { forwards: Player[], defensemen: Player[] }): TeamStats => {
        const allPlayers = [...players.forwards, ...players.defensemen];
        const totalSkill = allPlayers.reduce((sum, player) => sum + player.skill, 0);
        return {
            forwardCount: players.forwards.length,
            defenseCount: players.defensemen.length,
            totalPlayers: allPlayers.length,
            totalSkill: totalSkill,
            averageSkill: allPlayers.length > 0 
                ? (totalSkill / allPlayers.length).toFixed(2)
                : '0'
        };
    };

    const colorSchemes = {
        red: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            card: 'hover:bg-red-50/50',
            border: 'border-red-100'
        },
        white: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            card: 'hover:bg-blue-50/50',
            border: 'border-blue-100'
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-900">Generated Teams</h2>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={onRegenerateTeams}
                        disabled={!hasPlayers}
                    >
                        Regenerate
                    </Button>
                </div>
                {groupCode && (
                    <span className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                        Group: {groupCode}
                    </span>
                )}
            </div>

            {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TeamSection
                        teamName="Red"
                        players={teams.red}
                        colorScheme={colorSchemes.red}
                        stats={calculateTeamStats(teams.red)}
                    />
                    <TeamSection
                        teamName="White"
                        players={teams.white}
                        colorScheme={colorSchemes.white}
                        stats={calculateTeamStats(teams.white)}
                    />
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Teams Generated</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {hasPlayers
                            ? "Use the Generate Teams button in the Players tab to create teams."
                            : "Add players before generating teams."}
                    </p>
                </div>
            )}
        </div>
    );
}