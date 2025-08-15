import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * GET /api/teamsnap/status
 * Check TeamSnap authentication status
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  
  const accessToken = cookieStore.get('teamsnap_access_token');
  const expiresAt = cookieStore.get('teamsnap_token_expires_at');
  
  if (!accessToken) {
    return NextResponse.json({ authenticated: false });
  }
  
  // Check if token is expired
  if (expiresAt) {
    const expiryTime = parseInt(expiresAt.value);
    if (Date.now() > expiryTime) {
      return NextResponse.json({ 
        authenticated: false, 
        reason: 'token_expired' 
      });
    }
  }
  
  return NextResponse.json({ 
    authenticated: true,
    expiresAt: expiresAt?.value
  });
}
