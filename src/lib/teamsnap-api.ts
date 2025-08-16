/**
 * TeamSnap API client for OAuth and data fetching
 */

import { getTeamSnapRedirectUri } from './teamsnap-config';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
}

interface TeamSnapConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class TeamSnapAPI {
  private config: TeamSnapConfig;
  private baseAuthUrl = 'https://auth.teamsnap.com';
  private baseApiUrl = 'https://api.teamsnap.com/v3';

  constructor(config: TeamSnapConfig) {
    this.config = config;
  }

  /**
   * Get the OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'read',
      ...(state && { state })
    });

    return `${this.baseAuthUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.config.redirectUri
    });

    const response = await fetch(`${this.baseAuthUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    return response.json();
  }

  /**
   * Refresh an access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const response = await fetch(`${this.baseAuthUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to refresh token: ${error}`);
    }

    return response.json();
  }

  /**
   * Make an authenticated API request
   */
  async makeApiRequest(endpoint: string, accessToken: string): Promise<any> {
    const response = await fetch(`${this.baseApiUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData.collection?.error) {
          errorMessage = `API Error: ${errorData.collection.error.message}`;
        } else {
          errorMessage = `API request failed: ${JSON.stringify(errorData)}`;
        }
      } catch {
        // If we can't parse JSON, use the text response
        const errorText = await response.text();
        errorMessage = `API request failed: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Get teams for the authenticated user
   */
  async getTeams(accessToken: string): Promise<any> {
    return this.makeApiRequest('/teams', accessToken);
  }

  /**
   * Get events for a specific team
   */
  async getTeamEvents(teamId: string, accessToken: string): Promise<any> {
    return this.makeApiRequest(`/teams/${teamId}/events`, accessToken);
  }

  /**
   * Get availability/attendance for a specific event
   * Try multiple possible endpoint structures
   */
  async getEventAvailability(eventId: string, accessToken: string): Promise<any> {
    // Try the standard endpoint first
    try {
      return await this.makeApiRequest(`/events/${eventId}/availabilities`, accessToken);
    } catch (error) {
      console.log(`Standard availability endpoint failed, trying alternatives...`);
      
      // Try alternative endpoint structures
      try {
        return await this.makeApiRequest(`/events/${eventId}/availability`, accessToken);
      } catch (error2) {
        console.log(`Alternative endpoint failed, trying event details with availability...`);
        
        // Try to get event details which might include availability
        return await this.makeApiRequest(`/events/${eventId}`, accessToken);
      }
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string, accessToken: string): Promise<any> {
    return this.makeApiRequest(`/members/search?team_id=${teamId}`, accessToken);
  }

  /**
   * Get team members for a specific team (alternative endpoint)
   */
  async getTeamMembersDirect(teamId: string, accessToken: string): Promise<any> {
    return this.makeApiRequest(`/teams/${teamId}/members`, accessToken);
  }

  /**
   * Get a single team member's details
   */
  async getMemberDetails(memberId: string, accessToken: string): Promise<any> {
    return this.makeApiRequest(`/members/${memberId}`, accessToken);
  }
}

// Initialize TeamSnap API client with environment variables
export function getTeamSnapClient() {
  const clientId = process.env.TEAMSNAP_CLIENT_ID;
  const clientSecret = process.env.TEAMSNAP_CLIENT_SECRET;
  const redirectUri = getTeamSnapRedirectUri();

  if (!clientId || !clientSecret) {
    throw new Error('TeamSnap OAuth configuration missing. Please check your environment variables.');
  }

  return new TeamSnapAPI({
    clientId,
    clientSecret,
    redirectUri
  });
}
