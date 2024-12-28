


Show more




Show more






Gemini Advanced
1.5 Pro
Conversation with Gemini

Good evening Gemini. I'm building a React App. It's supposed to have a left navigation panel and a modern feel but it looks terrible. After this prompt I can load all the relevant code files.




I'm ready! Please feel free to share the code files. I'll do my best to help you identify what might be causing the issues and suggest improvements to achieve that modern look you're aiming for.

To give you the most effective feedback, it would be helpful to have:

App.js or index.js: This will show the main structure of your app and how the navigation panel is integrated.
Navigation component file: This will show how your navigation panel is built and styled.
CSS files: Whether you're using plain CSS, a CSS framework, or styled-components, please share the relevant styling for the navigation and the overall app.
The more context I have, the better I can understand your current implementation and provide tailored suggestions. Let's make that navigation panel shine! ✨






here are the files. I really want to get the UI looking good before making performance or app enhancements.



globals
CSS

layout
JS

next.config
JS

page
JS

tailwind.config
JS

PlayersTab
JS

RosterGenerator
JS

RosterTab
JS


Analysis complete

Okay, I've taken a look at your code and I'm ready to help you make your React app look fantastic!  I understand you want to prioritize the UI and give it a modern feel. Here's a breakdown of how we can enhance your app's appearance, focusing on that left navigation panel:

1. Navigation Panel

Modernize the layout: Consider a clean, minimalist design.
Use ample spacing around elements.
Incorporate subtle borders or dividers for visual separation.
Color Scheme: Choose a color palette that aligns with a modern aesthetic.
Use a few primary colors and their variations.
Consider a light or dark mode option.
Typography: Select a font that is both readable and stylish.
Use a clear hierarchy (headings, subheadings, body text).
Ensure sufficient contrast between text and background colors.
Interactive Elements: Make the navigation intuitive and engaging.
Use clear hover states on buttons.
Consider subtle animations or transitions.
Responsive Design: Ensure the navigation panel adapts seamlessly to different screen sizes.
2. Overall App Enhancements

Visual Hierarchy: Guide the user's eye by establishing a clear visual hierarchy.
Use headings, subheadings, and spacing to structure content.
Emphasize important elements with size, color, or contrast.
Consistency: Maintain a consistent style throughout the app.
Use a design system or component library for reusability and consistency.
Whitespace: Don't be afraid of whitespace! It improves readability and creates a cleaner look.
Let's Start!

To give you more specific recommendations, could you tell me more about what aspects of your current UI you dislike? For example:

Are there particular colors or fonts you want to change?
Is the layout not working the way you envisioned?
Do you have any examples of modern UIs that you like?
Once I have a better understanding of your preferences, I can provide more tailored advice and even help you with some CSS or component structure suggestions. Let's work together to transform your app's UI!


Sources and related content
globals

CSS
layout

JS
next.config

JS
page

JS
tailwind.config

JS






I want a left navigation panel with "Players" and "Roster" and I want the player grid to look modern, clean and responsive. Let's start with that



Analysis complete

OK, here's how you can structure your RosterGenerator.js component to achieve the layout you described:

JavaScript

// RosterGenerator.js
"use client";

import { useState, useEffect } from "react";

export function RosterGenerator() {
  const [activeTab, setActiveTab] = useState("players");
  // ... (rest of your state variables)

  // ... (your data fetching and roster generation logic)

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
Players Grid

Here's how you can create a PlayersGrid component that's modern, clean, and responsive:

JavaScript

// components/PlayersGrid.js
"use client";

import { ArrowUpFromLine, ArrowLeftRight } from "lucide-react";

const PlayersGrid = ({ players }) => {
  // ... your state variables and functions for handling file uploads, generating rosters, etc.

  return (
    <div className="space-y-6">
      {/* Header with buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Player List</h2>
        <div className="flex space-x-4">
          {/* Buttons for generating rosters and uploading CSV */}
          <button
            onClick={generateRosters} // Assuming you have this function
            disabled={loading || players.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
          >
            <ArrowLeftRight className="mr-2 h-5 w-5" />
            Generate Roster
          </button>

          <label className="cursor-pointer">
            <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center">
              <ArrowUpFromLine className="mr-2 h-5 w-5" />
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload} // Assuming you have this function
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
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {/* Table headers */}
                <th className="border p-2 text-left">First Name</th>
                <th className="border p-2 text-left">Last Name</th>
                <th className="border p-2 text-left">Skill</th>
                <th className="border p-2 text-left">Position</th>
                <th className="border p-2 text-left">Attending</th>
              </tr>
            </thead>
            <tbody>
              {/* Map through players data to display rows */}
              {players.map((player) => (
                <tr
                  key={player.id || `${player.first_name}-${player.last_name}`}
                  className="hover:bg-gray-50"
                >
                  <td className="border p-2">{player.first_name}</td>
                  <td className="border p-2">{player.last_name}</td>
                  <td className="border p-2">{player.skill}</td>
                  <td className="border p-2">
                    {player.is_defense ? "Defense" : "Forward"}
                  </td>
                  <td className="border p-2">
                    {player.is_attending ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">
          No players found. Upload a CSV to add players.
        </p>
      )}
    </div>
  );
};

export default PlayersGrid;
Key improvements

Clear structure: The layout is organized with a left navigation and a main content area.
Modern and clean aesthetic: Uses a simple color scheme, whitespace, and visual hierarchy.
Responsive design: The left navigation can be hidden or transformed into a top navigation bar for smaller screens (you'll need to add CSS media queries for this).
Interactive elements: Buttons have hover states for better user feedback.

Sources and related content
globals

CSS
layout

JS
next.config

JS
page

JS
tailwind.config

JS






please provide the code for:   // ... your state variables and functions for handling file uploads, generating rosters, etc.




JavaScript

// components/PlayersGrid.js
"use client";

import { useState, useEffect } from "react";
import { ArrowUpFromLine, ArrowLeftRight } from "lucide-react";
import Papa from "papaparse";

const PlayersGrid = ({ players }) => {
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState([]);

  // Function to handle CSV file uploads
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          // Assuming your CSV has columns like first_name, last_name, skill, is_defense, is_attending
          const playerData = results.data.map((row) => ({
            ...row,
            // Add an id if your CSV doesn't have one
            id: `${row.first_name}-${row.last_name}`,
          }));
          // Update the players state with the parsed data
          players = playerData
        },
      });
    }
  };

  // Function to generate rosters (replace with your actual logic)
  const generateRosters = async () => {
    setLoading(true);
    try {
      // Simulate an API call or any other logic to generate rosters
      const response = await new Promise((resolve) =>
        setTimeout(
          resolve({
            data: [
              // Sample roster data
              {
                team_name: "Team A",
                players: players.slice(0, Math.ceil(players.length / 2)),
              },
              {
                team_name: "Team B",
                players: players.slice(Math.ceil(players.length / 2)),
              },
            ],
          }),
          2000
        )
      );

      setTeams(response.data);
    } catch (error) {
      console.error("Error generating rosters:", error);
      // Handle errors (e.g., display an error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... rest of your component code (as provided in the previous response)
  );
};

