// components/RosterGenerator.js
"use client";

import { useState, useEffect } from "react";
import { PlayersTab } from "./PlayersTab";
import { RosterTab } from "./RosterTab";

export const RosterGenerator = () => {
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
        red: {
          forwards: [],
          defensemen: [],
        },
        white: {
          forwards: [],
          defensemen: [],
        },
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

      // Save team assignments to the database
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redTeam: newTeams.red,
          whiteTeam: newTeams.white,
          sessionDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) throw new Error("Failed to save teams");

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
  <main className="grid grid-cols-12 gap-4 max-w-7xl mx-auto p-4">
  <div className="col-span-3"> {/* Wrap the nav in a div with col-span-3 */}
    <nav className="bg-gray-200 p-4 rounded-md">
      <button
        onClick={() => setActiveTab("players")}
        className={`w-full text-left py-2 px-4 rounded ${activeTab === "players" ? "bg-blue-500 text-white" : "hover:bg-gray-300"}`}
      >
        Players
      </button>
      <button
        onClick={() => setActiveTab("roster")}
        className={`w-full text-left py-2 px-4 rounded mt-2 ${activeTab === "roster" ? "bg-blue-500 text-white" : "hover:bg-gray-300"}`}
      >
        Roster
      </button>
    </nav>
  </div> {/* Close the div */}

      <div className="col-span-9 p-4 rounded-md bg-white">
        <h1 className="text-2xl font-bold mb-6">Hockey Roster Generator</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div>Loading players...</div>
        ) : (
          <>
            {activeTab === "players" ? (
              <PlayersTab
                players={players}
                setPlayers={setPlayers}
                loading={loading}
                setLoading={setLoading}
                error={error}
                setError={setError}
                fetchPlayers={fetchPlayers}
              />
            ) : (
              <RosterTab teams={teams} generateRosters={generateRosters} players={players} loading={loading} />
            )}
          </>
        )}
      </div>
    </main>
  );
};
