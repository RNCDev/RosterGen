'use client';

import { type Player, type Teams } from '@/types/PlayerTypes';
import { ArrowLeftRight } from 'lucide-react';
import _ from 'lodash';

interface TeamGeneratorProps {
    players: Player[];
    groupCode: string;
    onTeamsGenerated: (teams: Teams) => void;
}

export default function TeamGenerator({ players, groupCode, onTeamsGenerated }: TeamGeneratorProps) {
    const generateTeams = () => {
        // Filter attending players from current group
        const attendingPlayers = players.filter(p => p.is_attending && p.group_code === groupCode);

        // Separate forwards and defensemen, sorted by skill
        const sortedForwards = _.orderBy(
            attendingPlayers.filter(p => !p.is_defense),
            'skill',
            'desc'
        );
        const sortedDefensemen = _.orderBy(
            attendingPlayers.filter(p => p.is_defense),
            'skill',
            'desc'
        );

        // Initialize teams
        const newTeams: Teams = {
            red: { forwards: [], defensemen: [], group_code: groupCode },
            white: { forwards: [], defensemen: [], group_code: groupCode },
        };

        // Draft players
        const draftPlayers = (players: Player[], type: 'forwards' | 'defensemen') => {
            players.forEach((player) => {
                const redCount = newTeams.red[type].length;
                const whiteCount = newTeams.white[type].length;
                const redSkill = _.sumBy([...newTeams.red.forwards, ...newTeams.red.defensemen], 'skill');
                const whiteSkill = _.sumBy([...newTeams.white.forwards, ...newTeams.white.defensemen], 'skill');

                let chooseRed = false;

                if (redCount > whiteCount) {
                    chooseRed = false;
                } else if (whiteCount > redCount) {
                    chooseRed = true;
                } else if (Math.abs(redSkill - whiteSkill) > 2) {
                    // If skill difference is significant, choose the weaker team
                    chooseRed = redSkill < whiteSkill;
                } else {
                    // If counts and skills are close, use a slight randomization
                    chooseRed = Math.random() < 0.5;
                }

                if (chooseRed) {
                    newTeams.red[type].push(player);
                } else {
                    newTeams.white[type].push(player);
                }
            });
        };

        // Draft defensemen first
        draftPlayers(sortedDefensemen, 'defensemen');

        // Then draft forwards
        draftPlayers(sortedForwards, 'forwards');

        // Call the callback with generated teams
        onTeamsGenerated(newTeams);
    };

    return (
        <button
            onClick={generateTeams}
            disabled={players.filter(p => p.is_attending && p.group_code === groupCode).length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <ArrowLeftRight className="h-5 w-5" />
            Generate Teams
        </button>
    );
}