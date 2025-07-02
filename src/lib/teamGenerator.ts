import { type Player, type Teams } from '@/types/PlayerTypes';
import _ from 'lodash';
import { type Group } from '@/types/PlayerTypes';

export function generateTeams(players: Player[], group: Group): Teams {
    // Players are now pre-filtered by attendance before calling this function.
    // Shuffle players to ensure randomness for tie-breaking, then sort by skill
    const sortedPlayers = _.orderBy(_.shuffle(players), 'skill', 'desc');

    // Initialize teams with dynamic names from group aliases
    const teams: Teams = {
        [group["team-alias-1"].toLowerCase()]: { forwards: [], defensemen: [], group_code: group.code },
        [group["team-alias-2"].toLowerCase()]: { forwards: [], defensemen: [], group_code: group.code },
    };

    // Distribute players one by one from most skilled to least
    sortedPlayers.forEach(player => {
        const position = player.is_defense ? 'defensemen' : 'forwards';
        
        const team1Alias = group["team-alias-1"].toLowerCase();
        const team2Alias = group["team-alias-2"].toLowerCase();

        const team1PositionCount = teams[team1Alias][position].length;
        const team2PositionCount = teams[team2Alias][position].length;

        let assignToTeam1 = false;

        // Priority 1: Positional balance.
        // If a team is behind in the player's position, it gets the player.
        if (team1PositionCount < team2PositionCount) {
            assignToTeam1 = true;
        } else if (team2PositionCount < team1PositionCount) {
            assignToTeam1 = false;
        } else {
            // Positional counts for this specific position are equal.
            // Priority 2: Overall team size.
            const team1Total = teams[team1Alias].forwards.length + teams[team1Alias].defensemen.length;
            const team2Total = teams[team2Alias].forwards.length + teams[team2Alias].defensemen.length;

            if (team1Total < team2Total) {
                assignToTeam1 = true;
            }
            else if (team2Total < team1Total) {
                assignToTeam1 = false;
            } else {
                // Sizes are balanced, move to final priority.
                // Priority 3: Overall team skill.
                const team1Skill = _.meanBy([...teams[team1Alias].forwards, ...teams[team1Alias].defensemen], 'skill') || 0;
                const team2Skill = _.meanBy([...teams[team2Alias].forwards, ...teams[team2Alias].defensemen], 'skill') || 0;

                assignToTeam1 = team1Skill <= team2Skill;
            }
        }
        
        // Assign player to the chosen team
        if (assignToTeam1) {
            teams[team1Alias][position].push(player);
        } else {
            teams[team2Alias][position].push(player);
        }
    });

    return teams;
} 