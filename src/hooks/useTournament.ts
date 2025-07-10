import { useState, useCallback, useMemo } from 'react';
import { type Player } from '@/types/PlayerTypes';
import { 
  TournamentEngine, 
  type TournamentPlayer, 
  type Matchup, 
  type PlayerRanking 
} from '@/lib/tournamentEngine';

type TournamentPhase = 'setup' | 'comparing' | 'results';

export interface TournamentState {
  phase: TournamentPhase;
  tournamentPlayers: Map<string, TournamentPlayer>;
  matchups: Matchup[];
  currentMatchup: Matchup | null;
  rankings: PlayerRanking[];
  totalMatchups: number;
  completedMatchups: number;
  progressPercentage: number;
  initializeTournament: () => void;
  recordResult: (winnerId: string) => void;
  resetTournament: () => void;
  applyRankingsToRoster: () => Player[];
}

export function useTournament(
  players: Player[],
  onApplyRankings?: (updatedPlayers: Player[]) => void
): TournamentState {
  const [tournamentPlayers, setTournamentPlayers] = useState<Map<string, TournamentPlayer>>(new Map());
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [currentMatchup, setCurrentMatchup] = useState<Matchup | null>(null);
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [phase, setPhase] = useState<TournamentPhase>('setup');
  const [totalMatchups, setTotalMatchups] = useState(0);

  const engine = useMemo(() => new TournamentEngine(), []);

  const completedMatchups = useMemo(() => 
    matchups.filter(m => m.winnerId !== undefined).length, 
    [matchups]
  );

  const progressPercentage = useMemo(() => 
    totalMatchups > 0 ? (completedMatchups / totalMatchups) * 100 : 0, 
    [completedMatchups, totalMatchups]
  );

  const initializeTournament = useCallback(() => {
    if (players.length < 2) return;

    const tPlayers = engine.initializeTournamentPlayers(players);
    setTournamentPlayers(tPlayers);
    
    const newMatchups = engine.generateMatchups(Array.from(tPlayers.keys()));
    setMatchups(newMatchups);
    setTotalMatchups(newMatchups.length);
    setCurrentMatchup(newMatchups[0] || null);
    setPhase('comparing');
    setRankings([]);
  }, [players, engine]);

  const calculateFinalRankings = useCallback((completedMatchups: Matchup[]) => {
    const newRankings = engine.calculateFinalRankings(tournamentPlayers, completedMatchups);
    setRankings(newRankings);
    setPhase('results');
  }, [tournamentPlayers, engine]);

  const recordResult = useCallback((winnerId: string) => {
    if (!currentMatchup) return;

    const updatedMatchup = {
      ...currentMatchup,
      winnerId,
      timestamp: new Date()
    };

    const updatedMatchups = matchups.map(m => 
      m.id === currentMatchup.id ? updatedMatchup : m
    );
    setMatchups(updatedMatchups);

    const remainingMatchups = updatedMatchups.filter(m => !m.winnerId);
    if (remainingMatchups.length > 0) {
      setCurrentMatchup(remainingMatchups[0]);
    } else {
      calculateFinalRankings(updatedMatchups);
    }
  }, [currentMatchup, matchups, calculateFinalRankings]);

  const resetTournament = useCallback(() => {
    setPhase('setup');
    setMatchups([]);
    setCurrentMatchup(null);
    setRankings([]);
    setTournamentPlayers(new Map());
  }, []);

  const applyRankingsToRoster = useCallback((): Player[] => {
    const updatedPlayers = engine.applyRankingsToPlayers(rankings, tournamentPlayers, players);
    
    if (onApplyRankings) {
      onApplyRankings(updatedPlayers);
    }
    
    return updatedPlayers;
  }, [rankings, tournamentPlayers, players, onApplyRankings, engine]);

  return {
    phase,
    tournamentPlayers,
    matchups,
    currentMatchup,
    rankings,
    totalMatchups,
    completedMatchups,
    progressPercentage,
    initializeTournament,
    recordResult,
    resetTournament,
    applyRankingsToRoster,
  };
} 