export default PlayersGrid;
Explanation

useState for managing component state:
loading: Tracks whether the roster generation is in progress.
teams: Stores the generated rosters.
handleFileUpload: Parses the uploaded CSV file using Papa Parse and updates the players state.
generateRosters: Simulates an API call (replace with your actual logic) to generate rosters and updates the teams state.
Error handling: Includes a try...catch block to handle potential errors during roster generation.
Loading state: Disables the buttons and provides visual feedback to the user while the rosters are being generated.
Remember

Replace the sample roster data and API simulation in generateRosters with your actual implementation.
Consider adding error handling and user feedback mechanisms (e.g., displaying error messages, success notifications).
You might need to adjust the CSV parsing logic based on the structure of your CSV file.










Gemini can make mistakes, so double-check it

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
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-8">Hockey Roster</h1>
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "players" ? (
            <div className="space-y-6">
              {/* Header with buttons */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Player List</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={generateRosters}
                    disabled={loading || players.length === 0}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Roster
                  </button>
                  
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center">
                      <ArrowUpFromLine className="mr-2 h-5 w-5" />
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
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">First Name</th>
                        <th className="border p-2 text-left">Last Name</th>
                        <th className="border p-2 text-left">Skill</th>
                        <th className="border p-2 text-left">Position</th>
                        <th className="border p-2 text-left">Attending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id || `${player.first_name}-${player.last_name}`} className="hover:bg-gray-50">
                          <td className="border p-2">{player.first_name}</td>
                          <td className="border p-2">{player.last_name}</td>
                          <td className="border p-2">{player.skill}</td>
                          <td className="border p-2">{player.is_defense ? "Defense" : "Forward"}</td>
                          <td className="border p-2">{player.is_attending ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No players found. Upload a CSV to add players.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Rosters</h2>
              {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Red Team */}
                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">Red Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Forwards</h4>
                        {teams.red.forwards.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Defense</h4>
                        {teams.red.defensemen.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* White Team */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">White Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Forwards</h4>
                        {teams.white.forwards.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Defense</h4>
                        {teams.white.defensemen.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={generateRosters}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
                    disabled={players.length === 0 || loading}
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Teams
                  </button>
                  {players.length === 0 && (
                    <p className="text-red-500 mt-2">Please add players before generating teams.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
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
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-8">Hockey Roster</h1>
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
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === "players" ? (
            <div className="space-y-6">
              {/* Header with buttons */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Player List</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={generateRosters}
                    disabled={loading || players.length === 0}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Roster
                  </button>
                  
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center">
                      <ArrowUpFromLine className="mr-2 h-5 w-5" />
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
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">First Name</th>
                        <th className="border p-2 text-left">Last Name</th>
                        <th className="border p-2 text-left">Skill</th>
                        <th className="border p-2 text-left">Position</th>
                        <th className="border p-2 text-left">Attending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id || `${player.first_name}-${player.last_name}`} className="hover:bg-gray-50">
                          <td className="border p-2">{player.first_name}</td>
                          <td className="border p-2">{player.last_name}</td>
                          <td className="border p-2">{player.skill}</td>
                          <td className="border p-2">{player.is_defense ? "Defense" : "Forward"}</td>
                          <td className="border p-2">{player.is_attending ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No players found. Upload a CSV to add players.</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Team Rosters</h2>
              {teams.red.forwards.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {/* Red Team */}
                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-red-700 mb-4">Red Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Forwards</h4>
                        {teams.red.forwards.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-red-600 mb-2">Defense</h4>
                        {teams.red.defensemen.map((player) => (
                          <div key={player.id} className="bg-red-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* White Team */}
                  <div className="bg-gray-50 p-4 rounded">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">White Team</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Forwards</h4>
                        {teams.white.forwards.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-600 mb-2">Defense</h4>
                        {teams.white.defensemen.map((player) => (
                          <div key={player.id} className="bg-gray-100 p-2 rounded mb-1">
                            {player.first_name} {player.last_name} (Skill: {player.skill})
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={generateRosters}
                    className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center mx-auto"
                    disabled={players.length === 0 || loading}
                  >
                    <ArrowLeftRight className="mr-2 h-5 w-5" />
                    Generate Teams
                  </button>
                  {players.length === 0 && (
                    <p className="text-red-500 mt-2">Please add players before generating teams.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}