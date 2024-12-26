import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';

export default function RosterGenerator() {
  const [activeTab, setActiveTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState({ red: { forwards: [], defensemen: [] }, white: { forwards: [], defensemen: [] }});

  // Handle CSV upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        const playerData = lines.slice(1).filter(line => line.trim());
        
        const formattedPlayers = playerData.map(line => {
          const [firstName, lastName, skill, defense, attending] = line.split(',').map(item => item.trim());
          return {
            firstName,
            lastName,
            skill: Number(skill) || 0,
            defense: Number(defense) === 1,
            attending: Number(attending) === 1
          };
        });
        
        setPlayers(formattedPlayers);
      };
      reader.readAsText(file);
    }
  };

  // Function to update player data directly in the table
  const updatePlayer = (index, field, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = {
      ...updatedPlayers[index],
      [field]: field === 'skill' ? Number(value) : 
               field === 'defense' || field === 'attending' ? value === 'true' : 
               value
    };
    setPlayers(updatedPlayers);
  };

  // Generate balanced teams
  const generateRosters = () => {
    const attendingPlayers = players.filter(p => p.attending);
    const forwards = attendingPlayers.filter(p => !p.defense);
    const defensemen = attendingPlayers.filter(p => p.defense);

    // Sort by skill level
    const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
    const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

    const newTeams = {
      red: { forwards: [], defensemen: [] },
      white: { forwards: [], defensemen: [] }
    };

    // Distribute forwards
    sortedForwards.forEach((player, index) => {
      if (index % 2 === 0) {
        newTeams.red.forwards.push(player);
      } else {
        newTeams.white.forwards.push(player);
      }
    });

    // Distribute defensemen
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

  // Players Tab Content
  const PlayersTab = () => (
    <div className="mt-4">
      <div className="mb-4 space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">First Name</th>
              <th className="border p-2">Last Name</th>
              <th className="border p-2">Skill (1-10)</th>
              <th className="border p-2">Defense</th>
              <th className="border p-2">Attending</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="border p-2">
                  <input
                    type="text"
                    value={player.firstName}
                    onChange={(e) => updatePlayer(index, 'firstName', e.target.value)}
                    className="w-full p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={player.lastName}
                    onChange={(e) => updatePlayer(index, 'lastName', e.target.value)}
                    className="w-full p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={player.skill}
                    onChange={(e) => updatePlayer(index, 'skill', e.target.value)}
                    className="w-full p-1"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={player.defense}
                    onChange={(e) => updatePlayer(index, 'defense', e.target.checked)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="border p-2 text-center">
                  <input
                    type="checkbox"
                    checked={player.attending}
                    onChange={(e) => updatePlayer(index, 'attending', e.target.checked)}
                    className="w-4 h-4"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {players.length > 0 && (
        <button
          onClick={generateRosters}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md
            hover:bg-blue-700 transition-colors"
        >
          Generate Teams
        </button>
      )}
    </div>
  );

  // Roster Tab Content
  const RosterTab = () => (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      {/* Red Team */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-red-600 text-white p-4">
          <h2 className="text-xl font-bold">Red Team</h2>
        </div>
        <div className="p-4">
          <h3 className="font-bold mb-2">Forwards</h3>
          <div className="space-y-1 mb-4">
            {teams.red.forwards.map((player, idx) => (
              <div key={idx} className="flex justify-between p-2 bg-gray-50">
                <span>{player.firstName} {player.lastName}</span>
                <span className="text-gray-600">Skill: {player.skill}</span>
              </div>
            ))}
          </div>
          <h3 className="font-bold mb-2">Defense</h3>
          <div className="space-y-1">
            {teams.red.defensemen.map((player, idx) => (
              <div key={idx} className="flex justify-between p-2 bg-gray-50">
                <span>{player.firstName} {player.lastName}</span>
                <span className="text-gray-600">Skill: {player.skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* White Team */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-4">
          <h2 className="text-xl font-bold">White Team</h2>
        </div>
        <div className="p-4">
          <h3 className="font-bold mb-2">Forwards</h3>
          <div className="space-y-1 mb-4">
            {teams.white.forwards.map((player, idx) => (
              <div key={idx} className="flex justify-between p-2 bg-gray-50">
                <span>{player.firstName} {player.lastName}</span>
                <span className="text-gray-600">Skill: {player.skill}</span>
              </div>
            ))}
          </div>
          <h3 className="font-bold mb-2">Defense</h3>
          <div className="space-y-1">
            {teams.white.defensemen.map((player, idx) => (
              <div key={idx} className="flex justify-between p-2 bg-gray-50">
                <span>{player.firstName} {player.lastName}</span>
                <span className="text-gray-600">Skill: {player.skill}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Hockey Roster Generator</h1>
      
      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex">
          <button
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'players'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button
            className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
              activeTab === 'roster'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('roster')}
          >
            Roster
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'players' ? <PlayersTab /> : <RosterTab />}
    </div>
  );
}
