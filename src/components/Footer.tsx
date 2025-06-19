'use client';

import { useEffect, useState } from 'react';

interface Stats {
    uniqueGroups: number;
    totalPlayers: number;
}

export default function Footer() {
    const [stats, setStats] = useState<Stats>({ uniqueGroups: 0, totalPlayers: 0 });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setError(null);
                const response = await fetch('/api/stats');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
                setError('Failed to load stats');
            }
        };

        // Fetch immediately
        fetchStats();

        // Then fetch every 5 minutes
        const interval = setInterval(fetchStats, 5 * 60 * 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-8">
                        {error ? (
                            <div className="text-sm text-red-500">{error}</div>
                        ) : (
                            <>
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium text-slate-700">{stats.uniqueGroups || 0}</span> Active Groups
                                </div>
                                <div className="text-sm text-slate-500">
                                    <span className="font-medium text-slate-700">{stats.totalPlayers || 0}</span> Players
                                </div>
                            </>
                        )}
                    </div>
                    <div className="text-sm text-slate-400">
                        © {new Date().getFullYear()} Hockey Roster Manager
                    </div>
                </div>
            </div>
        </footer>
    );
} 