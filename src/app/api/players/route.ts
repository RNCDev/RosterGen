//players route

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
    groupCode: string;
}

export async function GET(
    request: NextRequest
): Promise<NextResponse<DbPlayer[] | { error: string }>> {
    try {
        const { searchParams } = new URL(request.url);
        const groupCode = searchParams.get('groupCode') || 'default';

        const { rows } = await sql<DbPlayer>`
            SELECT * FROM players 
            WHERE group_code = ${groupCode}
            ORDER BY last_name, first_name
        `;
        return NextResponse.json(rows);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<DbPlayer[] | DbPlayer | { error: string }>> {
    try {
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File;
            const groupCode = formData.get('groupCode') as string || 'default';

            if (!file) {
                return NextResponse.json(
                    { error: 'No file uploaded' },
                    { status: 400 }
                );
            }

            const fileContent = await file.text();
            const csvRows = fileContent.split('\n').map(row => row.trim()).filter(row => row);

            // Assuming CSV headers: first_name,last_name,skill,defense,attending
            const headers = csvRows[0].toLowerCase().split(',');

            // Validate required columns
            const requiredColumns = ['first_name', 'last_name', 'skill', 'defense', 'attending'];
            const missingColumns = requiredColumns.filter(col => !headers.includes(col));

            if (missingColumns.length > 0) {
                return NextResponse.json(
                    { error: `Missing required columns: ${missingColumns.join(', ')}` },
                    { status: 400 }
                );
            }

            const players = csvRows.slice(1).map(row => {
                const values = row.split(',').map(value => value.trim());
                return {
                    firstName: values[0],
                    lastName: values[1],
                    skill: parseInt(values[2], 10),
                    defense: Boolean(parseInt(values[3], 10)),
                    attending: Boolean(parseInt(values[4], 10)),
                    groupCode
                };
            });

            // Validate all players have required fields
            const invalidPlayers = players.filter(
                player => !player.firstName ||
                    !player.lastName ||
                    isNaN(player.skill) ||
                    typeof player.defense !== 'boolean' ||
                    typeof player.attending !== 'boolean'
            );

            if (invalidPlayers.length > 0) {
                return NextResponse.json(
                    { error: 'Invalid player data found in CSV' },
                    { status: 400 }
                );
            }

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
        const data = await request.json();

        // Map the incoming data to match our PlayerInput interface
        const playerInput: PlayerInput = {
            firstName: data.firstName,
            lastName: data.lastName,
            skill: Number(data.skill),
            defense: Boolean(data.defense),
            attending: Boolean(data.attending),
            groupCode: data.groupCode || 'default'
        };

        // Validate required fields
        if (!data.id || !playerInput.firstName || !playerInput.lastName || typeof playerInput.skill !== 'number') {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const player = await updatePlayer(data.id, playerInput);

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
        const { groupCode } = await request.json();

        if (!groupCode) {
            return NextResponse.json(
                { error: 'Invalid group code' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            // First, get all team IDs for this group
            const { rows: teams } = await sql<{ id: number }>`
                SELECT id FROM teams WHERE group_code = ${groupCode}
            `;

            // Delete player_team_assignments first (due to foreign key)
            if (teams.length > 0) {
                const teamIds = teams.map(team => team.id);
                await sql`
                    DELETE FROM player_team_assignments
                    WHERE team_id = ANY(${teamIds}::int[])
                `;
            }

            // Delete teams
            await sql`
                DELETE FROM teams 
                WHERE group_code = ${groupCode}
            `;

            // Delete players
            await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
            `;

            await sql`COMMIT`;
            return NextResponse.json({ success: true });
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete group' },
            { status: 500 }
        );
    }
}