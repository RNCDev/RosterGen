import { NextRequest, NextResponse } from 'next/server';
import { getTeamSnapClient } from '@/lib/teamsnap-api';

/**
 * GET /api/teamsnap/auth
 * Initiates OAuth flow with TeamSnap
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect_url') || '/';

  // --- Start Debug Logging ---
  console.log("--- TeamSnap Auth Debug ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("Vercel URL:", process.env.VERCEL_URL);
  console.log("Has Client ID:", !!process.env.TEAMSNAP_CLIENT_ID);
  console.log("Has Client Secret:", !!process.env.TEAMSNAP_CLIENT_SECRET);
  console.log("Redirect URI from env:", process.env.TEAMSNAP_REDIRECT_URI);
  // --- End Debug Logging ---

  try {
    const teamSnapClient = getTeamSnapClient();
    
    // Create state parameter to remember where to redirect after auth
    const state = Buffer.from(JSON.stringify({ redirectUrl })).toString('base64');
    
    // Get authorization URL
    const authUrl = teamSnapClient.getAuthorizationUrl(state);
    
    // Redirect to TeamSnap OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to initiate TeamSnap OAuth:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate TeamSnap authentication',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
