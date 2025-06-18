import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

// Zod schema for a player received from the client
// Does not include server-generated fields like `id`
const playerSchema = z.object({
    first_name: z.string().trim().min(1),
    last_name: z.string().trim().min(1),
    skill: z.number().int().min(1).max(10),
    is_defense: z.boolean(),
    is_attending: z.boolean(),
});

/**
 * GET /api/groups?groupCode=...
 * Retrieves all players for a given group code.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('groupCode');

    if (!groupCode) {
        return NextResponse.json({ error: 'Group code is required' }, { status: 400 });
    }

    try {
        const { rows } = await sql`
            SELECT * FROM players 
            WHERE group_code = ${groupCode}
            ORDER BY last_name, first_name;
        `;
        return NextResponse.json(rows);
    } catch (error) {
        console.error(`Failed to fetch group ${groupCode}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


/**
 * POST /api/groups
 * Creates or completely overwrites a group with a new list of players.
 * This is the primary "Save" operation for a group.
 */
export async function POST(request: NextRequest) {
    try {
        const { groupCode } = await request.json();

        if (!groupCode || typeof groupCode !== 'string' || groupCode.trim().length === 0) {
            return NextResponse.json({ error: 'Group code is required and must be a non-empty string.' }, { status: 400 });
        }

        // Check if any players exist with this group code
        const { rows } = await sql`
            SELECT 1 FROM players WHERE group_code = ${groupCode} LIMIT 1;
        `;

        if (rows.length > 0) {
            return NextResponse.json({ error: 'A group with this code already exists.' }, { status: 409 });
        }

        // If no players exist, the group is considered "created" and available.
        // We don't need to add anything to the database at this stage.
        return NextResponse.json({ message: 'Group code is available and ready for use.' }, { status: 200 });
    } catch (e) {
        console.error('Error in POST /api/groups:', e);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}

/**
 * DELETE /api/groups
 * Deletes an entire group by its code.
 */
export async function DELETE(request: NextRequest) {
    let groupCode;
    try {
        const body = await request.json();
        groupCode = body.groupCode;

        if (!groupCode) {
            return NextResponse.json({ error: 'Group code is required' }, { status: 400 });
        }

        await sql`
            DELETE FROM players WHERE group_code = ${groupCode};
        `;

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error) {
        console.error(`Failed to delete group ${groupCode}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}