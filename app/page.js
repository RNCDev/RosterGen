// app/page.js
import { RosterGenerator } from '@/components/RosterGenerator';

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50">
            <RosterGenerator />
        </main>
    );
}