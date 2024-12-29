'use client';

import { type Teams, type Player } from '@/types/PlayerTypes';
import { ListChecks, ArrowLeftRight } from 'lucide-react';

interface TeamsViewProps {
    teams: Teams;
    generateTeams: () => void;
    hasPlayers: boolean;
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
    };
}

export default function TeamsView({ teams, generateTeams, hasPlayers }: TeamsViewProps) {
    const TeamSection = ({ teamName, players, colorScheme }: TeamSectionProps) => {
        const { bg, text, card } = colorScheme;

        return (
            <div className={`rounded-lg ${bg} p-6`}>
                <h3 className={`text-lg font-medium ${text}`}>{teamName} Team</h3>
                <div className="mt-4 space-y-4">
                    {/* Forwards Section */}
                    <div>
                        <h4 className={`font-medium ${text}`}>Forwards</h4>
                        <div className="mt-2 space-y-2">
                            {players.forwards.map((player, idx) => (
                                <div key={idx} className={`rounded-md ${card} px-3 py-2 text-sm`}>
                                    <span className="font-medium">{player.first_name} {player.last_name}</span>
                                    <span className={`ml-2 ${text}`}>Skill: {player.skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Defense Section */}
                    <div>
                        <h4 className={`font-medium ${text}`}>Defense</h4>
                        <div className="mt-2 space-y-2">
                            {players.defensemen.map((player, idx) => (
                                <div key={idx} className={`rounded-md ${card} px-3 py-2 text-sm`}>
                                    <span className="font-medium">{player.first_name} {player.last_name}</span>
                                    <span className={`ml-2 ${text}`}>Skill: {player.skill}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const colorSchemes = {
        red: {
            bg: 'bg-red-50',
            text: 'text-red-900',
            card: 'bg-red-100'
        },
        white: {
            bg: 'bg-gray-50',
            text: 'text-gray-900',
            card: 'bg-gray-100'
        }
    };

    const getTotalSkill = (players: Player[]) => {
        return players.reduce((total, player) => total + player.skill, 0);
    };

    const redTeamTotalSkill = getTotalSkill([...teams.red.forwards, ...teams.red.defensemen]);
    const whiteTeamTotalSkill = getTotalSkill([...teams.white.forwards, ...teams.white.defensemen]);
    const totalPlayers = teams.red.forwards.length + teams.red.defensemen.length + teams.white.forwards.length + teams.white.defensemen.length;
    const averageSkill = totalPlayers > 0 ? (redTeamTotalSkill + whiteTeamTotalSkill) / totalPlayers : 0;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Team Rosters</h2>

            {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Red Team */}
                    <TeamSection
                        teamName="Red"
                        players={teams.red}
                        colorScheme={colorSchemes.red}
                    />

                    {/* White Team */}
                    <TeamSection
                        teamName="White"
                        players={teams.white}
                        colorScheme={colorSchemes.white}
                    />
                </div>
            ) : (
                <div className="text-center py-12">
                    <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                    <button
                        onClick={generateTeams}
                        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 mx-auto"
                        disabled={!hasPlayers}
                    >
                        <ArrowLeftRight className="h-5 w-5" />
                        Generate Teams
                    </button>
                    {!hasPlayers && (
                        <p className="mt-4 text-sm text-red-500">Please add players before generating teams.</p>
                    )}
                </div>
            )}

            {/* Team summary footer */}
            <div className="bg-gray-50 rounded-lg p-4 flex justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Red Team Total Skill:</h3>
                    <p className="text-gray-700">{redTeamTotalSkill}</p>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">White Team Total Skill:</h3>
                    <p className="text-gray-700">{whiteTeamTotalSkill}</p>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Average Player Skill:</h3>
                    <p className="text-gray-700">{averageSkill.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}