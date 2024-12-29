"use client";

import { ArrowLeftRight, Users } from "lucide-react";

export const RosterTab = ({ teams, generateRosters, players, loading }) => {
    const hasTeams =
        teams &&
        teams.red &&
        teams.red.forwards &&
        teams.red.forwards.length > 0 &&
        teams.white &&
        teams.white.forwards &&
        teams.white.forwards.length > 0;

    const calculateTeamStats = (team) => {
        const totalPlayers = team.forwards.length + team.defensemen.length;
        const avgSkill =
            (team.forwards.reduce((sum, p) => sum + p.skill, 0) +
                team.defensemen.reduce((sum, p) => sum + p.skill, 0)) /
            totalPlayers;
        return {
            totalPlayers,
            avgSkill: avgSkill.toFixed(1),
            forwardCount: team.forwards.length,
            defenseCount: team.defensemen.length,
        };
    };

    const renderPlayerList = (players, teamColor) => {
        const textColorClass = teamColor === "red" ? "text-red-600" : "text-gray-600";
        return players.map((player) => (
            <div
                key={player.id}
                className={`player-card ${teamColor === "red" ? "player-card-red" : "player-card-white"
                    }`}
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                        <span className="font-medium">
                            {player.first_name} {player.last_name}
                        </span>
                        <span className={`text-sm ${textColorClass}`}>
                            Skill Level: {player.skill}
                        </span>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Team Rosters</h2>
                <button
                    onClick={generateRosters}
                    disabled={players.length === 0 || loading}
                    className="button-primary"
                >
                    <ArrowLeftRight size={20} />
                    <span>{loading ? "Generating..." : "Generate Teams"}</span>
                </button>
            </div>

            {hasTeams ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Red Team */}
                    <div className="team-card team-card-red">
                        <div className="border-b border-red-200 pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-red-700">Red Team</h3>
                            {teams.red && (
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div className="text-sm text-red-600">
                                        <span className="block">
                                            Players: {calculateTeamStats(teams.red).totalPlayers}
                                        </span>
                                        <span className="block">
                                            Avg Skill: {calculateTeamStats(teams.red).avgSkill}
                                        </span>
                                    </div>
                                    <div className="text-sm text-red-600">
                                        <span className="block">
                                            Forwards: {calculateTeamStats(teams.red).forwardCount}
                                        </span>
                                        <span className="block">
                                            Defense: {calculateTeamStats(teams.red).defenseCount}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Forwards Section */}
                            <div>
                                <h4 className="font-medium text-red-600 mb-2">Forwards</h4>
                                <div className="space-y-2">
                                    {renderPlayerList(teams.red.forwards, "red")}
                                </div>
                            </div>

                            {/* Defense Section */}
                            <div>
                                <h4 className="font-medium text-red-600 mb-2">Defense</h4>
                                <div className="space-y-2">
                                    {renderPlayerList(teams.red.defensemen, "red")}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* White Team */}
                    <div className="team-card team-card-white">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">White Team</h3>
                            {teams.white && (
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div className="text-sm text-gray-600">
                                        <span className="block">
                                            Players: {calculateTeamStats(teams.white).totalPlayers}
                                        </span>
                                        <span className="block">
                                            Avg Skill: {calculateTeamStats(teams.white).avgSkill}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="block">
                                            Forwards: {calculateTeamStats(teams.white).forwardCount}
                                        </span>
                                        <span className="block">
                                            Defense: {calculateTeamStats(teams.white).defenseCount}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Forwards Section */}
                            <div>
                                <h4 className="font-medium text-gray-600 mb-2">Forwards</h4>
                                <div className="space-y-2">
                                    {renderPlayerList(teams.white.forwards, "white")}
                                </div>
                            </div>

                            {/* Defense Section */}
                            <div>
                                <h4 className="font-medium text-gray-600 mb-2">Defense</h4>
                                <div className="space-y-2">
                                    {renderPlayerList(teams.white.defensemen, "white")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-card">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <div className="space-y-3">
                        <p className="text-gray-500 text-lg">No teams generated yet.</p>
                        <button
                            onClick={generateRosters}
                            className="button-primary mx-auto"
                            disabled={players.length === 0 || loading}
                        >
                            <ArrowLeftRight size={20} />
                            <span>{loading ? "Generating..." : "Generate Teams"}</span>
                        </button>
                        {players.length === 0 && (
                            <p className="text-red-500 text-sm">
                                Please add players before generating teams.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};