"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, ArrowLeftRight, Users, ListChecks } from 'lucide-react';

export function RosterGenerator() {
    const [activeTab, setActiveTab] = useState("players");
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPlayers();
    }, []);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/players");
            if (!response.ok) throw new Error("Failed to fetch players");
            const data = await response.json();
            setPlayers(data);
        } catch (err) {
            setError("Failed to load players");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            await fetchPlayers();
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateRosters = async () => {
        setLoading(true);
        setError(null);
        try {
            const attendingPlayers = players.filter((p) => p.is_attending);
            const forwards = attendingPlayers.filter((p) => !p.is_defense);
            const defensemen = attendingPlayers.filter((p) => p.is_defense);

            const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
            const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

            const newTeams = {
                red: { forwards: [], defensemen: [] },
                white: { forwards: [], defensemen: [] },
            };

            sortedForwards.forEach((player, index) => {
                if (index % 2 === 0) newTeams.red.forwards.push(player);
                else newTeams.white.forwards.push(player);
            });

            sortedDefensemen.forEach((player, index) => {
                if (index % 2 === 0) newTeams.red.defensemen.push(player);
                else newTeams.white.defensemen.push(player);
            });

            setTeams(newTeams);
            setActiveTab("roster");
        } catch (err) {
            setError("Failed to generate teams");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Left Navigation */}
            <div className="w-64 h-full bg-white shadow-lg flex-shrink-0">
                <div className="p-6 space-y-6">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold text-gray-800">Hockey Roster</h1>
                    </div>
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab("players")}
                            className={`nav-item ${activeTab === "players" ? "nav-item-active" : "nav-item-inactive"
                                } flex items-center space-x-2`}
                        >
                            <Users size={20} />
                            <span>Players</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("roster")}
                            className={`nav-item ${activeTab === "roster" ? "nav-item-active" : "nav-item-inactive"
                                } flex items-center space-x-2`}
                        >
                            <ListChecks size={20} />
                            <span>Roster</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-card">
                        {activeTab === "players" ? (
                            <div className="space-y-6 p-6">
                                {/* Header with buttons */}
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-800">Player List</h2>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={generateRosters}
                                            disabled={loading || players.length === 0}
                                            className="button-primary"
                                        >
                                            <ArrowLeftRight size={20} />
                                            Generate Roster
                                        </button>

                                        <label className="cursor-pointer">
                                            <div className="button-primary">
                                                <ArrowUpFromLine size={20} />
                                                Upload CSV
                                                <input
                                                    type="file"
                                                    accept=".csv"
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Players Table */}
                                {players.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">First Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Last Name</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Skill</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Position</th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Attending</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {players.map((player) => (
                                                    <tr
                                                        key={player.id || `${player.first_name}-${player.last_name}`}
                                                        className="hover:bg-gray-50 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 text-sm text-gray-900">{player.first_name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{player.last_name}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{player.skill}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">{player.is_defense ? "Defense" : "Forward"}</td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_attending ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {player.is_attending ? "Yes" : "No"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500 text-lg">No players found. Upload a CSV to add players.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 p-6">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-4">Team Rosters</h2>
                                {teams.red.forwards.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Red Team */}
                                        <div className="team-card team-card-red">
                                            <h3 className="text-lg font-semibold text-red-700 mb-4">Red Team</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-red-600 mb-2">Forwards</h4>
                                                    {teams.red.forwards.map((player) => (
                                                        <div key={player.id} className="player-card player-card-red">
                                                            <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                            <span className="text-sm text-red-600">Skill: {player.skill}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-red-600 mb-2">Defense</h4>
                                                    {teams.red.defensemen.map((player) => (
                                                        <div key={player.id} className="player-card player-card-red">
                                                            <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                            <span className="text-sm text-red-600">Skill: {player.skill}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* White Team */}
                                        <div className="team-card team-card-white">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-4">White Team</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-600 mb-2">Forwards</h4>
                                                    {teams.white.forwards.map((player) => (
                                                        <div key={player.id} className="player-card player-card-white">
                                                            <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                            <span className="text-sm text-gray-600">Skill: {player.skill}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-600 mb-2">Defense</h4>
                                                    {teams.white.defensemen.map((player) => (
                                                        <div key={player.id} className="player-card player-card-white">
                                                            <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                            <span className="text-sm text-gray-600">Skill: {player.skill}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <ArrowLeftRight size={48} className="mx-auto text-gray-400 mb-4" />
                                        <button
                                            onClick={generateRosters}
                                            className="button-primary mx-auto"
                                            disabled={players.length === 0 || loading}
                                        >
                                            <ArrowLeftRight size={20} />
                                            Generate Teams
                                        </button>
                                        {players.length === 0 && (
                                            <p className="text-red-500 mt-4">Please add players before generating teams.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}