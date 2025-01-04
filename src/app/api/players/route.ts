import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { PlayerInput, type DbPlayer, deletePlayer } from '@/lib/db';

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
            await sql`BEGIN`;
            try {
                const addedPlayers = [];
                for (const playerData of players) {
                    const { rows } = await sql<DbPlayer>`
                        INSERT INTO players (
                            first_name,
                            last_name,
                            skill,
                            is_defense,
                            is_attending,
                            group_code
                        )
                        VALUES (
                            ${playerData.firstName},
                            ${playerData.lastName},
                            ${playerData.skill},
                            ${playerData.defense},
                            ${playerData.attending},
                            ${playerData.groupCode}
                        )
                        RETURNING *
                    `;
                    addedPlayers.push(rows[0]);
                }
                await sql`COMMIT`;
                return NextResponse.json(addedPlayers);
            } catch (error) {
                await sql`ROLLBACK`;
                throw error;
            }
        } else {
            // Handle JSON input for single player
            const data = await request.json() as PlayerInput;
            if (!data.firstName || !data.lastName || typeof data.skill !== 'number') {
                return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            const { rows } = await sql<DbPlayer>`
                INSERT INTO players (
                    first_name,
                    last_name,
                    skill,
                    is_defense,
                    is_attending,
                    group_code
                )
                VALUES (
                    ${data.firstName},
                    ${data.lastName},
                    ${data.skill},
                    ${data.defense},
                    ${data.attending},
                    ${data.groupCode || 'default'}
                )
                RETURNING *
            `;

            return NextResponse.json(rows[0]);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest
): Promise<NextResponse<PlayerDB | { error: string }>> {
    try {
        const data = await request.json();
        console.log('Received update data:', data);

        // Validate required fields
        if (!data.id || !data.first_name || !data.last_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Convert and validate all fields
        const updateData = {
            id: Number(data.id),
            first_name: String(data.first_name).trim(),
            last_name: String(data.last_name).trim(),
            skill: Number(data.skill || 1),
            is_defense: Boolean(data.is_defense),
            is_attending: Boolean(data.is_attending),
            group_code: data.group_code
        };

        console.log('Sanitized update data:', updateData);

        const { rows } = await sql<PlayerDB>`
            UPDATE players
            SET
                first_name = ${updateData.first_name},
                last_name = ${updateData.last_name},
                skill = ${updateData.skill},
                is_defense = ${updateData.is_defense},
                is_attending = ${updateData.is_attending}
            WHERE id = ${updateData.id} 
            AND group_code = ${updateData.group_code}
            RETURNING *
        `;

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        console.log('Updated player:', rows[0]);
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error updating player:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to update player' },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const groupCode = searchParams.get('groupCode');

        if (!id || !groupCode) {
            return NextResponse.json(
                { error: 'Missing id or groupCode' },
                { status: 400 }
            );
        }

        const success = await deletePlayer(parseInt(id), groupCode);

        if (!success) {
            return NextResponse.json(
                { error: 'Player not found or already deleted' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting player:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to delete player' },
            { status: 500 }
        );
    }
}