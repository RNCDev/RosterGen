import { type Player, type Teams } from '@/types/PlayerTypes';
import _ from 'lodash';

export function generateTeams(players: Player[], groupCode: string): Teams {
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
    const teams: Teams = {
        red: { forwards: [], defensemen: [], group_code: groupCode },
        white: { forwards: [], defensemen: [], group_code: groupCode },
    };

    // Draft players
    const draftPlayers = (players: Player[], type: 'forwards' | 'defensemen') => {
        players.forEach((player) => {
            const redCount = teams.red[type].length;
            const whiteCount = teams.white[type].length;
            const redSkill = _.sumBy([...teams.red.forwards, ...teams.red.defensemen], 'skill');
            const whiteSkill = _.sumBy([...teams.white.forwards, ...teams.white.defensemen], 'skill');

            let chooseRed = false;

            if (redCount > whiteCount) {
                chooseRed = false;
            } else if (whiteCount > redCount) {
                chooseRed = true;
            } else if (Math.abs(redSkill - whiteSkill) > 2) {
                chooseRed = redSkill < whiteSkill;
            } else {
                chooseRed = Math.random() < 0.5;
            }

            if (chooseRed) {
                teams.red[type].push(player);
            } else {
                teams.white[type].push(player);
            }
        });
    };

    // Draft defensemen first
    draftPlayers(sortedDefensemen, 'defensemen');

    // Then draft forwards
    draftPlayers(sortedForwards, 'forwards');

    return teams;
} 