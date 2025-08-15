import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/db/migrate-teamsnap
 * Adds teamsnap_team_id column to groups table (safe migration)
 * This is a one-time migration to update your database schema
 */
export async function GET(request: NextRequest) {
  try {
    // Check if column already exists first
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'groups' 
      AND column_name = 'teamsnap_team_id'
    `;

    if (columnCheck.rowCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'Column teamsnap_team_id already exists in groups table',
        alreadyExists: true
      });
    }

    // Add the column if it doesn't exist
    await sql`
      ALTER TABLE groups 
      ADD COLUMN teamsnap_team_id VARCHAR(255)
    `;

    return NextResponse.json({
      success: true,
      message: 'Successfully added teamsnap_team_id column to groups table'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
