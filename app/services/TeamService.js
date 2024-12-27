// app/services/TeamService.js
export class TeamService {
  static generateTeams(players) {
    const attendingPlayers = players.filter(p => p.is_attending);
    const forwards = attendingPlayers.filter(p => !p.is_defense);
    const defensemen = attendingPlayers.filter(p => p.is_defense);

    const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
    const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

    const teams = {
      red: { forwards: [], defensemen: [] },
      white: { forwards: [], defensemen: [] }
    };

    // Distribute forwards
    sortedForwards.forEach((player, index) => {
      if (index % 2 === 0) {
        teams.red.forwards.push(player);
      } else {
        teams.white.forwards.push(player);
      }
    });

    // Distribute defensemen
    sortedDefensemen.forEach((player, index) => {
      if (index % 2 === 0) {
        teams.red.defensemen.push(player);
      } else {
        teams.white.defensemen.push(player);
      }
    });

    return teams;
  }

  static async saveTeams(teams) {
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        redTeam: teams.red,
        whiteTeam: teams.white,
        sessionDate: new Date().toISOString().split('T')[0]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save teams: ${errorText}`);
    }

    return await response.json();
  }

  static calculateTeamStats(team) {
    return {
      totalPlayers: team.forwards.length + team.defensemen.length,
      averageSkill: this.calculateAverageSkill([...team.forwards, ...team.defensemen]),
      forwardsCount: team.forwards.length,
      defenseCount: team.defensemen.length
    };
  }

  static calculateAverageSkill(players) {
    if (players.length === 0) return 0;
    const totalSkill = players.reduce((sum, player) => sum + player.skill, 0);
    return (totalSkill / players.length).toFixed(1);
  }
}
