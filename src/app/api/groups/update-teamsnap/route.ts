import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * PATCH /api/groups/update-teamsnap
 * Updates the TeamSnap team ID for a group
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, teamSnapTeamId } = body;

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Update the TeamSnap team ID for the group
    const result = await sql`
      UPDATE groups 
      SET teamsnap_team_id = ${teamSnapTeamId || null}
      WHERE id = ${groupId}
      RETURNING id, teamsnap_team_id
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      teamSnapTeamId: result.rows[0].teamsnap_team_id
    });

  } catch (error) {
    console.error('Failed to update TeamSnap team ID:', error);
    return NextResponse.json(
      { error: 'Failed to update TeamSnap team ID' },
      { status: 500 }
    );
  }
}
