// app/page.js

'use client';

import dynamic from 'next/dynamic';

const RosterGenerator = dynamic(() => import('./components/RosterGenerator'), {
    ssr: false,
});

export default function Home() {
    return (
        <main className="min-h-screen">
            <RosterGenerator />
        </main>
    );
}