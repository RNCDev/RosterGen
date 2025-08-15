/**
 * TeamSnap configuration utilities
 */

/**
 * Get the appropriate redirect URI based on the environment
 */
export function getTeamSnapRedirectUri(): string {
  // For production and preview deployments on Vercel, always use the canonical production URL.
  // This is required because the TeamSnap application only has one allowed production redirect URI.
  if (process.env.NODE_ENV === 'production') {
    return 'https://roster-gen.vercel.app/api/teamsnap/callback';
  }

  // For local development, use the explicitly set environment variable.
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
