import { generateBalancedTeams, calculateTeamStats } from '@/lib/teamGenerator';
import { Player } from '@/types/PlayerTypes';

const mockPlayers: Player[] = [
    { id: 1, first_name: 'John', last_name: 'Doe', skill: 7, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', skill: 8, is_defense: true, is_goalie: false, group_id: '1' },
    { id: 3, first_name: 'Peter', last_name: 'Jones', skill: 5, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 4, first_name: 'Sarah', last_name: 'Wilson', skill: 6, is_defense: true, is_goalie: false, group_id: '1' },
    { id: 5, first_name: 'Mike', last_name: 'Brown', skill: 4, is_defense: false, is_goalie: false, group_id: '1' },
    { id: 6, first_name: 'Lisa', last_name: 'Davis', skill: 9, is_defense: false, is_goalie: false, group_id: '1' },
];

describe('Team Generator', () => {
    describe('generateBalancedTeams', () => {
        it('generates balanced teams with even number of players', () => {
            const teams = generateBalancedTeams(mockPlayers);
            
            expect(teams).toHaveProperty('team1');
            expect(teams).toHaveProperty('team2');
            expect(teams.team1).toHaveLength(3);
            expect(teams.team2).toHaveLength(3);
        });

        it('handles odd number of players', () => {
            const oddPlayers = mockPlayers.slice(0, 5);
            const teams = generateBalancedTeams(oddPlayers);
            
            // One team should have one more player
            expect(teams.team1.length + teams.team2.length).toBe(5);
            expect(Math.abs(teams.team1.length - teams.team2.length)).toBeLessThanOrEqual(1);
        });

        it('balances skill levels between teams', () => {
            const teams = generateBalancedTeams(mockPlayers);
            
            const team1Skill = teams.team1.reduce((sum, p) => sum + p.skill, 0);
            const team2Skill = teams.team2.reduce((sum, p) => sum + p.skill, 0);
            
            // Teams should have similar total skill (within 2 points)
            expect(Math.abs(team1Skill - team2Skill)).toBeLessThanOrEqual(2);
        });

        it('balances defense players between teams', () => {
            const teams = generateBalancedTeams(mockPlayers);
            
            const team1Defense = teams.team1.filter(p => p.is_defense).length;
            const team2Defense = teams.team2.filter(p => p.is_defense).length;
            
            // Defense players should be balanced
            expect(Math.abs(team1Defense - team2Defense)).toBeLessThanOrEqual(1);
        });

        it('handles empty players array', () => {
            const teams = generateBalancedTeams([]);
            
            expect(teams.team1).toHaveLength(0);
            expect(teams.team2).toHaveLength(0);
        });

        it('handles single player', () => {
            const teams = generateBalancedTeams([mockPlayers[0]]);
            
            expect(teams.team1.length + teams.team2.length).toBe(1);
        });

        it('handles two players', () => {
            const teams = generateBalancedTeams(mockPlayers.slice(0, 2));
            
            expect(teams.team1).toHaveLength(1);
            expect(teams.team2).toHaveLength(1);
        });
    });

    describe('calculateTeamStats', () => {
        it('calculates team statistics correctly', () => {
            const team1 = mockPlayers.slice(0, 3);
            const team2 = mockPlayers.slice(3, 6);
            
            const stats = calculateTeamStats(team1, team2);
            
            expect(stats).toHaveProperty('team1Stats');
            expect(stats).toHaveProperty('team2Stats');
            expect(stats).toHaveProperty('totalSkill1');
            expect(stats).toHaveProperty('totalSkill2');
            expect(stats).toHaveProperty('defenseCount1');
            expect(stats).toHaveProperty('defenseCount2');
        });

        it('calculates total skill correctly', () => {
            const team1 = [mockPlayers[0], mockPlayers[1]]; // skill 7 + 8 = 15
            const team2 = [mockPlayers[2], mockPlayers[3]]; // skill 5 + 6 = 11
            
            const stats = calculateTeamStats(team1, team2);
            
            expect(stats.totalSkill1).toBe(15);
            expect(stats.totalSkill2).toBe(11);
        });

        it('counts defense players correctly', () => {
            const team1 = [mockPlayers[0], mockPlayers[1]]; // 1 defense
            const team2 = [mockPlayers[2], mockPlayers[3]]; // 1 defense
            
            const stats = calculateTeamStats(team1, team2);
            
            expect(stats.defenseCount1).toBe(1);
            expect(stats.defenseCount2).toBe(1);
        });

        it('handles teams with no defense players', () => {
            const forwards = mockPlayers.filter(p => !p.is_defense);
            const team1 = forwards.slice(0, 2);
            const team2 = forwards.slice(2, 4);
            
            const stats = calculateTeamStats(team1, team2);
            
            expect(stats.defenseCount1).toBe(0);
            expect(stats.defenseCount2).toBe(0);
        });

        it('handles empty teams', () => {
            const stats = calculateTeamStats([], []);
            
            expect(stats.totalSkill1).toBe(0);
            expect(stats.totalSkill2).toBe(0);
            expect(stats.defenseCount1).toBe(0);
            expect(stats.defenseCount2).toBe(0);
        });
    });

    describe('Team Balance Quality', () => {
        it('produces reasonably balanced teams for various player counts', () => {
            for (let i = 4; i <= 12; i++) {
                const testPlayers = mockPlayers.slice(0, i);
                const teams = generateBalancedTeams(testPlayers);
                
                const team1Skill = teams.team1.reduce((sum, p) => sum + p.skill, 0);
                const team2Skill = teams.team2.reduce((sum, p) => sum + p.skill, 0);
                
                // Teams should be reasonably balanced (within 3 points for larger teams)
                const maxDifference = Math.max(2, Math.floor(i / 4));
                expect(Math.abs(team1Skill - team2Skill)).toBeLessThanOrEqual(maxDifference);
            }
        });

        it('distributes high-skill players evenly', () => {
            const highSkillPlayers = mockPlayers.filter(p => p.skill >= 7);
            const teams = generateBalancedTeams(mockPlayers);
            
            const team1HighSkill = teams.team1.filter(p => p.skill >= 7).length;
            const team2HighSkill = teams.team2.filter(p => p.skill >= 7).length;
            
            expect(Math.abs(team1HighSkill - team2HighSkill)).toBeLessThanOrEqual(1);
        });
    });
}); 