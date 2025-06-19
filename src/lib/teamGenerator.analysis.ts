import { type Player, type Teams } from '@/types/PlayerTypes';
import { generateTeams } from './teamGenerator';
import _ from 'lodash';

// A test roster of 22 players
export const testPlayers: Player[] = [
    // Forwards (12)
    { id: 1, first_name: 'Alex', last_name: 'Ovechkin', skill: 10, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 2, first_name: 'Sidney', last_name: 'Crosby', skill: 10, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 3, first_name: 'Connor', last_name: 'McDavid', skill: 10, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 4, first_name: 'Nathan', last_name: 'MacKinnon', skill: 9, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 5, first_name: 'Auston', last_name: 'Matthews', skill: 9, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 6, first_name: 'Leon', last_name: 'Draisaitl', skill: 9, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 7, first_name: 'Brad', last_name: 'Marchand', skill: 8, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 8, first_name: 'David', last_name: 'Pastrnak', skill: 8, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 9, first_name: 'Mitch', last_name: 'Marner', skill: 7, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 10, first_name: 'John', last_name: 'Tavares', skill: 7, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 11, first_name: 'Bo', last_name: 'Horvat', skill: 6, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 12, first_name: 'J.T.', last_name: 'Miller', skill: 6, is_defense: false, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    
    // Defensemen (10)
    { id: 13, first_name: 'Cale', last_name: 'Makar', skill: 10, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 14, first_name: 'Roman', last_name: 'Josi', skill: 9, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 15, first_name: 'Victor', last_name: 'Hedman', skill: 9, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 16, first_name: 'Adam', last_name: 'Fox', skill: 8, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 17, first_name: 'Charlie', last_name: 'McAvoy', skill: 8, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 18, first_name: 'Miro', last_name: 'Heiskanen', skill: 7, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 19, first_name: 'Quinn', last_name: 'Hughes', skill: 7, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 20, first_name: 'Dougie', last_name: 'Hamilton', skill: 6, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 21, first_name: 'Shea', last_name: 'Theodore', skill: 6, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
    { id: 22, first_name: 'Aaron', last_name: 'Ekblad', skill: 5, is_defense: true, is_attending: true, group_code: 'test', created_at: new Date(), updated_at: new Date() },
];

export function analyzeTeams(teams: Teams) {
    const redTeam = [...teams.red.forwards, ...teams.red.defensemen];
    const whiteTeam = [...teams.white.forwards, ...teams.white.defensemen];

    const stats = {
        red: {
            count: redTeam.length,
            forwards: teams.red.forwards.length,
            defensemen: teams.red.defensemen.length,
            avgSkill: _.meanBy(redTeam, 'skill') || 0,
            avgForwardSkill: _.meanBy(teams.red.forwards, 'skill') || 0,
            avgDefenseSkill: _.meanBy(teams.red.defensemen, 'skill') || 0,
        },
        white: {
            count: whiteTeam.length,
            forwards: teams.white.forwards.length,
            defensemen: teams.white.defensemen.length,
            avgSkill: _.meanBy(whiteTeam, 'skill') || 0,
            avgForwardSkill: _.meanBy(teams.white.forwards, 'skill') || 0,
            avgDefenseSkill: _.meanBy(teams.white.defensemen, 'skill') || 0,
        }
    };

    return stats;
}

export function runBulkAnalysis(players: Player[], iterations: number) {
    const teamCompositions = new Set<string>();

    for (let i = 0; i < iterations; i++) {
        const teams = generateTeams(players, 'test');
        const stats = analyzeTeams(teams);
        
        const composition = `Red: ${stats.red.forwards}F/${stats.red.defensemen}D | White: ${stats.white.forwards}F/${stats.white.defensemen}D`;
        teamCompositions.add(composition);
    }
    
    // Perform a single run to analyze player distribution
    const teams = generateTeams(players, 'test');
    const sortedPlayers = [...players].sort((a,b) => b.skill - a.skill);
    const top4Players = sortedPlayers.slice(0, 4).map(p => `${p.first_name} (${p.skill})`);
    
    const teamStats = analyzeTeams(teams);
    const redPlayerNames = [...teams.red.forwards, ...teams.red.defensemen].map(p => p.first_name).join(', ');

    return {
        bulkAnalysis: {
            iterations,
            uniqueCompositions: Array.from(teamCompositions),
        },
        singleRunAnalysis: {
            top4SkilledPlayers: top4Players,
            teamStats: teamStats,
            redTeamPlayers: redPlayerNames,
        }
    }
} 