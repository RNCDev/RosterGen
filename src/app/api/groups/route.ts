// src/app/api/groups/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

interface TeamRow {
    id: number;
}

// DELETE - Delete group and all associated data
export async function DELETE(
    request: NextRequest
): Promise<NextResponse<{ success: boolean } | { error: string }>> {
    try {
        const { groupCode } = await request.json();
        console.log('Attempting to delete group:', groupCode);

        if (!groupCode || groupCode === 'default') {
            console.log('Invalid group code detected:', groupCode);
            return NextResponse.json(
                { error: 'Invalid group code' },
                { status: 400 }
            );
        }

        // Start a transaction
        await sql`BEGIN`;

        try {
            console.log('Starting deletion process for group:', groupCode);

            // First, get all team IDs for this group
            const { rows: teams } = await sql<TeamRow>`
                SELECT id FROM teams WHERE group_code = ${groupCode}
            `;
            console.log('Found teams:', teams);

            // Delete player_team_assignments first (due to foreign key)
            if (teams.length > 0) {
                const teamIds = teams.map(team => team.id);
                const { rowCount: assignmentsDeleted } = await sql`
                    DELETE FROM player_team_assignments
                    WHERE team_id = ANY(${teamIds}::int[])
                `;
                console.log('Deleted assignments count:', assignmentsDeleted);
            }

            // Delete teams
            const { rowCount: teamsDeleted } = await sql`
                DELETE FROM teams 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted teams count:', teamsDeleted);

            // Delete players
            const { rowCount: playersDeleted } = await sql`
                DELETE FROM players 
                WHERE group_code = ${groupCode}
                RETURNING id
            `;
            console.log('Deleted players count:', playersDeleted);

            // Verify deletion
            const { rows: finalCounts } = await sql<{ remaining_players: number; remaining_teams: number }>`
                SELECT 
                    (SELECT COUNT(*) FROM players WHERE group_code = ${groupCode}) as remaining_players,
                    (SELECT COUNT(*) FROM teams WHERE group_code = ${groupCode}) as remaining_teams
            `;
            console.log('Final counts:', finalCounts[0]);

            if (finalCounts[0].remaining_players > 0 || finalCounts[0].remaining_teams > 0) {
                throw new Error('Failed to delete all group data');
            }

            await sql`COMMIT`;
            console.log('Successfully deleted group and all associated data');
            return NextResponse.json({
                success: true,
                deleted: {
                    assignments: teamsDeleted > 0, // We only care if they were deleted
                    teams: teamsDeleted,
                    players: playersDeleted
                }
            });
        } catch (error) {
            console.error('Error during deletion, rolling back:', error);
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