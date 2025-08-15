import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeamSnapAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTeamSnapAuth() {
  const [authState, setAuthState] = useState<TeamSnapAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null
  });
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/teamsnap/status');
      const data = await response.json();
      
      setAuthState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to check authentication status'
      });
    }
  };

  const login = (redirectUrl?: string) => {
    const authUrl = redirectUrl 
      ? `/api/teamsnap/auth?redirect_url=${encodeURIComponent(redirectUrl)}`
      : '/api/teamsnap/auth';
    
    // Use window.location.href for a full page redirect to ensure clean OAuth flow.
    // This avoids issues with Next.js client-side router interfering with the external redirect.
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      await fetch('/api/teamsnap/logout', { method: 'POST' });
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return {
    ...authState,
    checkAuthStatus,
    login,
    logout
  };
}
