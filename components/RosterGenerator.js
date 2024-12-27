// app/components/RosterGenerator.js
import React, { useEffect, useState } from 'react';
import { usePlayerManagement } from '../hooks/usePlayerManagement';
import { useTeamGeneration } from '../hooks/useTeamGeneration';
import { PlayerTable } from './players/PlayerTable';
import { PlayerUpload } from './players/PlayerUpload';
import { TeamRoster } from './teams/TeamRoster';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { ErrorMessage } from './shared/ErrorMessage';
import { TabNavigation } from './shared/TabNavigation';

export default function RosterGenerator() {
  const [activeTab, setActiveTab] = useState('players');
  const [teamStats, setTeamStats] = useState(null);
  
  const {
    players,
    loading: playersLoading,
    error: playersError,
    fetchPlayers,
    updatePlayer,
    handleFileUpload
  } = usePlayerManagement();

  const {
    teams,
    loading: teamsLoading,
    error: teamsError,
    generateAndSaveTeams
  } = useTeamGeneration();

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleGenerateTeams = async () => {
    const result = await generateAndSaveTeams(players);
    if (result) {
      setTeamStats(result.stats);
      setActiveTab('roster');
    }
  };

  const loading = playersLoading || teamsLoading;
  const error = playersError || teamsError;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Hockey Roster Generator</h1>
      
      <ErrorMessage message={error} />
      
      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {loading ? (
        <LoadingSpinner />
      ) : activeTab === 'players' ? (
        <div className="mt-4">
          <PlayerUpload onUpload={handleFileUpload} />
          <PlayerTable 
            players={players}
            onUpdatePlayer={updatePlayer}
          />
          {players.length > 0 && (
            <button
              onClick={handleGenerateTeams}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md
                hover:bg-blue-700 transition-colors"
            >
              Generate Teams
            </button>
          )}
        </div>
      ) : (
        <TeamRoster 
          teams={teams}
          stats={teamStats}
        />
      )}
    </div>
  );
}
