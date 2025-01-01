//sidebar.tsx
'use client';

import { type Teams, type Player } from '@/types/PlayerTypes';
import { ListChecks } from 'lucide-react';

interface TeamsViewProps {
    teams: Teams;
    hasPlayers: boolean;
    groupCode: string;
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

export default function TeamsView({ teams, hasPlayers, groupCode }: TeamsViewProps) {
    const TeamSection = ({ teamName, players, colorScheme }: TeamSectionProps) => {
        const { bg, text, card } = colorScheme;
        const allPlayers = [...players.forwards, ...players.defensemen];
        const totalSkill = allPlayers.reduce((sum, player) => sum + player.skill, 0);
        const averageSkill = allPlayers.length > 0
            ? (totalSkill / allPlayers.length).toFixed(2)
            : '0.00';

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

                    {/* Team Stats Section */}
                    <div className={`mt-4 ${card} rounded-lg p-4`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className={`text-sm font-medium ${text}`}>Total Skill</h4>
                                <p className={`text-lg font-semibold ${text}`}>{totalSkill}</p>
                            </div>
                            <div>
                                <h4 className={`text-sm font-medium ${text}`}>Average Skill</h4>
                                <p className={`text-lg font-semibold ${text}`}>{averageSkill}</p>
                            </div>
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-900">Team Rosters</h2>
                {groupCode !== 'default' && (
                    <span className="text-sm text-gray-500">
                        Group: {groupCode}
                    </span>
                )}
            </div>

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
                    <p className="mt-4 text-sm text-gray-500">
                        {hasPlayers
                            ? "Use the Generate Teams button in the Players tab to create teams."
                            : "Add players before generating teams."}
                    </p>
                </div>
            )}
        </div>
    );
}