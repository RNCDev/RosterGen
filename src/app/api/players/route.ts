import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAllPlayers, addPlayer, updatePlayer, deletePlayer } from '@/lib/db';
import type { DbPlayer } from '@/lib/db';

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

export async function POST(request: NextRequest): Promise<NextResponse<DbPlayer[] | { error: string }>> {
    try {
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
                );
            }

            const fileContent = await file.text();
            const csvRows = fileContent.split('\n').map(row => row.trim()).filter(row => row);

            // Assuming CSV headers: first_name,last_name,skill,is_defense,is_attending
            const headers = csvRows[0].split(',');
            const players = csvRows.slice(1).map(row => {
                const values = row.split(',');
                return {
                    firstName: values[0],
                    lastName: values[1],
                    skill: parseInt(values[2], 10),
                    defense: values[3].toLowerCase() === 'true',
                    attending: values[4].toLowerCase() === 'true'
                };
            });

            // Add players to the database
            const addedPlayers = [];
            for (const playerData of players) {
                const player = await addPlayer(playerData);
                addedPlayers.push(player);
            }

            return NextResponse.json(addedPlayers);
        } else {
            // Handle JSON input for single player
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
        }
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