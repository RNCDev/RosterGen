import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { type FormPlayer, type PlayerDB, type PlayerInput, toDatabase } from '@/types/PlayerTypes';

const TEMP_GROUP_CODE = 'TEMPCODE';

export async function GET(
    request: NextRequest
): Promise<NextResponse<PlayerDB[] | { error: string }>> {
    try {
        const { searchParams } = new URL(request.url);
        const groupCode = searchParams.get('groupCode') || 'default';

        const { rows } = await sql<PlayerDB>`
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
): Promise<NextResponse<PlayerDB[] | PlayerDB | { error: string }>> {
    try {
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File;
            
            // Always use TEMP_GROUP_CODE for CSV uploads
            const groupCode = TEMP_GROUP_CODE;

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
                const formPlayer: FormPlayer = {
                    firstName: values[0],
                    lastName: values[1],
                    skill: parseInt(values[2], 10),
                    defense: Boolean(parseInt(values[3], 10)),
                    attending: Boolean(parseInt(values[4], 10)),
                    groupCode
                };
                return toDatabase(formPlayer);
            });

            // Validate all players have required fields
            const invalidPlayers = players.filter(
                player => !player.first_name ||
                    !player.last_name ||
                    isNaN(player.skill) ||
                    typeof player.is_defense !== 'boolean' ||
                    typeof player.is_attending !== 'boolean'
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
                for (const player of players) {
                    const { rows } = await sql<PlayerDB>`
                        INSERT INTO players (
                            first_name,
                            last_name,
                            skill,
                            is_defense,
                            is_attending,
                            group_code
                        )
                        VALUES (
                            ${player.first_name},
                            ${player.last_name},
                            ${player.skill},
                            ${player.is_defense},
                            ${player.is_attending},
                            ${player.group_code}
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
            const formData = await request.json() as FormPlayer;
            if (!formData.firstName || !formData.lastName || typeof formData.skill !== 'number') {
                return NextResponse.json(
                    { error: 'Missing required fields' },
                    { status: 400 }
                );
            }

            const player = toDatabase(formData);

            const { rows } = await sql<PlayerDB>`
                INSERT INTO players (
                    first_name,
                    last_name,
                    skill,
                    is_defense,
                    is_attending,
                    group_code
                )
                VALUES (
                    ${player.first_name},
                    ${player.last_name},
                    ${player.skill},
                    ${player.is_defense},
                    ${player.is_attending},
                    ${player.group_code}
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
): Promise<NextResponse<PlayerDB | PlayerDB[] | { error: string }>> {
    try {
        const body = await request.json();
        
        // Check for bulk update
        if (Array.isArray(body.players)) {
            const players = body.players as PlayerDB[];
            const groupCode = body.groupCode as string;

            if (!groupCode) {
                return NextResponse.json({ error: 'Group code is required for bulk update' }, { status: 400 });
            }

            const updatedPlayers: PlayerDB[] = [];
            await sql.begin(async (tx: typeof sql) => {
                for (const player of players) {
                    const { rows } = await tx<PlayerDB>`
                        UPDATE players
                        SET
                            first_name = ${player.first_name},
                            last_name = ${player.last_name},
                            skill = ${player.skill},
                            is_defense = ${player.is_defense},
                            is_attending = ${player.is_attending}
                        WHERE id = ${player.id} AND group_code = ${groupCode}
                        RETURNING *
                    `;
                    if (rows[0]) {
                        updatedPlayers.push(rows[0]);
                    }
                }
            });

            return NextResponse.json(updatedPlayers);
        }

        // Handle single player update
        const formData = body as FormPlayer & { id: number };
        console.log('Received update data:', formData);

        // Validate required fields
        if (!formData.id || !formData.firstName || !formData.lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const player = toDatabase(formData);

        const { rows } = await sql<PlayerDB>`
            UPDATE players
            SET
                first_name = ${player.first_name},
                last_name = ${player.last_name},
                skill = ${player.skill},
                is_defense = ${player.is_defense},
                is_attending = ${player.is_attending}
            WHERE id = ${formData.id} 
            AND group_code = ${player.group_code}
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

        const { rowCount } = await sql`
            DELETE FROM players 
            WHERE id = ${parseInt(id)} 
            AND group_code = ${groupCode}
        `;

        if (rowCount === 0) {
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