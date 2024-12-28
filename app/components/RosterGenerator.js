"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

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

      // Distribute players
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
    <div className="flex">
      {/* Left Navigation */}
      <div className="w-64 min-h-screen bg-white shadow-lg">
        {/* Navigation content */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-8">
            Hockey Roster
          </h1>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("players")}
              className={`w-full px-4 py-2 text-left rounded transition-colors ${
                activeTab === "players"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Players
            </button>
            <button
              onClick={() => setActiveTab("roster")}
              className={`w-full px-4 py-2 text-left rounded transition-colors ${
                activeTab === "roster"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Roster
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Display players or rosters based on activeTab */}
        {activeTab === "players" ? (
          // Players Grid (more details below)
          <PlayersGrid players={players} />
        ) : (
          // Roster Tab
          <RosterTab
            teams={teams}
            generateRosters={generateRosters}
            players={players}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
