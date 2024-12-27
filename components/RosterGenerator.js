'use client';

// components/RosterGenerator.js
import React, { useEffect, useState } from 'react';
import { usePlayerManagement } from '../hooks/usePlayerManagement';
import { PlayerTable } from './players/PlayerTable';
import { PlayerUpload } from './players/PlayerUpload';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
  </div>
);

const ErrorMessage = ({ message }) => (
  <Alert variant="destructive" className="mt-4">
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const RosterGenerator = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [activeTab, setActiveTab] = useState('players');
  
  const {
    players,
    loading,
    error,
    fetchPlayers,
    updatePlayer,
    deletePlayer,
    addPlayer,
    handleFileUpload
  } = usePlayerManagement();

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const renderActionButtons = () => (
    <div className="flex gap-3 md:gap-4">
      <button
        onClick={() => setShowUpload(!showUpload)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 
          bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        {showUpload ? 'Hide Upload' : 'Upload CSV'}
      </button>
      {players.length > 0 && (
        <button
          onClick={() => setActiveTab('roster')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white 
            bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
        >
          Generate Teams
        </button>
      )}
    </div>
  );

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
          
          {error && <ErrorMessage message={error} />}
          
          {loading ? (
            <div className="px-6 py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="px-6 py-6">
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
                  onDeletePlayer={deletePlayer}
                  onAddPlayer={addPlayer}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RosterGenerator;
