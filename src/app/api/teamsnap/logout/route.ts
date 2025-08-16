import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/teamsnap/logout
 * Clear TeamSnap authentication
 */
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  
  // Clear all TeamSnap-related cookies
  response.cookies.delete('teamsnap_access_token');
  response.cookies.delete('teamsnap_refresh_token');
  response.cookies.delete('teamsnap_token_expires_at');
  
  return response;
}
