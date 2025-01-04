//teams route
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PlayerDB, Team } from '@/types/PlayerTypes';

interface TeamData {
    forwards: PlayerDB[];
    defensemen: PlayerDB[];
}

interface TeamAssignmentRequest {
    redTeam: TeamData;
    whiteTeam: TeamData;
    groupCode: string;
}

export async function POST(
    request: NextRequest
) {
    try {
        const data: TeamAssignmentRequest = await request.json();

        // Validate that all players belong to the same group
        const allPlayers = [
            ...data.redTeam.forwards,
            ...data.redTeam.defensemen,
            ...data.whiteTeam.forwards,
            ...data.whiteTeam.defensemen
        ];

        const invalidGroupPlayers = allPlayers.filter(player => player.group_code !== data.groupCode);
        if (invalidGroupPlayers.length > 0) {
            return NextResponse.json(
                { error: 'Some players do not belong to the specified group' },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}