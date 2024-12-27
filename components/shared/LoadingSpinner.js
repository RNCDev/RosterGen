// app/components/shared/LoadingSpinner.js
import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}
