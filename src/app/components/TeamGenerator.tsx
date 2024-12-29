// TeamGenerator.tsx
'use client';

import { useState } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';

interface TeamGeneratorProps {
    players: Player[];
    onTeamsGenerated: (teams: Teams) => void;
}

export default function TeamGenerator({ players, onTeamsGenerated }: TeamGeneratorProps) {
    const [generationStrategy, setGenerationStrategy] = useState<'alternate' | 'skill'>('alternate');

    const generateTeams = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const forwards = attendingPlayers.filter(p => !p.is_defense);
        const defensemen = attendingPlayers.filter(p => p.is_defense);

        const newTeams: Teams = {
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        };

        if (generationStrategy === 'alternate') {
            // Current alternating strategy
            forwards.forEach((player, index) => {
                if (index % 2 === 0) {
                    newTeams.red.forwards.push(player);
                } else {
                    newTeams.white.forwards.push(player);
                }
            });

            defensemen.forEach((player, index) => {
                if (index % 2 === 0) {
                    newTeams.red.defensemen.push(player);
                } else {
                    newTeams.white.defensemen.push(player);
                }
            });
        } else {
            // Skill-based strategy (we can implement different algorithms here)
            // Sort by skill level and distribute to balance teams
            const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
            const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

            // Example skill-based distribution (can be modified)
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
        }

        onTeamsGenerated(newTeams);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <select
                    value={generationStrategy}
                    onChange={(e) => setGenerationStrategy(e.target.value as 'alternate' | 'skill')}
                    className="rounded-lg border border-gray-300 px-3 py-2"
                >
                    <option value="alternate">Alternate Players</option>
                    <option value="skill">Balance by Skill</option>
                </select>

                <button
                    onClick={generateTeams}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    Generate Teams
                </button>
            </div>
        </div>
    );
}