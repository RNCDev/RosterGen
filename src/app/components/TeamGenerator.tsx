// src/components/TeamGenerator.tsx
'use client';

import { useState } from 'react';
import { type Player, type Teams } from '@/types/PlayerTypes';
import { ArrowLeftRight } from 'lucide-react';

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
            // Skill-based strategy
            const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
            const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

            // Example skill-based distribution
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
        <div className="border-t pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-medium text-gray-900">Team Generation</h3>
                    <select
                        value={generationStrategy}
                        onChange={(e) => setGenerationStrategy(e.target.value as 'alternate' | 'skill')}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                        <option value="alternate">Alternate Players</option>
                        <option value="skill">Balance by Skill</option>
                    </select>
                </div>

                <button
                    onClick={generateTeams}
                    disabled={players.filter(p => p.is_attending).length === 0}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftRight className="h-5 w-5" />
                    Generate Teams
                </button>
            </div>
        </div>
    );
}