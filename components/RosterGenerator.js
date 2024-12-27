// app/components/RosterGenerator.js
import React, { useEffect, useState } from 'react';
import { usePlayerManagement } from '/app/hooks/usePlayerManagement';
import { useTeamGeneration } from '/app/hooks/useTeamGeneration';
import { PlayerTable } from '/app/components/players/PlayerTable';
import { PlayerUpload } from '/app/components/players/PlayerUpload';
import { TeamRoster } from '/app/components/teams/TeamRoster';
import { LoadingSpinner } from '/app/components/shared/LoadingSpinner';
import { ErrorMessage } from '/app/components/shared/ErrorMessage';
import { TabNavigation } from '/app/components/shared/TabNavigation';

export default function RosterGenerator() {
  const [activeTab, setActiveTab] = useState('players');
  const [teamStats, setTeamStats] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  
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

  const renderActionButtons = () => {
    if (activeTab === 'players') {
      return (
        <>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showUpload ? 'Hide Upload' : 'Upload CSV'}
          </button>
          {players.length > 0 && (
            <button
              onClick={handleGenerateTeams}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent 
                rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                focus:ring-blue-500"
            >
              Generate Teams
            </button>
          )}
        </>
      );
    }
    return null;
  };

  const loading = playersLoading || teamsLoading;
  const error = playersError || teamsError;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Hockey Roster Generator</h1>
        </div>
        
        <ErrorMessage message={error} />
        
        <TabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          actionButtons={renderActionButtons()}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="px-4 py-4">
            {activeTab === 'players' && (
              <div className="space-y-6">
                {showUpload && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <PlayerUpload onUpload={handleFileUpload} />
                  </div>
                )}
                <PlayerTable 
                  players={players}
                  onUpdatePlayer={updatePlayer}
                />
              </div>
            )}
            
            {activeTab === 'roster' && (
              <TeamRoster 
                teams={teams}
                stats={teamStats}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
