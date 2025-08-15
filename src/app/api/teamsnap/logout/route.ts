import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * POST /api/teamsnap/logout
 * Clear TeamSnap authentication
 */
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  
  // Clear all TeamSnap-related cookies
  cookieStore.delete('teamsnap_access_token');
  cookieStore.delete('teamsnap_refresh_token');
  cookieStore.delete('teamsnap_token_expires_at');
  
  return NextResponse.json({ success: true });
}
