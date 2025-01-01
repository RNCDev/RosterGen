// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

// PUT - Update group code
export async function PUT(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { oldGroupCode, newGroupCode } = await request.json();

        if (!oldGroupCode || !newGroupCode) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            // Update players
            await sql`
                UPDATE players 
                SET group_code = ${newGroupCode}
                WHERE group_code = ${oldGroupCode}
            `;

            // Update teams
            await sql`
                UPDATE teams 
                SET group_code = ${newGroupCode}
                WHERE group_code = ${oldGroupCode}
            `;

            await sql`COMMIT`;
            return NextResponse.json({ success: true });
        } catch (error) {
            await sql`ROLLBACK`;
            throw error;
        }
    } catch (error) {
        console.error('Error updating group:', error);
        return NextResponse.json(
            { error: 'Failed to update group' },
            { status: 500 }
        );
    }
}

// DELETE - Delete group and all associated data
export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode } = await request.json();

        if (!groupCode || groupCode === 'default') {
            return NextResponse.json(
                { error: 'Invalid group code' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            // Delete player_team_assignments for the group's teams
            await sql`
                DELETE FROM player_team_assignments
                WHERE team_id IN (
                    SELECT id FROM teams WHERE group_code = ${groupCode}
                )
            `;

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
            { error: 'Failed to delete group' },
            { status: 500 }
        );
    }
}