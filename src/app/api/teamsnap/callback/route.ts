import { NextRequest, NextResponse } from 'next/server';
import { getTeamSnapClient } from '@/lib/teamsnap-api';
import { cookies } from 'next/headers';

/**
 * GET /api/teamsnap/callback
 * Handles OAuth callback from TeamSnap
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Unknown error';
    console.error('TeamSnap OAuth error:', error, errorDescription);
    
    // Redirect to home page with error message
    return NextResponse.redirect(
      new URL(`/?error=teamsnap_auth_failed&message=${encodeURIComponent(errorDescription)}`, request.url)
    );
  }

  // Verify we have an authorization code
  if (!code) {
    console.error('No authorization code received from TeamSnap');
    return NextResponse.redirect(
      new URL('/?error=no_auth_code', request.url)
    );
  }

  try {
    // Exchange authorization code for access token
    const teamSnapClient = getTeamSnapClient();
    const tokenResponse = await teamSnapClient.exchangeCodeForToken(code);

    // Determine redirect URL based on state or default to home
    let redirectUrl = '/';
    if (state) {
      try {
        // State might contain the original URL the user was trying to access
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        redirectUrl = decodedState.redirectUrl || '/';
      } catch (e) {
        // If state parsing fails, just use default
        console.warn('Failed to parse OAuth state:', e);
      }
    }

    // Add success flag to URL
    const finalRedirectUrl = new URL(redirectUrl, request.url);
    finalRedirectUrl.searchParams.set('teamsnap_auth', 'success');
    
    const response = NextResponse.redirect(finalRedirectUrl);

    // Store tokens securely in HTTP-only cookies
    response.cookies.set('teamsnap_access_token', tokenResponse.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in || 7200, // Default 2 hours
      path: '/'
    });

    // Refresh token cookie (longer expiry)
    if (tokenResponse.refresh_token) {
      response.cookies.set('teamsnap_refresh_token', tokenResponse.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });
    }

    // Store token metadata
    response.cookies.set('teamsnap_token_expires_at', 
      String(Date.now() + (tokenResponse.expires_in * 1000)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenResponse.expires_in || 7200,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Failed to exchange TeamSnap authorization code:', error);
    
    return NextResponse.redirect(
      new URL(`/?error=token_exchange_failed&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`, request.url)
    );
  }
}
