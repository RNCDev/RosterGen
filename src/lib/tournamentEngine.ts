import { type Player } from '@/types/PlayerTypes';

export interface TournamentPlayer {
  id: string;
  name: string;
  originalPlayer: Player;
}

export interface Matchup {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  timestamp?: Date;
}

export interface PlayerRanking {
  playerId: string;
  score: number;
  rank: number;
  confidence: number;
}

export class TournamentEngine {
  private generateId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  private shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private calculateConfidence(playerId: string, completedMatchups: Matchup[]): number {
    const playerMatchups = completedMatchups.filter(
      m => m.player1Id === playerId || m.player2Id === playerId
    );
    return Math.min(1, playerMatchups.length / 5);
  }

  generateMatchups(playerIds: string[]): Matchup[] {
    if (playerIds.length < 2) return [];

    const shuffledPlayers = this.shuffle(playerIds);
    const matchups: Matchup[] = [];
    const targetMatchups = Math.ceil(playerIds.length * 1.5);

    // Generate round-robin style matchups
    for (let round = 0; round < Math.ceil(targetMatchups / (playerIds.length / 2)); round++) {
      const roundPlayers = [...shuffledPlayers];
      
      while (roundPlayers.length >= 2) {
        const player1 = roundPlayers.shift()!;
        const player2 = roundPlayers.shift()!;
        
        matchups.push({
          id: this.generateId(),
          player1Id: player1,
          player2Id: player2
        });

        if (matchups.length >= targetMatchups) break;
      }
      
      if (matchups.length >= targetMatchups) break;
    }

    return this.shuffle(matchups);
  }

  calculateFinalRankings(
    tournamentPlayers: Map<string, TournamentPlayer>, 
    completedMatchups: Matchup[]
  ): PlayerRanking[] {
    const playerScores = new Map<string, number>();
    
    // Initialize scores (starting Elo rating)
    for (const playerId of tournamentPlayers.keys()) {
      playerScores.set(playerId, 1500);
    }

    // Update scores based on matchup results
    for (const matchup of completedMatchups) {
      if (!matchup.winnerId) continue;

      const loserId = matchup.player1Id === matchup.winnerId 
        ? matchup.player2Id 
        : matchup.player1Id;

      const winnerScore = playerScores.get(matchup.winnerId) || 1500;
      const loserScore = playerScores.get(loserId) || 1500;

      // Simple Elo calculation
      const k = 32; // K-factor
      const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
      const expectedLoser = 1 - expectedWinner;

      playerScores.set(
        matchup.winnerId,
        winnerScore + k * (1 - expectedWinner)
      );
      playerScores.set(
        loserId,
        loserScore + k * (0 - expectedLoser)
      );
    }

    // Convert to rankings
    const newRankings = Array.from(playerScores.entries())
      .map(([playerId, score]) => ({
        playerId,
        score,
        rank: 0,
        confidence: this.calculateConfidence(playerId, completedMatchups)
      }))
      .sort((a, b) => b.score - a.score);

    // Assign ranks and normalize scores to 1-10 scale
    const minScore = Math.min(...newRankings.map(r => r.score));
    const maxScore = Math.max(...newRankings.map(r => r.score));
    const range = maxScore - minScore;

    newRankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
      const normalizedScore = range > 0 
        ? 1 + 9 * (ranking.score - minScore) / range 
        : 5;
      ranking.score = Math.round(normalizedScore);
    });

    return newRankings;
  }

  initializeTournamentPlayers(players: Player[]): Map<string, TournamentPlayer> {
    const tPlayers = new Map<string, TournamentPlayer>();
    players.forEach(player => {
      const id = this.generateId();
      tPlayers.set(id, {
        id,
        name: `${player.first_name} ${player.last_name}`,
        originalPlayer: player
      });
    });
    return tPlayers;
  }

  applyRankingsToPlayers(
    rankings: PlayerRanking[], 
    tournamentPlayers: Map<string, TournamentPlayer>, 
    originalPlayers: Player[]
  ): Player[] {
    return originalPlayers.map(player => {
      const tournamentPlayer = Array.from(tournamentPlayers.values()).find(
        tp => tp.originalPlayer.id === player.id
      );
      
      if (tournamentPlayer) {
        const ranking = rankings.find(r => r.playerId === tournamentPlayer.id);
        if (ranking) {
          return { ...player, skill: ranking.score };
        }
      }
      
      return player;
    });
  }
} 