import { type Player, type Teams } from '@/types/PlayerTypes';
import _ from 'lodash';

export function generateTeams(players: Player[], groupCode: string): Teams {
    const attendingPlayers = players.filter(p => p.is_attending && p.group_code === groupCode);

    // Shuffle players to ensure randomness for tie-breaking, then sort by skill
    const sortedPlayers = _.orderBy(_.shuffle(attendingPlayers), 'skill', 'desc');

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

function balancePositions(teams: Teams) {
    // Simple swap: if one team has >1 more F/D than the other, swap one F for one D
    const forwardDiff = teams.red.forwards.length - teams.white.forwards.length;
    
    if (Math.abs(forwardDiff) > 1) {
        const teamToGiveF = forwardDiff < 0 ? teams.red : teams.white;
        const teamToGiveD = forwardDiff < 0 ? teams.white : teams.red;

        // Find a forward to swap from the team that has too many
        const forwardToSwap = _.sample(teamToGiveD.forwards); 
        // Find a defenseman to swap from the team that needs a forward
        const defenseToSwap = _.sample(teamToGiveF.defensemen);

        if (forwardToSwap && defenseToSwap) {
             // Perform the swap
            _.pull(teamToGiveD.forwards, forwardToSwap);
            _.pull(teamToGiveF.defensemen, defenseToSwap);
            teamToGiveF.forwards.push(forwardToSwap);
            teamToGiveD.defensemen.push(defenseToSwap);
        }
    }
} 