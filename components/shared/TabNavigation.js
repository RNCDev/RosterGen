// components/shared/TabNavigation.js
import React from 'react';

export function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'players', label: 'Players' },
    { id: 'roster', label: 'Teams' }
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="flex px-6" aria-label="Tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-6 text-sm font-medium border-b-2 
              transition-colors duration-200 relative
              ${activeTab === tab.id 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
