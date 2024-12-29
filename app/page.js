// app/page.js
import { RosterGenerator } from './components/RosterGenerator';

export default function Home() {
    return (
        <main className="min-h-screen">
            <RosterGenerator />
        </main>
    );
}