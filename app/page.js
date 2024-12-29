'use client';

import { useState } from 'react';
import { ArrowUpFromLine, ArrowLeftRight, Users } from 'lucide-react';
import Papa from 'papaparse';

export default function Home() {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('players');
    const [teams, setTeams] = useState({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const formattedPlayers = results.data.map(player => ({
                        first_name: player.firstName,
                        last_name: player.lastName,
                        skill: parseInt(player.skill),
                        is_defense: player.defense === '1',
                        is_attending: player.attending === '1'
                    }));
                    setPlayers(formattedPlayers);
                    setLoading(false);
                } catch (err) {
                    setError('Error processing file');
                    setLoading(false);
                }
            },
            error: () => {
                setError('Error parsing file');
                setLoading(false);
            }
        });
    };

    const generateRosters = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const forwards = attendingPlayers.filter(p => !p.is_defense);
        const defensemen = attendingPlayers.filter(p => p.is_defense);

        const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
        const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

        const newTeams = {
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] }
        };

        sortedForwards.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.forwards.push(player);
            } else {
                newTeams.white.forwards.push(player);
            }
        });

        sortedDefensemen.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.defensemen.push(player);
            } else {
                newTeams.white.defensemen.push(player);
            }
        });

        setTeams(newTeams);
        setActiveTab('roster');
    };

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 min-h-screen bg-white shadow-lg">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-gray-800 mb-8">Hockey Roster</h1>
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('players')}
                            className={`w-full px-4 py-2 text-left rounded transition-colors flex items-center space-x-2 ${activeTab === 'players'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <Users size={20} />
                            <span>Players</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`w-full px-4 py-2 text-left rounded transition-colors flex items-center space-x-2 ${activeTab === 'roster'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ArrowLeftRight size={20} />
                            <span>Roster</span>
                        </button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8 bg-gray-50">
                <div className="max-w-5xl mx-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {activeTab === 'players' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h2 className="text-xl font-semibold">Player List</h2>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={generateRosters}
                                            disabled={loading || players.length === 0}
                                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
                                        >
                                            <ArrowLeftRight size={20} />
                                            <span>Generate Teams</span>
                                        </button>
                                        <label className="cursor-pointer">
                                            <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center space-x-2">
                                                <ArrowUpFromLine size={20} />
                                                <span>Upload CSV</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Players Table */}
                                {players.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Name</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Skill</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Position</th>
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Attending</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {players.map((player, idx) => (
                                                    <tr key={idx} className="border-t border-gray-100">
                                                        <td className="px-4 py-2">{player.first_name} {player.last_name}</td>
                                                        <td className="px-4 py-2">{player.skill}</td>
                                                        <td className="px-4 py-2">{player.is_defense ? 'Defense' : 'Forward'}</td>
                                                        <td className="px-4 py-2">{player.is_attending ? 'Yes' : 'No'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        No players uploaded yet. Use the CSV upload button to add players.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Roster Content */}
                                <h2 className="text-xl font-semibold border-b pb-4">Team Rosters</h2>
                                {teams.red.forwards.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Red Team */}
                                        <div className="bg-red-50 p-6 rounded-lg">
                                            <h3 className="text-lg font-semibold text-red-700 mb-4">Red Team</h3>
                                            <div>
                                                <h4 className="font-medium mb-2">Forwards</h4>
                                                {teams.red.forwards.map((player, idx) => (
                                                    <div key={idx} className="bg-red-100 p-2 rounded mb-2">
                                                        {player.first_name} {player.last_name} (Skill: {player.skill})
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-2">Defense</h4>
                                                {teams.red.defensemen.map((player, idx) => (
                                                    <div key={idx} className="bg-red-100 p-2 rounded mb-2">
                                                        {player.first_name} {player.last_name} (Skill: {player.skill})
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* White Team */}
                                        <div className="bg-gray-50 p-6 rounded-lg">
                                            <h3 className="text-lg font-semibold text-gray-700 mb-4">White Team</h3>
                                            <div>
                                                <h4 className="font-medium mb-2">Forwards</h4>
                                                {teams.white.forwards.map((player, idx) => (
                                                    <div key={idx} className="bg-gray-100 p-2 rounded mb-2">
                                                        {player.first_name} {player.last_name} (Skill: {player.skill})
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4">
                                                <h4 className="font-medium mb-2">Defense</h4>
                                                {teams.white.defensemen.map((player, idx) => (
                                                    <div key={idx} className="bg-gray-100 p-2 rounded mb-2">
                                                        {player.first_name} {player.last_name} (Skill: {player.skill})
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <button
                                            onClick={generateRosters}
                                            disabled={players.length === 0}
                                            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                                        >
                                            Generate Teams
                                        </button>
                                        {players.length === 0 && (
                                            <p className="mt-4 text-red-500">Please add players first</p>
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