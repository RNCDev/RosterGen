import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { saveTeamAssignments } from '@/lib/db';
import type { DbPlayer } from '@/lib/db';

interface TeamData {
    forwards: DbPlayer[];
    defensemen: DbPlayer[];
}

interface TeamAssignmentRequest {
    redTeam: TeamData;
    whiteTeam: TeamData;
    sessionDate: string;  // ISO date string from request
}

interface SuccessResponse {
    success: boolean;
}

interface ErrorResponse {
    error: string;
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
    try {
        const data = await request.json() as TeamAssignmentRequest;

        // Validate required fields
        if (!data.redTeam || !data.whiteTeam || !data.sessionDate) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert string date to Date object
        const sessionDate = new Date(data.sessionDate);

        // Validate date
        if (isNaN(sessionDate.getTime())) {
            return NextResponse.json(
                { error: 'Invalid session date' },
                { status: 400 }
            );
        }

        await saveTeamAssignments(data.redTeam, data.whiteTeam, sessionDate);
        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}