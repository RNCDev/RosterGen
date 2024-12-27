// app/components/RosterGenerator.js
import React, { useEffect, useState } from 'react';
import { usePlayerManagement } from '../app/hooks/usePlayerManagement';
import { useTeamGeneration } from '../app/hooks/useTeamGeneration';
import { PlayerTable } from './players/PlayerTable';
import { PlayerUpload } from './players/PlayerUpload';
import { TeamRoster } from './teams/TeamRoster';
import { LoadingSpinner } from './shared/LoadingSpinner';
import { ErrorMessage } from './shared/ErrorMessage';
import { TabNavigation } from './shared/TabNavigation';

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
        <div className="flex gap-3 md:gap-4">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 
              bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              transition-colors duration-200"
          >
            {showUpload ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hide Upload
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload CSV
              </>
            )}
          </button>
          {players.length > 0 && (
            <button
              onClick={handleGenerateTeams}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white 
                bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Generate Teams
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  const loading = playersLoading || teamsLoading;
  const error = playersError || teamsError;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Hockey Roster Generator
              </h1>
              {renderActionButtons()}
            </div>
          </div>
          
          {error && (
            <div className="px-6 py-4">
              <ErrorMessage message={error} />
            </div>
          )}
          
          <TabNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {loading ? (
            <div className="px-6 py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="px-6 py-6">
              {activeTab === 'players' && (
                <div className="space-y-6">
                  {showUpload && (
                    <div className="bg-gray-50 rounded-lg border border-gray-200">
                      <div className="px-6 py-5">
                        <PlayerUpload onUpload={handleFileUpload} />
                      </div>
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
    </div>
  );
}
