// app/components/teams/TeamCard.js
import React from 'react';

export function TeamCard({ team, color, stats }) {
  const bgColor = color === 'red' ? 'bg-red-600' : 'bg-gray-100';
  const textColor = color === 'red' ? 'text-white' : 'text-gray-900';

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className={`${bgColor} ${textColor} p-4`}>
        <h2 className="text-xl font-bold">{color === 'red' ? 'Red' : 'White'} Team</h2>
        {stats && (
          <div className="text-sm mt-1">
            <span>Avg Skill: {stats.averageSkill}</span>
            <span className="mx-2">•</span>
            <span>Players: {stats.totalPlayers}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold mb-2">Forwards</h3>
        <div className="space-y-1 mb-4">
          {team.forwards.map((player) => (
            <div key={player.id} className="flex justify-between p-2 bg-gray-50">
              <span>{player.first_name} {player.last_name}</span>
              <span className="text-gray-600">Skill: {player.skill}</span>
            </div>
          ))}
        </div>
        <h3 className="font-bold mb-2">Defense</h3>
        <div className="space-y-1">
          {team.defensemen.map((player) => (
            <div key={player.id} className="flex justify-between p-2 bg-gray-50">
              <span>{player.first_name} {player.last_name}</span>
              <span className="text-gray-600">Skill: {player.skill}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
