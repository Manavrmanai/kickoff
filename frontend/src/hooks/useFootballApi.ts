import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '../services/footballApi';
import type {
  League,
  Team,
  Player,
  PlayerStatistics,
  Fixture,
  FixtureEvent,
  FixturePlayerStats,
  FixtureStats,
  Standing,
  TeamStatistics,
} from '../types/api';

// Query Keys
export const QUERY_KEYS = {
  leagues: {
    all: ['leagues'] as const,
    detail: (id: number) => ['leagues', id] as const,
    teams: (id: number, season?: number) => ['leagues', id, 'teams', season] as const,
    standings: (id: number, season?: number) => ['leagues', id, 'standings', season] as const,
  },
  teams: {
    detail: (id: number) => ['teams', id] as const,
    players: (id: number, season?: number) => ['teams', id, 'players', season] as const,
    stats: (id: number, league: number, season?: number) => ['teams', id, 'stats', league, season] as const,
  },
  players: {
    search: (name: string, season?: number) => ['players', 'search', name, season] as const,
    detail: (id: number, season?: number) => ['players', id, season] as const,
    stats: (id: number, league?: number, season?: number) => ['players', id, 'stats', league, season] as const,
  },
  fixtures: {
    byLeague: (league: number, season?: number) => ['fixtures', 'league', league, season] as const,
    detail: (id: number) => ['fixtures', id] as const,
    stats: (id: number) => ['fixtures', id, 'stats'] as const,
    events: (id: number) => ['fixtures', id, 'events'] as const,
    playerStats: (id: number) => ['fixtures', id, 'players'] as const,
  },
  search: {
    unified: (type: string, params: Record<string, any>) => ['search', type, params] as const,
  },
};

// League Hooks
export const useLeagues = (): UseQueryResult<League[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.all,
    queryFn: async () => {
      const result = await api.leagues.getAll();
      return result;
    },
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useLeague = (id: number): UseQueryResult<League, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.detail(id),
    queryFn: async () => {
      const result = await api.leagues.getById(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  });
};

export const useLeagueTeams = (id: number, season?: number): UseQueryResult<Team[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.teams(id, season),
    queryFn: async () => {
      const result = await api.leagues.getTeams(id, season);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
  });
};

export const useLeagueStandings = (id: number, season?: number): UseQueryResult<Standing[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.leagues.standings(id, season),
    queryFn: async () => {
      const result = await api.leagues.getStandings(id, season);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Team Hooks
export const useTeam = (id: number): UseQueryResult<Team, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.teams.detail(id),
    queryFn: async () => {
      const result = await api.teams.getById(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 3, // 3 hours
  });
};

export const useTeamPlayers = (id: number, season?: number): UseQueryResult<Player[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.teams.players(id, season),
    queryFn: async () => {
      const result = await api.teams.getPlayers(id, season);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  });
};

export const useTeamStats = (id: number, league: number, season?: number): UseQueryResult<TeamStatistics, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.teams.stats(id, league, season),
    queryFn: async () => {
      const result = await api.teams.getStats(id, league, season);
      return result;
    },
    enabled: !!(id && league),
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  });
};

// Player Hooks
export const usePlayerSearch = (name: string, season?: number): UseQueryResult<Player[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.players.search(name, season),
    queryFn: async () => {
      const result = await api.players.search(name, season);
      return result;
    },
    enabled: !!name && name.length > 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const usePlayer = (id: number, season?: number): UseQueryResult<PlayerStatistics, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.players.detail(id, season),
    queryFn: async () => {
      const result = await api.players.getById(id, season);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  });
};

export const usePlayerStats = (id: number, league?: number, season?: number): UseQueryResult<PlayerStatistics, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.players.stats(id, league, season),
    queryFn: async () => {
      const result = await api.players.getStats(id, league, season);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
  });
};

// Fixture Hooks
export const useFixtures = (league: number, season?: number): UseQueryResult<Fixture[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures.byLeague(league, season),
    queryFn: async () => {
      const result = await api.fixtures.getByLeague(league, season);
      return result;
    },
    enabled: !!league,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useFixture = (id: number): UseQueryResult<Fixture, Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures.detail(id),
    queryFn: async () => {
      const result = await api.fixtures.getById(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useFixtureEvents = (id: number): UseQueryResult<FixtureEvent[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures.events(id),
    queryFn: async () => {
      const result = await api.fixtures.getEvents(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFixtureStats = (id: number): UseQueryResult<FixtureStats[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures.stats(id),
    queryFn: async () => {
      const result = await api.fixtures.getStats(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useFixturePlayerStats = (id: number): UseQueryResult<FixturePlayerStats[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.fixtures.playerStats(id),
    queryFn: async () => {
      const result = await api.fixtures.getPlayerStats(id);
      return result;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

// Search Hooks
export const useSearch = (
  type: 'players' | 'teams' | 'leagues' | 'fixtures',
  params: Record<string, any>
): UseQueryResult<any[], Error> => {
  return useQuery({
    queryKey: QUERY_KEYS.search.unified(type, params),
    queryFn: async () => {
      const result = await api.search.search({ type, ...params });
      return result;
    },
    enabled: !!type && Object.keys(params).length > 0,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

// Specific Search Hooks
export const useSearchPlayers = (query: string, season?: number, league?: number, team?: number): UseQueryResult<Player[], Error> => {
  return useQuery({
    queryKey: ['search', 'players', query, season, league, team],
    queryFn: async () => {
      const result = await api.search.searchPlayers(query, season, league, team);
      return result;
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
};

export const useSearchTeams = (query: string): UseQueryResult<Team[], Error> => {
  return useQuery({
    queryKey: ['search', 'teams', query],
    queryFn: async () => {
      const result = await api.search.searchTeams(query);
      return result;
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useSearchLeagues = (query: string): UseQueryResult<League[], Error> => {
  return useQuery({
    queryKey: ['search', 'leagues', query],
    queryFn: async () => {
      const result = await api.search.searchLeagues(query);
      return result;
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSearchFixtures = (params: { team?: number; league?: number; season?: number; date?: string }): UseQueryResult<Fixture[], Error> => {
  return useQuery({
    queryKey: ['search', 'fixtures', params],
    queryFn: async () => {
      const result = await api.search.searchFixtures(params);
      return result;
    },
    enabled: !!(params.team || params.league || params.date),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Additional Fixture Hooks
export const useFixturePlayerStatsById = (fixtureId: number, playerId: number): UseQueryResult<any, Error> => {
  return useQuery({
    queryKey: ['fixtures', fixtureId, 'players', playerId],
    queryFn: async () => {
      const result = await api.fixtures.getPlayerStatsById(fixtureId, playerId);
      return result;
    },
    enabled: !!(fixtureId && playerId),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};
