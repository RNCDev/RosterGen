import { type Player, type Teams } from '@/types/PlayerTypes';
import _ from 'lodash';

export function generateTeams(players: Player[], groupCode: string): Teams {
    // Filter attending players from current group
    const attendingPlayers = players.filter(p => p.is_attending && p.group_code === groupCode);

    // Initialize teams
    const teams: Teams = {
        red: { forwards: [], defensemen: [], group_code: groupCode },
        white: { forwards: [], defensemen: [], group_code: groupCode },
    };

    // Sort players by position and skill
    const forwards = _.orderBy(
        attendingPlayers.filter(p => !p.is_defense),
        'skill',
        'desc'
    );
    const defensemen = _.orderBy(
        attendingPlayers.filter(p => p.is_defense),
        'skill',
        'desc'
    );

    // First, distribute top players evenly
    [...forwards, ...defensemen].slice(0, 4).forEach((player, i) => {
        const team = i % 2 === 0 ? 'red' : 'white';
        const position = player.is_defense ? 'defensemen' : 'forwards';
        teams[team][position].push(player);
    });

    // Then handle remaining players with balanced approach
    [...forwards, ...defensemen].slice(4).forEach(player => {
        const position = player.is_defense ? 'defensemen' : 'forwards';
        
        // Calculate current team stats
        const redTotal = teams.red.forwards.length + teams.red.defensemen.length;
        const whiteTotal = teams.white.forwards.length + teams.white.defensemen.length;
        const redSkill = _.meanBy([...teams.red.forwards, ...teams.red.defensemen], 'skill') || 0;
        const whiteSkill = _.meanBy([...teams.white.forwards, ...teams.white.defensemen], 'skill') || 0;

        // Determine team assignment
        let chooseRed = false;

        // First priority: balance team sizes
        if (redTotal < whiteTotal) {
            chooseRed = true;
        } else if (whiteTotal < redTotal) {
            chooseRed = false;
        } else {
            // If sizes are equal, consider skill difference
            const skillDiff = Math.abs(redSkill - whiteSkill);
            if (skillDiff > 0.3) {
                chooseRed = redSkill < whiteSkill;
            } else {
                // Add controlled randomness when skills are close
                chooseRed = Math.random() < 0.5;
            }
        }

        // Assign player to chosen team
        if (chooseRed) {
            teams.red[position].push(player);
        } else {
            teams.white[position].push(player);
        }
    });

    return teams;
} 