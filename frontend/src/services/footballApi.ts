import { apiClient } from './api';

// Helper function to extract data from response
const extractData = (data: any) => {
  // If the response has a 'response' property, use that; otherwise use the data directly
  return data?.response || data;
};

export const api = {
  leagues: {
    getAll: () => apiClient.get('/leagues').then(extractData),
    getById: (id: number) => apiClient.get(`/leagues/${id}`).then(extractData),
    getTeams: (id: number, season?: number) => apiClient.get(`/leagues/${id}/teams`, { params: { season } }).then(extractData),
    getStandings: (id: number, season?: number) => apiClient.get(`/leagues/${id}/standings`, { params: { season } }).then(extractData),
  },
  teams: {
    getById: (id: number) => apiClient.get(`/teams/${id}`).then(extractData),
    getPlayers: (id: number, season?: number) => apiClient.get(`/teams/${id}/players`, { params: { season } }).then(extractData),
    getStats: (id: number, league: number, season?: number) => apiClient.get(`/teams/${id}/stats`, { params: { league, season } }).then(extractData),
  },
  players: {
    search: (name: string, season?: number) => apiClient.get('/players/search', { params: { name, season } }).then(extractData),
    getById: (id: number, season?: number) => apiClient.get(`/players/${id}`, { params: { season } }).then(extractData),
    getStats: (id: number, league?: number, season?: number) => apiClient.get(`/players/${id}/stats`, { params: { league, season } }).then(extractData),
  },
  fixtures: {
    getByLeague: (league: number, season?: number) => apiClient.get('/fixtures', { params: { league, season } }).then(extractData),
    getById: (id: number) => apiClient.get(`/fixtures/${id}`).then(extractData),
    getStats: (id: number) => apiClient.get(`/fixtures/${id}/stats`).then(extractData),
    getEvents: (id: number) => apiClient.get(`/fixtures/${id}/events`).then(extractData),
    getPlayerStats: (id: number) => apiClient.get(`/fixtures/${id}/players`).then(extractData),
    getPlayerStatsById: (fixtureId: number, playerId: number) => apiClient.get(`/fixtures/${fixtureId}/players/${playerId}`).then(extractData),
  },
  search: {
    search: (params: any) => apiClient.get('/search', { params }).then(extractData),
    searchPlayers: (query: string, season?: number, league?: number, team?: number) => 
      apiClient.get('/search', { params: { type: 'players', query, season, league, team } }).then(extractData),
    searchTeams: (query: string) => 
      apiClient.get('/search', { params: { type: 'teams', query } }).then(extractData),
    searchLeagues: (query: string) => 
      apiClient.get('/search', { params: { type: 'leagues', query } }).then(extractData),
    searchFixtures: (params: { team?: number; league?: number; season?: number; date?: string }) => 
      apiClient.get('/search', { params: { type: 'fixtures', ...params } }).then(extractData),
  },
  statistics: {
    getTeamStats: (teamId: number, leagueId: number, season?: number) => 
      apiClient.get(`/teams/${teamId}/stats`, { params: { league: leagueId, season } }).then(extractData),
    getPlayerStats: (playerId: number, league?: number, season?: number) => 
      apiClient.get(`/players/${playerId}/stats`, { params: { league, season } }).then(extractData),
  },
};

export const leagueService = api.leagues;
export const teamService = api.teams;
export const playerService = api.players;
export const fixtureService = api.fixtures;
export const searchService = api.search;

export default api;
