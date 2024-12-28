// app/page.js
import { RosterGenerator } from './components/RosterGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <RosterGenerator />
    </div>
  );
}
