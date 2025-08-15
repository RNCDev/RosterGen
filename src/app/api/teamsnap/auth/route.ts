import { NextRequest, NextResponse } from 'next/server';
import { getTeamSnapClient } from '@/lib/teamsnap-api';

/**
 * GET /api/teamsnap/auth
 * Initiates OAuth flow with TeamSnap
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectUrl = searchParams.get('redirect_url') || '/';

  try {
    // Debug: Check if environment variables are loaded
    console.log('TeamSnap Client ID exists:', !!process.env.TEAMSNAP_CLIENT_ID);
    console.log('TeamSnap Client Secret exists:', !!process.env.TEAMSNAP_CLIENT_SECRET);
    console.log('TeamSnap Redirect URI:', process.env.TEAMSNAP_REDIRECT_URI);
    
    const teamSnapClient = getTeamSnapClient();
    
    // Create state parameter to remember where to redirect after auth
    const state = Buffer.from(JSON.stringify({ redirectUrl })).toString('base64');
    
    // Get authorization URL
    const authUrl = teamSnapClient.getAuthorizationUrl(state);
    console.log('Authorization URL:', authUrl);
    
    // Redirect to TeamSnap OAuth page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Failed to initiate TeamSnap OAuth:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initiate TeamSnap authentication',
        details: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasClientId: !!process.env.TEAMSNAP_CLIENT_ID,
          hasClientSecret: !!process.env.TEAMSNAP_CLIENT_SECRET,
          redirectUri: process.env.TEAMSNAP_REDIRECT_URI
        }
      },
      { status: 500 }
    );
  }
}
