// app/components/shared/TabNavigation.js
import React from 'react';

export function TabNavigation({ activeTab, onTabChange }) {
  return (
    <div className="border-b">
      <nav className="-mb-px flex">
        <button
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'players'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => onTabChange('players')}
        >
          Players
        </button>
        <button
          className={`ml-8 py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'roster'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => onTabChange('roster')}
        >
          Roster
        </button>
      </nav>
    </div>
  );
}
