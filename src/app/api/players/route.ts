//player route

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllPlayers, addPlayer, updatePlayer } from '@/lib/db';
import type { DbPlayer } from '@/lib/db';  // You'll need to export this type from db.ts

interface PlayerInput {
    firstName: string;
    lastName: string;
    skill: number;
    defense: boolean;
    attending: boolean;
}

interface UpdatePlayerInput extends PlayerInput {
    id: number;
}

export async function GET(): Promise<NextResponse<DbPlayer[] | { error: string }>> {
    try {
        const players = await getAllPlayers();
        return NextResponse.json(players);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<DbPlayer | { error: string }>> {
    try {
        const data = await request.json() as PlayerInput;

        // Validate required fields
        if (!data.firstName || !data.lastName || typeof data.skill !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const player = await addPlayer(data);
        return NextResponse.json(player);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { id } = await request.json();

        // Validate id
        if (!id || typeof id !== 'number') {
            return NextResponse.json(
                { error: 'Invalid player ID' },
                { status: 400 }
            );
        }

        const deleted = await deletePlayer(id);

        if (!deleted) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest
): Promise<NextResponse<DbPlayer | { error: string }>> {
    try {
        const data = await request.json() as UpdatePlayerInput;
        const { id, ...playerData } = data;

        // Validate required fields
        if (!id || !playerData.firstName || !playerData.lastName || typeof playerData.skill !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const player = await updatePlayer(id, playerData);

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(player);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}