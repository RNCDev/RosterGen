'use client';

import { useState } from 'react';
import Papa from 'papaparse';

import Sidebar from '@/components/Sidebar';
import PlayersView from '@/components/PlayersView';
import TeamsView from '@/components/TeamsView';
import ErrorAlert from '@/components/ErrorAlert';

import { type Player, type Teams } from '@/types/PlayerTypes';

export default function Home() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'players' | 'roster'>('players');
    const [teams, setTeams] = useState<Teams>({
        red: { forwards: [], defensemen: [] },
        white: { forwards: [], defensemen: [] },
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const formattedPlayers = results.data.map((player: any) => ({
                        first_name: player.firstName,
                        last_name: player.lastName,
                        skill: parseInt(player.skill),
                        is_defense: player.defense === '1',
                        is_attending: player.attending === '1'
                    }));
                    setPlayers(formattedPlayers);
                    setLoading(false);
                } catch (err) {
                    setError('Error processing file: Please check the CSV format');
                    setLoading(false);
                }
            },
            error: () => {
                setError('Error parsing file: Please ensure it is a valid CSV');
                setLoading(false);
            }
        });
    };

    const generateTeams = () => {
        const attendingPlayers = players.filter(p => p.is_attending);
        const forwards = attendingPlayers.filter(p => !p.is_defense);
        const defensemen = attendingPlayers.filter(p => p.is_defense);

        const sortedForwards = [...forwards].sort((a, b) => b.skill - a.skill);
        const sortedDefensemen = [...defensemen].sort((a, b) => b.skill - a.skill);

        const newTeams: Teams = {
            red: { forwards: [], defensemen: [] },
            white: { forwards: [], defensemen: [] }
        };

        sortedForwards.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.forwards.push(player);
            } else {
                newTeams.white.forwards.push(player);
            }
        });

        sortedDefensemen.forEach((player, index) => {
            if (index % 2 === 0) {
                newTeams.red.defensemen.push(player);
            } else {
                newTeams.white.defensemen.push(player);
            }
        });

        setTeams(newTeams);
        setActiveTab('roster');
    };

    return (
        <div className="h-screen flex bg-gray-50">
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
            />
            
            <main className="flex-1 p-8 overflow-auto">
                <div className="max-w-6xl mx-auto">
                    <ErrorAlert message={error} />
                    
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        {activeTab === 'players' ? (
                            <PlayersView 
                                players={players}
                                loading={loading}
                                generateTeams={generateTeams}
                                handleFileUpload={handleFileUpload}
                            />
                        ) : (
                            <TeamsView 
                                teams={teams}
                                generateTeams={generateTeams}
                                hasPlayers={players.length > 0}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}