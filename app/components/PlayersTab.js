"use client";

import React from "react";
import Papa from "papaparse";
import { ArrowUpFromLine, Users, AlertCircle } from "lucide-react";

export const PlayersTab = ({
    players,
    setPlayers,
    loading,
    setLoading,
    error,
    setError,
    fetchPlayers,
}) => {
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const requiredFields = [
                        "firstName",
                        "lastName",
                        "skill",
                        "defense",
                        "attending",
                    ];
                    const missingFields = requiredFields.filter(
                        (field) => !results.meta.fields.includes(field)
                    );

                    if (missingFields.length > 0) {
                        throw new Error(
                            `Missing required fields: ${missingFields.join(", ")}`
                        );
                    }

                    const uploadPromises = results.data.map(async (playerData) => {
                        const player = {
                            first_name: playerData.firstName.trim(),
                            last_name: playerData.lastName.trim(),
                            skill: Number(playerData.skill) || 0,
                            is_defense: Number(playerData.defense) === 1,
                            is_attending: Number(playerData.attending) === 1,
                        };

                        const response = await fetch("/api/players", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(player),
                        });

                        if (!response.ok) {
                            throw new Error(
                                `Failed to upload player: ${player.first_name} ${player.last_name}`
                            );
                        }
                        return player;
                    });

                    await Promise.all(uploadPromises);
                    await fetchPlayers();
                    alert(`Successfully uploaded ${results.data.length} players`);
                } catch (err) {
                    setError(err.message);
                    console.error("CSV Upload Error:", err);
                } finally {
                    setLoading(false);
                }
            },
            error: (error) => {
                setError("Error parsing CSV file");
                console.error("CSV Parsing Error:", error);
                setLoading(false);
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header with upload button */}
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-semibold text-gray-800">Player Management</h2>
                <div className="flex items-center space-x-4">
                    <label className="cursor-pointer">
                        <div className="button-primary">
                            <ArrowUpFromLine size={20} />
                            <span>Upload Players CSV</span>
                            <input
                                type="file"
                                id="csv-upload"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="hidden"
                                disabled={loading}
                            />
                        </div>
                    </label>
                    {loading && (
                        <div className="flex items-center text-blue-600">
                            <svg
                                className="animate-spin h-5 w-5 mr-2"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            <span>Processing...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Players Table */}
            <div className="players-list bg-white rounded-lg shadow-card overflow-hidden">
                {players.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        First Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Last Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Skill
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Position
                                    </th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                                        Attending
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {players.map((player) => (
                                    <tr
                                        key={player.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {player.first_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {player.last_name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {player.skill}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_defense
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-green-100 text-green-800"
                                                    }`}
                                            >
                                                {player.is_defense ? "Defense" : "Forward"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${player.is_attending
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
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
                        <p className="text-gray-500 text-lg">
                            No players found. Upload a CSV to add players.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};