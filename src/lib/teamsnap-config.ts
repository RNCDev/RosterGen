/**
 * TeamSnap configuration utilities
 */

/**
 * Get the appropriate redirect URI based on the environment
 */
export function getTeamSnapRedirectUri(): string {
  // Always prefer the explicitly set TEAMSNAP_REDIRECT_URI
  if (process.env.TEAMSNAP_REDIRECT_URI) {
    return process.env.TEAMSNAP_REDIRECT_URI;
  }

  // Fallback to VERCEL_URL in production
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/teamsnap/callback`;
  }

  // Default for development
  return 'http://127.0.0.1:3000/api/teamsnap/callback';
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
