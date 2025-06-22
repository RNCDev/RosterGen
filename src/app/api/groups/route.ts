import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { renameGroup, deleteGroup } from '../../../../lib/db';

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
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('groupCode');
    
    try {
        if (!groupCode) {
            return NextResponse.json({ error: 'Group code is required' }, { status: 400 });
        }

        await deleteGroup(groupCode);

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error) {
        console.error(`Failed to delete group ${groupCode}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * PUT /api/groups
 * Renames a group.
 */
export async function PUT(request: NextRequest) {
    try {
        const { oldGroupCode, newGroupCode } = await request.json();

        if (!oldGroupCode || !newGroupCode) {
            return NextResponse.json({ error: 'Both old and new group codes are required.' }, { status: 400 });
        }
        
        if (oldGroupCode === newGroupCode) {
            return NextResponse.json({ message: 'No change detected.' }, { status: 200 });
        }

        await renameGroup(oldGroupCode, newGroupCode);

        return NextResponse.json({ message: `Group successfully renamed from "${oldGroupCode}" to "${newGroupCode}".` }, { status: 200 });
    } catch (e: any) {
        console.error('Error in PUT /api/groups:', e);
        // Check for the specific error message from our db function
        if (e.message.includes('is already in use')) {
            return NextResponse.json({ error: e.message }, { status: 409 }); // Conflict
        }
        return NextResponse.json({ error: 'An unexpected error occurred during rename.' }, { status: 500 });
    }
}