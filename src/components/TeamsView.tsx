'use client';

import React, { useRef } from 'react';
import { type Teams, type Player } from '@/types/PlayerTypes';
import { Clipboard, Users, BarChart2, Hash } from 'lucide-react';
import _ from 'lodash';
import { Button } from '@/components/ui/Button';

interface TeamsViewProps {
    teams: Teams;
    teamNames: { team1: string; team2: string };
    setTeamNames: (names: { team1: string; team2: string }) => void;
}

// Helper to calculate team stats
const calculateStats = (team: Teams['red']) => {
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
        averageSkill: _.round(_.meanBy(allPlayers, 'skill'), 1),
        totalSkill: _.sumBy(allPlayers, 'skill'),
    };
};

// Internal component for displaying a single team
const TeamCard = ({ name, team, onNameChange }: { name: string, team: Teams['red'], onNameChange: (newName: string) => void }) => {
    const stats = calculateStats(team);
    
    return (
        <div className="card-neo p-6 flex-grow">
            <input
                type="text"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-slate-300 outline-none w-full mb-4"
            />
            <div className="flex items-center justify-around text-center mb-6 text-sm text-slate-600">
                <div className="flex flex-col items-center">
                    <Users className="h-5 w-5 mb-1" />
                    <span className="font-semibold">{stats.totalPlayers}</span>
                    <span>Players</span>
                </div>
                <div className="flex flex-col items-center">
                    <BarChart2 className="h-5 w-5 mb-1" />
                    <span className="font-semibold">{stats.averageSkill}</span>
                    <span>Avg. Skill</span>
                </div>
                <div className="flex flex-col items-center">
                    <Hash className="h-5 w-5 mb-1" />
                    <span className="font-semibold">{stats.totalSkill}</span>
                    <span>Total Skill</span>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Forwards ({team.forwards.length})</h4>
                <ul className="space-y-2">
                    {team.forwards.map(p => <li key={p.id} className="flex justify-between"><span>{p.first_name} {p.last_name}</span> <span className="font-mono text-sm text-slate-500">{p.skill}</span></li>)}
                </ul>
            </div>
            
            <div className="mt-6">
                <h4 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-3">Defense ({team.defensemen.length})</h4>
                 <ul className="space-y-2">
                    {team.defensemen.map(p => <li key={p.id} className="flex justify-between"><span>{p.first_name} {p.last_name}</span> <span className="font-mono text-sm text-slate-500">{p.skill}</span></li>)}
                </ul>
            </div>
        </div>
    );
};


export default function TeamsView({ teams, teamNames, setTeamNames }: TeamsViewProps) {
    const teamsContainerRef = useRef<HTMLDivElement>(null);

    const handleCopyToClipboard = () => {
        if (teamsContainerRef.current) {
            // A more robust solution would use html-to-image
            const textToCopy = teamsContainerRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                alert('Teams copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy teams: ', err);
                alert('Failed to copy teams.');
            });
        }
    };
    
    const totalPlayers = teams.red.forwards.length + teams.red.defensemen.length + teams.white.forwards.length + teams.white.defensemen.length;

    if (totalPlayers === 0) {
        return (
            <div className="card-neo p-12 flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-semibold text-slate-900">No Teams Generated</h3>
                <p className="mt-1 text-sm text-slate-500">
                    Go to the <span className="font-semibold">Players</span> tab and click 'Generate Teams' to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-end gap-4">
                <Button onClick={handleCopyToClipboard} variant="outline">
                    <Clipboard size={16} className="mr-2" /> Copy to Clipboard
                </Button>
            </div>
            
            <div ref={teamsContainerRef} className="flex flex-col lg:flex-row gap-6">
                <TeamCard
                    name={teamNames.team1}
                    team={teams.red}
                    onNameChange={(name) => setTeamNames({ ...teamNames, team1: name })}
                />
                <TeamCard
                    name={teamNames.team2}
                    team={teams.white}
                    onNameChange={(name) => setTeamNames({ ...teamNames, team2: name })}
                />
            </div>
        </div>
    );
} 