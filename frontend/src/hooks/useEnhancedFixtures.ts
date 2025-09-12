import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fixtureService } from '../services/footballApi';
import type { Fixture, FixtureEvent, FixturePlayerStats, FixtureStats } from '../types/api';

// Enhanced fixture hook that combines multiple endpoints for rich data
export const useEnhancedFixture = (fixtureId: number) => {
  // Main fixture data
  const fixtureQuery = useQuery({
    queryKey: ['fixtures', fixtureId],
    queryFn: async () => {
      const result = await fixtureService.getById(fixtureId);
      return result;
    },
    enabled: !!fixtureId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Stats data (for completed matches)
  const statsQuery = useQuery({
    queryKey: ['fixtures', fixtureId, 'stats'],
    queryFn: async () => {
      const result = await fixtureService.getStats(fixtureId);
      return result;
    },
    enabled: !!fixtureId && fixtureQuery.data?.status?.short === 'FT',
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Events data (goals, cards, substitutions)
  const eventsQuery = useQuery({
    queryKey: ['fixtures', fixtureId, 'events'],
    queryFn: async () => {
      const result = await fixtureService.getEvents(fixtureId);
      return result;
    },
    enabled: !!fixtureId && ['FT', '1H', '2H', 'HT'].includes(fixtureQuery.data?.status?.short || ''),
    staleTime: 1000 * 60 * 5, // 5 minutes for live matches
  });

  // Player stats (for finished matches with detailed analysis)
  const playerStatsQuery = useQuery({
    queryKey: ['fixtures', fixtureId, 'players'],
    queryFn: async () => {
      const result = await fixtureService.getPlayerStats(fixtureId);
      return result;
    },
    enabled: !!fixtureId && fixtureQuery.data?.status?.short === 'FT',
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return {
    fixture: fixtureQuery.data,
    stats: statsQuery.data,
    events: eventsQuery.data,
    playerStats: playerStatsQuery.data,
    isLoading: fixtureQuery.isLoading,
    isLoadingStats: statsQuery.isLoading,
    isLoadingEvents: eventsQuery.isLoading,
    isLoadingPlayers: playerStatsQuery.isLoading,
    error: fixtureQuery.error || statsQuery.error || eventsQuery.error || playerStatsQuery.error,
    // Debug info
    _debug: process.env.NODE_ENV === 'development' ? {
      statsData: statsQuery.data,
      statsDataType: typeof statsQuery.data,
      statsIsArray: Array.isArray(statsQuery.data),
      firstStatType: statsQuery.data?.[0] ? typeof statsQuery.data[0] : 'undefined',
      firstStatKeys: statsQuery.data?.[0] ? Object.keys(statsQuery.data[0]) : []
    } : undefined
  };
};

// Hook for getting top performers across multiple matches
export const useTopPerformers = (leagueId: number, season?: number) => {
  return useQuery({
    queryKey: ['top-performers', leagueId, season],
    queryFn: async () => {
      // First get recent fixtures
      const fixturesResult = await fixtureService.getByLeague(leagueId, season);
      const recentFixtures = fixturesResult
        ?.filter(f => f.status?.short === 'FT')
        ?.slice(0, 10); // Last 10 completed matches

      if (!recentFixtures?.length) return [];

      // Get player stats for recent matches
      const playerStatsPromises = recentFixtures.map(fixture => 
        fixtureService.getPlayerStats(fixture.id || 0)
          .then(result => result)
          .catch(() => [])
      );

      const allPlayerStats = await Promise.all(playerStatsPromises);
      
      // Aggregate and find top performers
      const playerPerformance = new Map();
      
      allPlayerStats.flat().forEach((playerStat: any) => {
        if (!playerStat?.player?.id) return;
        
        const playerId = playerStat.player.id;
        const existing = playerPerformance.get(playerId) || {
          player: playerStat.player,
          stats: { goals: 0, assists: 0, rating: 0, matches: 0 }
        };
        
        existing.stats.goals += playerStat.statistics?.[0]?.goals?.total || 0;
        existing.stats.assists += playerStat.statistics?.[0]?.goals?.assists || 0;
        existing.stats.rating += parseFloat(playerStat.statistics?.[0]?.games?.rating || '0');
        existing.stats.matches += 1;
        
        playerPerformance.set(playerId, existing);
      });

      // Calculate average rating and sort
      return Array.from(playerPerformance.values())
        .map(p => ({
          ...p,
          stats: {
            ...p.stats,
            averageRating: p.stats.matches > 0 ? (p.stats.rating / p.stats.matches).toFixed(1) : '0'
          }
        }))
        .sort((a, b) => parseFloat(b.stats.averageRating) - parseFloat(a.stats.averageRating))
        .slice(0, 5); // Top 5 performers
    },
    enabled: !!leagueId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook for live match insights (combines events + live stats)
export const useLiveMatchInsights = (fixtureId: number) => {
  const isLive = useQuery({
    queryKey: ['fixtures', fixtureId, 'is-live'],
    queryFn: async () => {
      const result = await fixtureService.getById(fixtureId);
      const status = result?.status?.short;
      return ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(status || '');
    },
    enabled: !!fixtureId,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const liveEvents = useQuery({
    queryKey: ['fixtures', fixtureId, 'live-events'],
    queryFn: async () => {
      const result = await fixtureService.getEvents(fixtureId);
      return result;
    },
    enabled: !!fixtureId && isLive.data,
    refetchInterval: isLive.data ? 15000 : false, // Refresh every 15 seconds for live matches
  });

  return {
    isLive: isLive.data,
    events: liveEvents.data,
    isLoading: isLive.isLoading || liveEvents.isLoading,
    recentEvents: liveEvents.data?.slice(-5) || [], // Last 5 events
  };
};