import { NextRequest, NextResponse } from 'next/server';
import { getTeamSnapClient } from '@/lib/teamsnap-api';
import { getTeamSnapRedirectUri } from '@/lib/teamsnap-config';

/**
 * GET /api/teamsnap/auth
 * Initiates OAuth flow with TeamSnap
 */
export async function GET(request: NextRequest) {
  // --- Start Debug Logging ---
  // This route is now a debug endpoint to check server-side env vars on Vercel.
  try {
    const redirectUriFromConfig = getTeamSnapRedirectUri();
    return NextResponse.json({
      message: "Vercel Environment Variable Check",
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_URL: process.env.VERCEL_URL || "Not set",
      TEAMSNAP_CLIENT_ID_EXISTS: !!process.env.TEAMSNAP_CLIENT_ID,
      TEAMSNAP_CLIENT_ID_FIRST_CHARS: process.env.TEAMSNAP_CLIENT_ID?.substring(0, 5) || "N/A",
      TEAMSNAP_CLIENT_SECRET_EXISTS: !!process.env.TEAMSNAP_CLIENT_SECRET,
      TEAMSNAP_REDIRECT_URI_FROM_ENV: process.env.TEAMSNAP_REDIRECT_URI || "Not set",
      TEAMSNAP_REDIRECT_URI_FROM_CONFIG_FUNCTION: redirectUriFromConfig
    });

  } catch (error) {
     return NextResponse.json(
      { 
        error: 'Failed to read environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
