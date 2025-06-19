import { NextResponse } from 'next/server';
import { testPlayers, runBulkAnalysis } from '@/lib/teamGenerator.analysis';

export async function GET() {
    try {
        const analysisResults = runBulkAnalysis(testPlayers, 100);
        return NextResponse.json(analysisResults);
    } catch (error) {
        console.error("Error running team generation analysis:", error);
        return NextResponse.json({ error: 'Failed to run analysis' }, { status: 500 });
    }
} 