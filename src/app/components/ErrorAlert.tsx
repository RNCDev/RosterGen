// ErrorAlert.tsx
'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorAlertProps {
    message: string | null;
}

export default function ErrorAlert({ message }: ErrorAlertProps) {
    const [isVisible, setIsVisible] = useState(!!message);

    if (!message || !isVisible) return null;

    return (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 relative">
            <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">{message}</div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-red-400 hover:text-red-600 flex-shrink-0"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}