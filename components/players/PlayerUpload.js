// app/components/players/PlayerUpload.js
import React from 'react';

export function PlayerUpload({ onUpload, className = '' }) {
  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Players CSV
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => onUpload(e.target.files[0])}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                focus:outline-none"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            CSV should include: First Name, Last Name, Skill Level (1-10), Position (Defense/Forward), Attendance
          </p>
        </div>
      </div>
    </div>
  );
}
