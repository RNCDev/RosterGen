'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Trophy, Users, Target, BarChart3, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Player } from '@/types/PlayerTypes';
import { useTournament } from '@/hooks/useTournament';

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
    const [currentResultsPage, setCurrentResultsPage] = useState(1);
    const resultsPerPage = 10;

    const tournament = useTournament(players, onApplyRankings);

    // Initialize tournament when dialog opens
    useEffect(() => {
        if (isOpen && players.length > 1) {
            tournament.initializeTournament();
        }
    }, [isOpen, players.length]);

    const paginatedRankings = useMemo(() => {
        const start = (currentResultsPage - 1) * resultsPerPage;
        const end = start + resultsPerPage;
        return tournament.rankings.slice(start, end);
    }, [tournament.rankings, currentResultsPage, resultsPerPage]);

    const totalResultsPages = useMemo(() => 
        Math.ceil(tournament.rankings.length / resultsPerPage), 
        [tournament.rankings.length, resultsPerPage]
    );

    const handleClose = () => {
        tournament.resetTournament();
        onClose();
    };

    const handleApplyRankings = () => {
        tournament.applyRankingsToRoster();
        tournament.resetTournament();
        onClose();
    };

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
                                {tournament.phase === 'setup' && 'Get ready to rank your players'}
                                {tournament.phase === 'comparing' && 'Choose the better player in each matchup'}
                                {tournament.phase === 'results' && 'Tournament complete! Here are your rankings'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    {/* Setup Phase */}
                    {tournament.phase === 'setup' && (
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
                            <Button onClick={tournament.initializeTournament} className="w-full">
                                Start Tournament
                            </Button>
                        </div>
                    )}

                    {/* Comparing Phase */}
                    {tournament.phase === 'comparing' && tournament.currentMatchup && (
                        <div className="space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Progress</span>
                                    <span>{tournament.completedMatchups} / {tournament.totalMatchups} comparisons</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${tournament.progressPercentage}%` }}
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
                                        onClick={() => tournament.recordResult(tournament.currentMatchup!.player1Id)}
                                        className="card-modern p-6 hover:ring-2 hover:ring-blue-500 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <span className="text-white font-bold text-lg">
                                                    {tournament.tournamentPlayers.get(tournament.currentMatchup.player1Id)?.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900">
                                                {tournament.tournamentPlayers.get(tournament.currentMatchup.player1Id)?.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skill: {tournament.tournamentPlayers.get(tournament.currentMatchup.player1Id)?.originalPlayer.skill}
                                            </p>
                                        </div>
                                    </button>

                                    {/* VS */}
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-400">VS</div>
                                    </div>

                                    {/* Player 2 */}
                                    <button
                                        onClick={() => tournament.recordResult(tournament.currentMatchup!.player2Id)}
                                        className="card-modern p-6 hover:ring-2 hover:ring-blue-500 hover:bg-blue-50/50 transition-all group"
                                    >
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                                <span className="text-white font-bold text-lg">
                                                    {tournament.tournamentPlayers.get(tournament.currentMatchup.player2Id)?.name.split(' ').map(n => n[0]).join('')}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-gray-900">
                                                {tournament.tournamentPlayers.get(tournament.currentMatchup.player2Id)?.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Skill: {tournament.tournamentPlayers.get(tournament.currentMatchup.player2Id)?.originalPlayer.skill}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Phase */}
                    {tournament.phase === 'results' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Tournament Complete!
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Rankings based on {tournament.completedMatchups} head-to-head comparisons
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
                                            const player = tournament.tournamentPlayers.get(ranking.playerId);
                                            if (!player) return null;

                                            const globalIndex = ranking.rank - 1;

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
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {player.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {ranking.score}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Pagination */}
                                {totalResultsPages > 1 && (
                                    <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-200/50 flex items-center justify-between">
                                        <div className="text-sm text-gray-700">
                                            Showing {((currentResultsPage - 1) * resultsPerPage) + 1} to {Math.min(currentResultsPage * resultsPerPage, tournament.rankings.length)} of {tournament.rankings.length} rankings
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentResultsPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentResultsPage === 1}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentResultsPage(prev => Math.min(totalResultsPages, prev + 1))}
                                                disabled={currentResultsPage === totalResultsPages}
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="space-x-2">
                    {tournament.phase === 'results' && (
                        <>
                            <Button 
                                variant="outline" 
                                onClick={tournament.resetTournament}
                                className="flex items-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Reset Tournament
                            </Button>
                            <Button onClick={handleApplyRankings}>
                                Apply Rankings to Roster
                            </Button>
                        </>
                    )}
                    <Button variant="outline" onClick={handleClose}>
                        {tournament.phase === 'results' ? 'Close' : 'Cancel'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}