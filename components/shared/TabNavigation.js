// app/components/shared/TabNavigation.js
import React from 'react';

export function TabNavigation({ activeTab, onTabChange, actionButtons }) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <div className="flex justify-between items-center">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            className={`
              py-4 px-6 text-sm font-medium border-b-2 -mb-px
              transition-colors duration-200
              ${activeTab === 'players'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            onClick={() => onTabChange('players')}
          >
            Players List
          </button>
          <button
            className={`
              py-4 px-6 text-sm font-medium border-b-2 -mb-px
              transition-colors duration-200
              ${activeTab === 'roster'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            onClick={() => onTabChange('roster')}
          >
            Team Rosters
          </button>
        </nav>
        <div className="flex space-x-4">
          {actionButtons}
        </div>
      </div>
    </div>
  );
}
