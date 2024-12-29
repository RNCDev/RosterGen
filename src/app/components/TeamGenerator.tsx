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
    const generateTeams = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const forwards = attendingPlayers.filter(p => !p.is_defense);
        const defensemen = attendingPlayers.filter(p => p.is_defense);

        const newTeams: Teams = {
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] },
        };

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

        onTeamsGenerated(newTeams);
    };

    return (
        <div className="flex justify-end mb-6">
            <button
                onClick={generateTeams}
                disabled={players.filter(p => p.is_attending).length === 0}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ArrowLeftRight className="h-5 w-5" />
                Generate Teams
            </button>
        </div>
    );
}