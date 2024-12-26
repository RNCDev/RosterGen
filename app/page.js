'use client';

import React, { useState } from 'react';

export default function RosterGenerator() {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n');
        // Remove header row and empty lines
        const playerData = lines.slice(1).filter(line => line.trim());
        
        const formattedPlayers = playerData.map(line => {
          const [firstName, lastName, skill, defense, attending] = line.split(',');
          return {
            name: `${firstName} ${lastName}`,
            skill: Number(skill) || 0,
            defense: Number(defense) === 1,
            attending: Number(attending) === 1
          };
        }).filter(player => player.attending);
        
        setPlayers(formattedPlayers);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hockey Roster Generator</h1>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block mb-4"
      />
      {/* We'll add more UI components here in the next steps */}
    </div>
  );
}
