// app/hooks/useTeamGeneration.js
import { useState, useCallback } from 'react';
import { TeamService } from '../services/TeamService';

export function useTeamGeneration() {
  const [teams, setTeams] = useState({
    red: { forwards: [], defensemen: [] },
    white: { forwards: [], defensemen: [] }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const generateAndSaveTeams = useCallback(async (players) => {
    try {
      setLoading(true);
      setError(null);

      // Generate balanced teams
      const generatedTeams = TeamService.generateTeams(players);
      
      // Save teams to backend
      await TeamService.saveTeams(generatedTeams);
      
      // Update local state
      setTeams(generatedTeams);

      // Calculate and return team statistics
      const redStats = TeamService.calculateTeamStats(generatedTeams.red);
      const whiteStats = TeamService.calculateTeamStats(generatedTeams.white);

      return {
        teams: generatedTeams,
        stats: {
          red: redStats,
          white: whiteStats
        }
      };
    } catch (err) {
      setError(`Failed to generate teams: ${err.message}`);
      console.error('Team generation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTeamStats = useCallback((teamColor) => {
    if (!teams[teamColor]) return null;
    return TeamService.calculateTeamStats(teams[teamColor]);
  }, [teams]);

  return {
    teams,
    loading,
    error,
    generateAndSaveTeams,
    getTeamStats
  };
}
