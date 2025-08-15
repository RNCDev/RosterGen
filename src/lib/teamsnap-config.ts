/**
 * TeamSnap configuration utilities
 */

/**
 * Get the appropriate redirect URI based on the environment
 */
export function getTeamSnapRedirectUri(): string {
  // In production, use the production URL
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    // VERCEL_URL is automatically set by Vercel
    return `https://${process.env.VERCEL_URL}/api/teamsnap/callback`;
  }

  // In development or if explicitly set, use the environment variable
  return process.env.TEAMSNAP_REDIRECT_URI || 'http://127.0.0.1:3000/api/teamsnap/callback';
}

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  // Production with Vercel
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Development
  return 'http://127.0.0.1:3000';
}
