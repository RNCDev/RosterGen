// app/components/teams/TeamRoster.js
import React from 'react';
import { TeamCard } from './TeamCard';

export function TeamRoster({ teams, stats }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mt-4">
      <TeamCard 
        team={teams.red}
        color="red"
        stats={stats?.red}
      />
      <TeamCard 
        team={teams.white}
        color="white"
        stats={stats?.white}
      />
    </div>
  );
}
