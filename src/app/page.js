'use client';

import { useState } from 'react';
import { ArrowUpFromLine, ArrowLeftRight, Users, ListChecks } from 'lucide-react';
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

    const generateTeams = () => {
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
            if (index % 2 === 0) newTeams.red.forwards.push(player);
            else newTeams.white.forwards.push(player);
        });

        sortedDefensemen.forEach((player, index) => {
            if (index % 2 === 0) newTeams.red.defensemen.push(player);
            else newTeams.white.defensemen.push(player);
        });

        setTeams(newTeams);
        setActiveTab('roster');
    };

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Hockey Roster</h1>
                    <nav className="mt-6 space-y-2">
                        <button
                            onClick={() => setActiveTab('players')}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'players'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Users className="h-5 w-5" />
                            Players
                        </button>
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeTab === 'roster'
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <ListChecks className="h-5 w-5" />
                            Teams
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {activeTab === 'players' ? (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center border-b pb-4">
                                    <h2 className="text-xl font-semibold text-gray-900">Players</h2>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={generateTeams}
                                            disabled={loading || players.length === 0}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            <ArrowLeftRight className="h-5 w-5" />
                                            Generate Teams
                                        </button>
                                        <label className="cursor-pointer">
                                            <span className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600">
                                                <ArrowUpFromLine className="h-5 w-5" />
                                                Upload CSV
                                            </span>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {players.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Skill</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attending</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {players.map((player, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {player.first_name} {player.last_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {player.skill}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_defense
                                                                    ? 'bg-purple-100 text-purple-800'
                                                                    : 'bg-green-100 text-green-800'
                                                                }`}>
                                                                {player.is_defense ? 'Defense' : 'Forward'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_attending
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {player.is_attending ? 'Yes' : 'No'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No players</h3>
                                        <p className="mt-1 text-sm text-gray-500">Get started by uploading a CSV file.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">Team Rosters</h2>
                                {teams.red.forwards.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Red Team */}
                                        <div className="rounded-lg bg-red-50 p-6">
                                            <h3 className="text-lg font-medium text-red-900">Red Team</h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-red-900">Forwards</h4>
                                                    <div className="mt-2 space-y-2">
                                                        {teams.red.forwards.map((player, idx) => (
                                                            <div key={idx} className="rounded-md bg-red-100 px-3 py-2 text-sm">
                                                                <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                                <span className="ml-2 text-red-700">Skill: {player.skill}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-red-900">Defense</h4>
                                                    <div className="mt-2 space-y-2">
                                                        {teams.red.defensemen.map((player, idx) => (
                                                            <div key={idx} className="rounded-md bg-red-100 px-3 py-2 text-sm">
                                                                <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                                <span className="ml-2 text-red-700">Skill: {player.skill}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* White Team */}
                                        <div className="rounded-lg bg-gray-50 p-6">
                                            <h3 className="text-lg font-medium text-gray-900">White Team</h3>
                                            <div className="mt-4 space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Forwards</h4>
                                                    <div className="mt-2 space-y-2">
                                                        {teams.white.forwards.map((player, idx) => (
                                                            <div key={idx} className="rounded-md bg-gray-100 px-3 py-2 text-sm">
                                                                <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                                <span className="ml-2 text-gray-700">Skill: {player.skill}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">Defense</h4>
                                                    <div className="mt-2 space-y-2">
                                                        {teams.white.defensemen.map((player, idx) => (
                                                            <div key={idx} className="rounded-md bg-gray-100 px-3 py-2 text-sm">
                                                                <span className="font-medium">{player.first_name} {player.last_name}</span>
                                                                <span className="ml-2 text-gray-700">Skill: {player.skill}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                                        <button
                                            onClick={generateTeams}
                                            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 mx-auto"
                                            disabled={players.length === 0}
                                        >
                                            <ArrowLeftRight className="h-5 w-5" />
                                            Generate Teams
                                        </button>
                                        {players.length === 0 && (
                                            <p className="mt-4 text-sm text-red-500">Please add players before generating teams.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}