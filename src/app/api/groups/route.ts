import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { 
    getGroupByCode, 
    createGroup,
    deleteGroup,
    renameGroup,
} from '@/lib/db';

/**
 * GET /api/groups?code=...
 * Retrieves a single group by its unique code.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupCode = searchParams.get('code');

    if (!groupCode) {
        return NextResponse.json({ error: 'Group code is required' }, { status: 400 });
    }

    try {
        const group = await getGroupByCode(groupCode);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }
        return NextResponse.json(group);
    } catch (error) {
        console.error(`Failed to fetch group ${groupCode}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/groups
 * Creates a new group.
 */
export async function POST(request: NextRequest) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return NextResponse.json({ error: 'Group code is required and must be a non-empty string.' }, { status: 400 });
        }

        // Check if the group code is already in use
        const existingGroup = await getGroupByCode(code);
        if (existingGroup) {
            return NextResponse.json({ error: 'A group with this code already exists.' }, { status: 409 });
        }

        const newGroup = await createGroup(code);
        return NextResponse.json(newGroup, { status: 201 });

    } catch (e) {
        console.error('Error in POST /api/groups:', e);
        return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
    }
}

/**
 * PUT /api/groups
 * Renames a group.
 */
export async function PUT(request: NextRequest) {
    try {
        const { groupId, newCode } = await request.json();

        if (!groupId || !newCode) {
            return NextResponse.json({ error: 'Group ID and new code are required.' }, { status: 400 });
        }

        // Check if the new group code is already in use by another group
        const existingGroup = await getGroupByCode(newCode);
        if (existingGroup && existingGroup.id !== groupId) {
            return NextResponse.json({ error: `Group code "${newCode}" is already in use.` }, { status: 409 });
        }

        const updatedGroup = await renameGroup(groupId, newCode);

        return NextResponse.json(updatedGroup, { status: 200 });
    } catch (e: any) {
        console.error('Error in PUT /api/groups:', e);
        return NextResponse.json({ error: 'An unexpected error occurred during rename.' }, { status: 500 });
    }
}

/**
 * DELETE /api/groups
 * Deletes an entire group by its ID.
 */
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    
    try {
        if (!groupId) {
            return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
        }

        const success = await deleteGroup(parseInt(groupId));
        if (!success) {
            return NextResponse.json({ error: 'Group not found or could not be deleted' }, { status: 404 });
        }

        return new NextResponse(null, { status: 204 }); // No Content

    } catch (error) {
        console.error(`Failed to delete group ${groupId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}