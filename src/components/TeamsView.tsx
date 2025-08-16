'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { type Teams, type Player, type Team, type EventWithStats } from '@/types/PlayerTypes';
import { Clipboard, Users, BarChart2, Hash, Trophy, Zap, Shield, Target, RefreshCw, Save, CheckCircle, Loader2, ArrowRightLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { round, meanBy, sumBy, cloneDeep, remove } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TeamsViewProps {
    teams: Teams;
    teamNames: { team1: string; team2: string };
    setTeams: (teams: Teams) => void;
    setTeamNames: (names: { team1: string; team2: string }) => void;
    onGenerateTeams: () => void;
    attendingPlayerCount: number;
    isGenerating: boolean;
    onBack: () => void;
    onSaveTeamNames: (alias1: string, alias2: string) => Promise<void>;
    selectedEvent: EventWithStats | null;
    onSaveTeamsForEvent: (eventId: number, teams: Teams, teamNames: { team1: string, team2: string }) => Promise<void>;
}

// Helper to calculate team stats (memoized)
const calculateStats = (team: Team) => {
    const allPlayers = [...team.forwards, ...team.defensemen];
    if (allPlayers.length === 0) {
        return {
            totalPlayers: 0,
            averageSkill: 0,
            totalSkill: 0,
        };
    }
    return {
        totalPlayers: allPlayers.length,
        averageSkill: round(meanBy(allPlayers, 'skill'), 1),
        totalSkill: sumBy(allPlayers, 'skill'),
    };
};

// Internal component for displaying a single team
const TeamCard = ({ 
    name, 
    team, 
    onNameChange, 
    teamColor,
    onPlayerMove,
    showSkillLevels
}: { 
    name: string; 
    team: Teams['red']; 
    onNameChange: (newName: string) => void;
    teamColor: 'red' | 'blue';
    onPlayerMove: (player: Player, position: 'forwards' | 'defensemen') => void;
    showSkillLevels: boolean;
}) => {
    const stats = calculateStats(team);
    
    const colorClasses = {
        red: {
            gradient: 'from-red-500 to-rose-600',
            bgGradient: 'from-red-50 to-rose-50',
            border: 'border-red-200/30',
            accent: 'text-red-600',
            headerBg: 'bg-red-100',
            forwardBg: 'bg-orange-50',
            defenseBg: 'bg-purple-50'
        },
        blue: {
            gradient: 'from-blue-500 to-indigo-600',
            bgGradient: 'from-blue-50 to-indigo-50',
            border: 'border-blue-200/30',
            accent: 'text-blue-600',
            headerBg: 'bg-blue-100',
            forwardBg: 'bg-orange-50',
            defenseBg: 'bg-purple-50'
        }
    };
    
    const colors = colorClasses[teamColor];
    
    return (
        <div className={`bg-white/70 backdrop-blur-sm rounded-lg border-2 ${colors.border} overflow-hidden`}>
            {/* Compact Team Header */}
            <div className={`${colors.headerBg} px-4 py-2 border-b ${colors.border}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br ${colors.gradient} rounded-lg flex items-center justify-center shadow-sm`}>
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            onBlur={() => onNameChange(name)}
                            className={`text-lg font-bold bg-transparent border-b border-transparent focus:border-gray-400 outline-none ${colors.accent}`}
                            placeholder="Team Name"
                        />
                    </div>
                </div>
                {/* Stats row */}
                <div className="flex justify-end mt-1 text-sm">
                    {showSkillLevels && (
                        <span className="text-gray-500 mr-3">avg {stats.averageSkill.toFixed(1)}</span>
                    )}
                    <span className="font-bold text-gray-700">{team.forwards.length}F {team.defensemen.length}D</span>
                </div>
            </div>
            
            {/* Compact Player Lists */}
            <div className="p-3 space-y-3">
                {/* Forwards - Compact List */}
                {team.forwards.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-orange-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                                Forwards ({team.forwards.length})
                            </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {team.forwards.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-2 py-1 bg-orange-50/70 rounded text-xs group">
                                    <span className="font-medium text-gray-800 truncate">{p.first_name} {p.last_name}</span>
                                    <div className="flex items-center pl-1">
                                        {showSkillLevels && (
                                            <span className="text-gray-500 text-xs font-medium flex-shrink-0 w-3 text-right">
                                                {p.skill}
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => onPlayerMove(p, 'forwards')}
                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Move Player"
                                        >
                                            <ArrowRightLeft size={14} className="text-gray-500 hover:text-blue-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Defense - Compact List */}
                {team.defensemen.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-600" />
                            <h4 className="text-sm font-semibold text-gray-700">
                                Defense ({team.defensemen.length})
                            </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                            {team.defensemen.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-2 py-1 bg-purple-50/70 rounded text-xs group">
                                    <span className="font-medium text-gray-800 truncate">{p.first_name} {p.last_name}</span>
                                    <div className="flex items-center pl-1">
                                        {showSkillLevels && (
                                            <span className="text-gray-500 text-xs font-medium flex-shrink-0 w-3 text-right">
                                                {p.skill}
                                            </span>
                                        )}
                                        <button 
                                            onClick={() => onPlayerMove(p, 'defensemen')}
                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Move Player"
                                        >
                                            <ArrowRightLeft size={14} className="text-gray-500 hover:text-blue-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Empty State */}
                {team.forwards.length === 0 && team.defensemen.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">No players assigned</div>
                )}
            </div>
        </div>
    );
};

const TeamsView = React.memo(function TeamsView({ teams, teamNames, setTeams, setTeamNames, onGenerateTeams, attendingPlayerCount, isGenerating, onBack, onSaveTeamNames, selectedEvent, onSaveTeamsForEvent }: TeamsViewProps) {
    const [isSavingTeams, setIsSavingTeams] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [showSkillLevels, setShowSkillLevels] = useState(false);
    const { toast } = useToast();

    const formatTeamsAsText = useCallback(() => {
        const team1Data = teams[teamNames.team1.toLowerCase()];
        const team2Data = teams[teamNames.team2.toLowerCase()];
        
        if (!team1Data || !team2Data) return '';

        const formatPlayerList = (players: Player[], position: string) => {
            if (players.length === 0) return '';
            
            const playerLines = players.map(player => {
                const skillPart = showSkillLevels ? ` (${player.skill})` : '';
                return `  - ${player.first_name} ${player.last_name}${skillPart}`;
            });
            
            return `${position} [${players.length}]\n${playerLines.join('\n')}`;
        };

        const formatTeam = (teamName: string, team: Team) => {
            const stats = calculateStats(team);
            
            let result = `${teamName} [${stats.totalPlayers} players]\n`;
            result += `---\n`;
            
            if (team.forwards.length > 0) {
                result += formatPlayerList(team.forwards, 'Forwards') + '\n';
            }
            
            if (team.defensemen.length > 0) {
                result += formatPlayerList(team.defensemen, 'Defense') + '\n';
            }
            
            return result;
        };

        const team1Text = formatTeam(teamNames.team1, team1Data);
        const team2Text = formatTeam(teamNames.team2, team2Data);
        
        const totalPlayers = team1Data.forwards.length + team1Data.defensemen.length + 
                            team2Data.forwards.length + team2Data.defensemen.length;
        
        // Format the date more nicely
        const formatDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'UTC'
            });
        };
        
        const eventText = selectedEvent ? `${selectedEvent.name}\n` : '';
        const dateText = selectedEvent && selectedEvent.event_date ? 
            `${formatDate(selectedEvent.event_date.toString())}\n` : '';
        
        return `Team Roster\n` +
               `${eventText}${dateText}` +
               `Total Players: ${totalPlayers}\n\n` +
               `${team1Text}\n=========\n\n${team2Text}\n========`;

    }, [teams, teamNames, showSkillLevels, selectedEvent]);

    const handleCopyToClipboard = useCallback(async () => {
        try {
            const textContent = formatTeamsAsText();
            
            if (!textContent) {
                toast({ title: 'Error', description: 'No team data to copy.', variant: 'destructive' });
                return;
            }

            // Modern clipboard API (preferred)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textContent);
                toast({ title: 'Success', description: 'Team rosters copied to clipboard!' });
            } 
            // Fallback for older browsers
            else {
                const textArea = document.createElement('textarea');
                textArea.value = textContent;
                textArea.style.position = 'fixed';
                textArea.style.top = '-1000px';
                textArea.style.left = '-1000px';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        toast({ title: 'Success', description: 'Team rosters copied to clipboard!' });
                    } else {
                        throw new Error('Copy command failed');
                    }
                } catch (err) {
                    console.error('Fallback copy failed:', err);
                    toast({ title: 'Error', description: 'Failed to copy to clipboard.', variant: 'destructive' });
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        } catch (error) {
            console.error('Copy to clipboard failed:', error);
            toast({ title: 'Error', description: 'Failed to copy to clipboard.', variant: 'destructive' });
        }
    }, [formatTeamsAsText, toast]);

    const handleSaveToEvent = async () => {
        if (!selectedEvent) return;
        
        setIsSavingTeams(true);
        try {
            await onSaveTeamsForEvent(selectedEvent.id, teams, teamNames);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000); // Hide after 3 seconds
        } catch (error) {
            console.error('Failed to save teams to event:', error);
            // Could add error state here if needed
        } finally {
            setIsSavingTeams(false);
        }
    };
    
    const handlePlayerMove = useCallback((player: Player, fromTeamKey: string, fromPosition: 'forwards' | 'defensemen') => {
        const toTeamKey = Object.keys(teams).find(key => key.toLowerCase() !== fromTeamKey.toLowerCase());
        if (!toTeamKey) return;

        const updatedTeams = cloneDeep(teams);

        // Remove from source team
        remove(updatedTeams[fromTeamKey.toLowerCase()][fromPosition], p => p.id === player.id);
        
        // Add to destination team
        updatedTeams[toTeamKey.toLowerCase()][fromPosition].push(player);

        setTeams(updatedTeams);
    }, [teams, setTeams]);

    // Access teams using dynamic keys from teamNames
    const team1Data = teams[teamNames.team1.toLowerCase()];
    const team2Data = teams[teamNames.team2.toLowerCase()];

    // Ensure team data exists before calculating stats or rendering
    if (!team1Data || !team2Data) {
        // This case should ideally not happen if teams are always generated correctly,
        // but provides a safe fallback for rendering or initial state.
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="text-center p-12 card-elevated max-w-lg animate-slide-up">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="heading-secondary mb-3">Generating Teams...</h3>
                    <p className="text-gray-500 mb-6 leading-relaxed">
                        Please wait while teams are generated based on attendance.
                    </p>
                </div>
            </div>
        );
    }

    const team1Stats = useMemo(() => calculateStats(team1Data), [team1Data]);
    const team2Stats = useMemo(() => calculateStats(team2Data), [team2Data]);
    
    const { totalPlayers, skillDifference } = useMemo(() => {
        const totalPlayers = team1Data.forwards.length + team1Data.defensemen.length + team2Data.forwards.length + team2Data.defensemen.length;
        const skillDifference = Math.abs(team1Stats.totalSkill - team2Stats.totalSkill);
        return { totalPlayers, skillDifference };
    }, [team1Data, team2Data, team1Stats.totalSkill, team2Stats.totalSkill]);

    return (
        <>
            <div className="space-y-6 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span><strong className="text-gray-800">{totalPlayers}</strong> Players</span>
                        {showSkillLevels && (
                            <>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span>Skill Diff: <strong className="text-gray-800">{skillDifference}</strong></span>
                                <span className="h-4 w-px bg-gray-300"></span>
                                <span>Balance: <strong className="text-gray-800">{skillDifference <= 2 ? 'Excellent' : skillDifference <= 5 ? 'Good' : 'Fair'}</strong></span>
                            </>
                        )}
                    </div>
                    <Button variant="outline" onClick={onBack}>
                        Back to Attendance
                    </Button>
                </div>
                
                {/* Action Bar */}
                <div className="flex items-center justify-end gap-2">
                    <Button onClick={onGenerateTeams} disabled={isGenerating}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Regenerating...' : 'Regenerate Teams'}
                    </Button>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowSkillLevels(!showSkillLevels)} 
                        title={showSkillLevels ? "Hide skill levels" : "Show skill levels"}
                    >
                        {showSkillLevels ? (
                            <>
                                <EyeOff className="w-4 h-4 mr-2" />
                                Hide Skills
                            </>
                        ) : (
                            <>
                                <Eye className="w-4 h-4 mr-2" />
                                Show Skills
                            </>
                        )}
                    </Button>
                    {selectedEvent && (
                         <Button 
                            onClick={handleSaveToEvent}
                            disabled={isSavingTeams || totalPlayers === 0}
                            variant="outline"
                        >
                            {isSavingTeams ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : showSaveSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Saved!
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save to Event
                                </>
                            )}
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleCopyToClipboard}>
                        <Clipboard className="w-4 h-4 mr-2" />
                        Copy Team Rosters
                    </Button>
                </div>

                {/* Teams Grid */}
                <div className="bg-slate-50 p-6 rounded-lg overflow-visible">
                    <div className="grid md:grid-cols-2 gap-6 items-start">
                        <TeamCard
                            name={teamNames.team1}
                            team={team1Data}
                            onNameChange={(name) => {
                                setTeamNames({ ...teamNames, team1: name });
                                onSaveTeamNames(name, teamNames.team2);
                            }}
                            teamColor="red"
                            onPlayerMove={(player, position) => handlePlayerMove(player, teamNames.team1.toLowerCase(), position)}
                            showSkillLevels={showSkillLevels}
                        />
                        <TeamCard
                            name={teamNames.team2}
                            team={team2Data}
                            onNameChange={(name) => {
                                setTeamNames({ ...teamNames, team2: name });
                                onSaveTeamNames(teamNames.team1, name);
                            }}
                            teamColor="blue"
                            onPlayerMove={(player, position) => handlePlayerMove(player, teamNames.team2.toLowerCase(), position)}
                            showSkillLevels={showSkillLevels}
                        />
                    </div>
                </div>
            </div>
            
        </>
    );
});

export default TeamsView; 