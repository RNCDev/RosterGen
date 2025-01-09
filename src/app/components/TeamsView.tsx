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
        header: string;
        footer: string;
        badge: string;
    };
    stats: TeamStats;
}

const Statistic = ({ label, value }: { label: string, value: number }) => (
    <div className="card-neo p-4">
        <div className="text-sm text-slate-600">{label}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
    </div>
);

export default function TeamsView({ teams, hasPlayers, groupCode, onRegenerateTeams }: TeamsViewProps) {
    const TeamSection = ({ teamName, players, colorScheme, stats }: TeamSectionProps) => {
        const PlayerList = ({ players, type }: { players: Player[], type: 'forwards' | 'defensemen' }) => (
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    {type === 'forwards' ? 'Forwards' : 'Defense'}
                </h4>
                <div className="space-y-2">
                    {players.map((player) => (
                        <div 
                            key={player.id} 
                            className="card-neo p-3 flex items-center justify-between
                                     hover:shadow-[8px_8px_16px_#e2e8f0,-8px_-8px_16px_#ffffff]
                                     transition-all duration-200"
                        >
                            <div className="flex items-center gap-3">
                                {type === 'forwards' ? (
                                    <User className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <Shield className="h-4 w-4 text-slate-400" />
                                )}
                                <span className="text-sm font-medium text-slate-700">
                                    {player.first_name} {player.last_name}
                                </span>
                            </div>
                            <span className={`badge-neo ${colorScheme.badge}`}>
                                {player.skill}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );

        return (
            <div className="card-neo overflow-hidden">
                <div className={`p-4 ${colorScheme.header}`}>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">{teamName} Team</h3>
                        <span className="badge-neo bg-white/90 text-slate-700">
                            Avg Skill: {stats.averageSkill}
                        </span>
                    </div>
                </div>
                <div className="p-6 space-y-6 bg-gradient-to-b from-white to-slate-50">
                    <PlayerList players={players.forwards} type="forwards" />
                    <PlayerList players={players.defensemen} type="defensemen" />
                </div>
                <div className={`p-4 ${colorScheme.footer} border-t border-slate-100`}>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Statistic label="Forward" value={stats.forwardCount} />
                        <Statistic label="Defense" value={stats.defenseCount} />
                        <Statistic label="Total Players" value={stats.totalPlayers} />
                        <Statistic label="Total Skill" value={stats.totalSkill} />
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
            header: 'bg-gradient-to-r from-red-50 to-red-100 text-red-700',
            footer: 'bg-gradient-to-r from-red-50 to-red-100',
            badge: 'bg-red-100 text-red-700'
        },
        white: {
            header: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700',
            footer: 'bg-gradient-to-r from-blue-50 to-blue-100',
            badge: 'bg-blue-100 text-blue-700'
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-slate-900">Generated Teams</h2>
                    <button 
                        onClick={onRegenerateTeams}
                        disabled={!hasPlayers}
                        className="button-neo text-slate-600"
                    >
                        Regenerate
                    </button>
                </div>
                {groupCode && (
                    <div className="card-neo px-4 py-1.5">
                        <span className="text-sm font-medium text-blue-600">
                            Group: {groupCode}
                        </span>
                    </div>
                )}
            </div>

            {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                <div className="card-neo p-12 flex flex-col items-center">
                    <ListChecks className="h-12 w-12 text-slate-400 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No Teams Generated</h3>
                    <p className="mt-1 text-sm text-slate-500">
                        {hasPlayers
                            ? "Use the Generate Teams button in the Players tab to create teams."
                            : "Add players before generating teams."}
                    </p>
                </div>
            )}
        </div>
    );
}