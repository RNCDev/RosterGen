/**
 * TeamSnap configuration utilities
 */

/**
 * Get the appropriate redirect URI based on the environment
 */
export function getTeamSnapRedirectUri(): string {
  // For production, always construct the HTTPS URI from VERCEL_URL.
  if (process.env.NODE_ENV === 'production') {
    const vercelUrl = process.env.VERCEL_URL;
    if (!vercelUrl) {
      console.warn("VERCEL_URL is not set in production. Falling back to TEAMSNAP_REDIRECT_URI env var.");
      // Fallback to the environment variable if VERCEL_URL isn't available for some reason.
      return process.env.TEAMSNAP_REDIRECT_URI || 'https://roster-gen.vercel.app/api/teamsnap/callback';
    }
    return `https://${vercelUrl}/api/teamsnap/callback`;
  }

  // For development, use the explicitly set environment variable.
  // This allows for ngrok or other tunneling services.
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
