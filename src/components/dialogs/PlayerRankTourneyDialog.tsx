'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Trophy, Users, Target, BarChart3, Download, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Player } from '@/types/PlayerTypes';

// Core data models for the tournament
interface TournamentPlayer {
  id: string;
  name: string;
  originalPlayer: Player;
}

interface Matchup {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId?: string;
  timestamp?: Date;
}

interface PlayerRanking {
  playerId: string;
  rank: number;
  score: number;
  confidence: number;
}

interface PlayerRankTourneyDialogProps {
    isOpen: boolean;
    onClose: () => void;
    players: Player[];
    onApplyRankings?: (updatedPlayers: Player[]) => void;
}

export default function PlayerRankTourneyDialog({ 
    isOpen, 
    onClose, 
    players,
    onApplyRankings
}: PlayerRankTourneyDialogProps) {
    const [tournamentPlayers, setTournamentPlayers] = useState<Map<string, TournamentPlayer>>(new Map());
    const [matchups, setMatchups] = useState<Matchup[]>([]);
    const [currentMatchup, setCurrentMatchup] = useState<Matchup | null>(null);
    const [rankings, setRankings] = useState<PlayerRanking[]>([]);
    const [phase, setPhase] = useState<'setup' | 'comparing' | 'results'>('setup');
    const [totalMatchups, setTotalMatchups] = useState(0);
    const [currentResultsPage, setCurrentResultsPage] = useState(1);
    const resultsPerPage = 10;

    const generateId = useCallback((): string => {
        return Math.random().toString(36).substring(2, 10);
    }, []);

    const shuffle = useCallback(<T,>(array: T[]): T[] => {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }, []);

    const calculateConfidence = useCallback((playerId: string, completedMatchups: Matchup[]): number => {
        const playerMatchups = completedMatchups.filter(
            m => m.player1Id === playerId || m.player2Id === playerId
        );
        // Simple confidence: more games = higher confidence
        return Math.min(1, playerMatchups.length / 5);
    }, []);

    const generateMatchups = useCallback((playerIds: string[]): Matchup[] => {
        const n = playerIds.length;
        const matchups: Matchup[] = [];
        
        // Phase 1: Initial random pairings (n/2 matchups)
        const shuffledIds = shuffle([...playerIds]);
        for (let i = 0; i < n; i += 2) {
            if (i + 1 < n) {
                matchups.push({
                    id: generateId(),
                    player1Id: shuffledIds[i],
                    player2Id: shuffledIds[i + 1]
                });
            }
        }
        
        // Phase 2: Additional strategic matchups (2n matchups)
        // For now, just add more random pairings
        for (let round = 0; round < 2; round++) {
            const roundShuffled = shuffle([...playerIds]);
            for (let i = 0; i < n; i += 2) {
                if (i + 1 < n) {
                    matchups.push({
                        id: generateId(),
                        player1Id: roundShuffled[i],
                        player2Id: roundShuffled[i + 1]
                    });
                }
            }
        }
        
        return shuffle(matchups);
    }, [shuffle, generateId]);

    const calculateFinalRankings = useCallback((completedMatchups: Matchup[]) => {
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
                confidence: calculateConfidence(playerId, completedMatchups)
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

        setRankings(newRankings);
        setPhase('results');
    }, [tournamentPlayers, calculateConfidence]);

    const initializeTournament = useCallback(() => {
        if (players.length < 2) return;

        // Convert players to tournament format
        const tPlayers = new Map<string, TournamentPlayer>();
        players.forEach(player => {
            const id = generateId();
            tPlayers.set(id, {
                id,
                name: `${player.first_name} ${player.last_name}`,
                originalPlayer: player
            });
        });

        setTournamentPlayers(tPlayers);
        
        // Generate initial matchups
        const newMatchups = generateMatchups(Array.from(tPlayers.keys()));
        setMatchups(newMatchups);
        setTotalMatchups(newMatchups.length);
        setCurrentMatchup(newMatchups[0] || null);
        setPhase('comparing');
        setRankings([]);
    }, [players, generateId, generateMatchups]);

    const recordResult = useCallback((winnerId: string) => {
        if (!currentMatchup) return;

        // Update the current matchup with the winner
        const updatedMatchup = {
            ...currentMatchup,
            winnerId,
            timestamp: new Date()
        };

        // Update matchups list
        const updatedMatchups = matchups.map(m => 
            m.id === currentMatchup.id ? updatedMatchup : m
        );
        setMatchups(updatedMatchups);

        // Move to next matchup
        const remainingMatchups = updatedMatchups.filter(m => !m.winnerId);
        if (remainingMatchups.length > 0) {
            setCurrentMatchup(remainingMatchups[0]);
        } else {
            // Tournament complete, calculate final rankings
            calculateFinalRankings(updatedMatchups);
        }
    }, [currentMatchup, matchups, calculateFinalRankings]);

    const resetTournament = useCallback(() => {
        setPhase('setup');
        setMatchups([]);
        setCurrentMatchup(null);
        setRankings([]);
        setTournamentPlayers(new Map());
        setCurrentResultsPage(1);
    }, []);

    const applyRankingsToRoster = useCallback(() => {
        if (!onApplyRankings) return;

        // Create updated players with new skill levels from tournament results
        const updatedPlayers = players.map(player => {
            // Find the tournament result for this player
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

        onApplyRankings(updatedPlayers);
        
        // Close dialog and reset tournament
        resetTournament();
        onClose();
    }, [rankings, tournamentPlayers, players, onApplyRankings, resetTournament, onClose]);

    const handleClose = useCallback(() => {
        resetTournament();
        onClose();
    }, [resetTournament, onClose]);

    // Initialize tournament when dialog opens
    React.useEffect(() => {
        if (isOpen && players.length > 1) {
            initializeTournament();
        }
    }, [isOpen, players, initializeTournament]);

    const completedMatchups = useMemo(() => 
        matchups.filter(m => m.winnerId !== undefined).length, 
        [matchups]
    );

    const progressPercentage = useMemo(() => 
        totalMatchups > 0 ? (completedMatchups / totalMatchups) * 100 : 0, 
        [completedMatchups, totalMatchups]
    );

    const paginatedRankings = useMemo(() => {
        const start = (currentResultsPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        return rankings.slice(start, end);
    }, [rankings, currentResultsPage, resultsPerPage]);

    const totalResultsPages = useMemo(() => 
        Math.ceil(rankings.length / resultsPerPage), 
        [rankings.length, resultsPerPage]
    );

    if (!isOpen) return null;

    // Insufficient players
    if (players.length < 2) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[500px] glass border-white/30">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    Player Rank Tourney
                                </DialogTitle>
                                <DialogDescription className="text-gray-600">
                                    Not enough players to start tournament
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="py-8 text-center">
                        <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                            You need at least 2 players to run a ranking tournament.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Add more players to your roster first.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleClose} variant="outline">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] glass border-white/30">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-gray-900">
                                Player Rank Tourney
                            </DialogTitle>
                            <DialogDescription className="text-gray-600">
                                {phase === 'setup' && 'Get ready to rank your players'}
                                {phase === 'comparing' && 'Choose the better player in each matchup'}
                                {phase === 'results' && 'Tournament complete! Here are your rankings'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {/* Setup Phase */}
                    {phase === 'setup' && (
                        <div className="text-center space-y-6">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                                <Target className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Ready to Rank {players.length} Players
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    You'll see approximately {Math.ceil(players.length * 1.5)} head-to-head matchups.
                                    Simply click on the better player in each comparison.
                                </p>
                            </div>
                            <Button onClick={initializeTournament} className="w-full">
                                Start Tournament
                            </Button>
                        </div>
                    )}

                    {/* Comparing Phase */}
                    {phase === 'comparing' && currentMatchup && (
                        <div className="space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Progress</span>
                                    <span>{completedMatchups} / {totalMatchups} comparisons</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>

                            {/* Matchup */}
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                    Who is the better player?
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    {/* Player 1 */}
                                    <button
                                        onClick={() => recordResult(currentMatchup.player1Id)}
                                        className="card-modern p-6 hover:ring-2 hover:ring-blue-500 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <span className="text-white font-bold text-lg">
                                                    {tournamentPlayers.get(currentMatchup.player1Id)?.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900">
                                                {tournamentPlayers.get(currentMatchup.player1Id)?.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skill: {tournamentPlayers.get(currentMatchup.player1Id)?.originalPlayer.skill}
                                            </p>
                                        </div>
                                    </button>

                                    {/* VS */}
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">VS</div>
                                    </div>

                                    {/* Player 2 */}
                                    <button
                                        onClick={() => recordResult(currentMatchup.player2Id)}
                                        className="card-modern p-6 hover:ring-2 hover:ring-blue-500 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <span className="text-white font-bold text-lg">
                                                    {tournamentPlayers.get(currentMatchup.player2Id)?.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900">
                                                {tournamentPlayers.get(currentMatchup.player2Id)?.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skill: {tournamentPlayers.get(currentMatchup.player2Id)?.originalPlayer.skill}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Phase */}
                    {phase === 'results' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tournament Complete!
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Rankings based on {completedMatchups} head-to-head comparisons
                                </p>
                            </div>

                            {/* Rankings Table */}
                            <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-white/40 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Player
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Skill Level
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200/50">
                                        {paginatedRankings.map((ranking) => {
                                            const player = tournamentPlayers.get(ranking.playerId);
                                            if (!player) return null;

                                            const globalIndex = ranking.rank - 1; // Convert to 0-based for medal logic

                                            return (
                                                <tr key={ranking.playerId} className="hover:bg-gray-100/50">
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                                                globalIndex === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                globalIndex === 1 ? 'bg-gray-100 text-gray-800' :
                                                                globalIndex === 2 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {ranking.rank}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">
                                                            {player.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                                            {ranking.score}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalResultsPages > 1 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-500">
                                        Showing {Math.min(((currentResultsPage - 1) * resultsPerPage) + 1, rankings.length)}
                                        - {Math.min(currentResultsPage * resultsPerPage, rankings.length)} of {rankings.length} players
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => setCurrentResultsPage(Math.max(1, currentResultsPage - 1))} 
                                            disabled={currentResultsPage === 1}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <span className="text-sm font-medium px-3">
                                            {currentResultsPage} / {totalResultsPages}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => setCurrentResultsPage(Math.min(totalResultsPages, currentResultsPage + 1))} 
                                            disabled={currentResultsPage === totalResultsPages}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        {phase === 'results' && (
                            <>
                                {onApplyRankings && (
                                    <Button onClick={applyRankingsToRoster} variant="primary" size="sm">
                                        <Trophy className="w-4 h-4 mr-2" />
                                        Apply to Roster
                                    </Button>
                                )}
                                <Button onClick={resetTournament} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    New Tournament
                                </Button>
                            </>
                        )}
                    </div>
                    <Button onClick={handleClose} variant="outline">
                        {phase === 'results' ? 'Close' : 'Cancel'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}