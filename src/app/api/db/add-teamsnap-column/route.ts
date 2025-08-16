import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/db/add-teamsnap-column
 * Adds teamsnap_team_id column to groups table
 * Run this once to update your database schema
 */
export async function GET(request: NextRequest) {
  try {
    // Check if column already exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'groups' 
      AND column_name = 'teamsnap_team_id'
    `;

    if (columnCheck.rowCount > 0) {
      return NextResponse.json({
        message: 'Column teamsnap_team_id already exists in groups table',
        alreadyExists: true
      });
    }

    // Add the column
    await sql`
      ALTER TABLE groups 
      ADD COLUMN teamsnap_team_id VARCHAR(255)
    `;

    return NextResponse.json({
      success: true,
      message: 'Successfully added teamsnap_team_id column to groups table'
    });

  } catch (error) {
    console.error('Failed to add teamsnap_team_id column:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add column',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
