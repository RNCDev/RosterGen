import { type Player, type Teams } from '@/types/PlayerTypes';
import _ from 'lodash';

export function generateTeams(players: Player[], groupCode: string): Teams {
    // Players are now pre-filtered by attendance before calling this function.
    // Shuffle players to ensure randomness for tie-breaking, then sort by skill
    const sortedPlayers = _.orderBy(_.shuffle(players), 'skill', 'desc');

    // Initialize teams
    const teams: Teams = {
        red: { forwards: [], defensemen: [], group_code: groupCode },
        white: { forwards: [], defensemen: [], group_code: groupCode },
    };

    // Distribute players one by one from most skilled to least
    sortedPlayers.forEach(player => {
        const position = player.is_defense ? 'defensemen' : 'forwards';
        
        const redPositionCount = teams.red[position].length;
        const whitePositionCount = teams.white[position].length;

        let assignToRed = false;

        // Priority 1: Positional balance.
        // If a team is behind in the player's position, it gets the player.
        if (redPositionCount < whitePositionCount) {
            assignToRed = true;
        } else if (whitePositionCount < redPositionCount) {
            assignToRed = false;
        } else {
            // Positional counts for this specific position are equal.
            // Priority 2: Overall team size.
            const redTotal = teams.red.forwards.length + teams.red.defensemen.length;
            const whiteTotal = teams.white.forwards.length + teams.white.defensemen.length;

            if (redTotal < whiteTotal) {
                assignToRed = true;
            } else if (whiteTotal < redTotal) {
                assignToRed = false;
            } else {
                // Sizes are balanced, move to final priority.
                // Priority 3: Overall team skill.
                const redSkill = _.meanBy([...teams.red.forwards, ...teams.red.defensemen], 'skill') || 0;
                const whiteSkill = _.meanBy([...teams.white.forwards, ...teams.white.defensemen], 'skill') || 0;

                assignToRed = redSkill <= whiteSkill;
            }
        }
        
        // Assign player to the chosen team
        if (assignToRed) {
            teams.red[position].push(player);
        } else {
            teams.white[position].push(player);
        }
    });

    return teams;
} 