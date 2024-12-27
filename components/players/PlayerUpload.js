// app/components/players/PlayerUpload.js
import React from 'react';

export function PlayerUpload({ onUpload, className = '' }) {
  return (
    <div className={`mb-4 space-y-4 ${className}`}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => onUpload(e.target.files[0])}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
    </div>
  );
}
