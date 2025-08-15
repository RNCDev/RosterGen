import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * GET /api/test/setup
 * Test database connection and environment setup
 */
export async function GET(request: NextRequest) {
  const results = {
    database: { status: 'unknown', message: '', details: null as any },
    teamsnap: { status: 'unknown', message: '', config: null as any },
    environment: process.env.NODE_ENV
  };

  // Test database connection
  try {
    const dbTest = await sql`SELECT NOW() as current_time`;
    results.database.status = 'connected';
    results.database.message = 'Database connection successful';
    results.database.details = dbTest.rows[0];
  } catch (error) {
    results.database.status = 'error';
    results.database.message = error instanceof Error ? error.message : 'Unknown database error';
  }

  // Test TeamSnap configuration
  try {
    const clientId = process.env.TEAMSNAP_CLIENT_ID;
    const clientSecret = process.env.TEAMSNAP_CLIENT_SECRET;
    const redirectUri = process.env.TEAMSNAP_REDIRECT_URI;

    if (!clientId || !clientSecret) {
      results.teamsnap.status = 'missing_config';
      results.teamsnap.message = 'TeamSnap OAuth credentials missing';
    } else {
      results.teamsnap.status = 'configured';
      results.teamsnap.message = 'TeamSnap OAuth credentials found';
    }

    results.teamsnap.config = {
      clientId: clientId ? `${clientId.substring(0, 10)}...` : 'missing',
      clientSecret: clientSecret ? `${clientSecret.substring(0, 10)}...` : 'missing',
      redirectUri: redirectUri || 'using default'
    };
  } catch (error) {
    results.teamsnap.status = 'error';
    results.teamsnap.message = error instanceof Error ? error.message : 'Unknown TeamSnap error';
  }

  return NextResponse.json(results, { 
    status: results.database.status === 'error' ? 500 : 200 
  });
}
