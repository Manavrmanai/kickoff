// utils/footballApi.js
const axios = require('axios');
const { DEFAULT_SEASON } = require('./config');

const API_KEY = process.env.FOOTBALL_API_KEY;
if (!API_KEY) console.warn('Warning: FOOTBALL_API_KEY not set. Requests will fail.');

/**
 * API‑Sports v3 base URL and exact endpoint templates used by this project:
 *
 * Base: https://v3.football.api-sports.io
 * Headers: { 'x-apisports-key': 'YOUR_API_KEY' }
 *
 * Leagues
 * - GET /leagues
 * - GET /leagues?id={leagueId}
 *
 * Teams
 * - GET /teams?league={leagueId}&season={season}
 * - GET /teams?id={teamId}
 *
 * Standings
 * - GET /standings?league={leagueId}&season={season}
 *
 * Players
 * - GET /players?team={teamId}&season={season}&page={page}
 * - GET /players?id={playerId}&season={season}
 *
 * Statistics
 * - GET /teams/statistics?league={leagueId}&season={season}&team={teamId}
 */

const api = axios.create({
  baseURL: 'https://v3.football.api-sports.io',
  headers: {
    'x-apisports-key': API_KEY,
    'Accept': 'application/json'
  },
  timeout: 10000
});

/**
 * Get all leagues
 * External: GET https://v3.football.api-sports.io/leagues
 */
async function getLeagues() {
  const res = await api.get('/leagues');
  return res.data;
}

/**
 * Get single league by ID
 * External: GET https://v3.football.api-sports.io/leagues?id={id}
 */
async function getLeague(id) {
  const res = await api.get('/leagues', { params: { id } });
  return res.data;
}

/**
 * Get teams in a league
 * External: GET https://v3.football.api-sports.io/teams?league={leagueId}&season={season}
 */
async function getTeamsByLeague(leagueId, season) {
  const res = await api.get('/teams', {
    params: {
      league: leagueId,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

/**
 * Get single team by ID
 * External: GET https://v3.football.api-sports.io/teams?id={teamId}
 */
async function getTeam(id) {
  const res = await api.get('/teams', { params: { id } });
  return res.data;
}

/**
 * Get league standings
 * External: GET https://v3.football.api-sports.io/standings?league={leagueId}&season={season}
 */
async function getStandings(leagueId, season) {
  const res = await api.get('/standings', {
    params: {
      league: leagueId,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

/**
 * Get players in a team (fetches all pages)
 * External: GET https://v3.football.api-sports.io/players?team={teamId}&season={season}&page={page}
 */
async function getPlayersByTeam(teamId, season) {
  const results = [];
  const year = season || DEFAULT_SEASON;
  let page = 1;
  while (true) {
    const res = await api.get('/players', {
      params: { team: teamId, season: year, page }
    });
    if (!res || !res.data) break;
    const data = res.data;
    if (Array.isArray(data.response) && data.response.length > 0) {
      results.push(...data.response);
    }
    const totalPages = data.paging && data.paging.total ? data.paging.total : 1;
    if (page >= totalPages) break;
    page += 1;
  }
  // return in the same top-level shape the API uses
  return { response: results };
}

/**
 * Get single player by ID
 * External: GET https://v3.football.api-sports.io/players?id={playerId}&season={season}
 */
async function getPlayer(id, season) {
  const res = await api.get('/players', {
    params: {
      id: id,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

/**
 * Search players by name
 * External: GET https://v3.football.api-sports.io/players?search={name}&season={season}
 */
async function searchPlayers(name, season) {
  const res = await api.get('/players', {
    params: {
      search: name,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

/**
 * Get fixtures by league and season
 * External: GET https://v3.football.api-sports.io/fixtures?league={league_id}&season={season}
 */
async function getFixtures(leagueId, season) {
  const res = await api.get('/fixtures', {
    params: {
      league: leagueId,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

/**
 * Get single fixture by ID
 * External: GET https://v3.football.api-sports.io/fixtures?id={fixture_id}
 */
async function getFixture(fixtureId) {
  const res = await api.get('/fixtures', {
    params: {
      id: fixtureId
    }
  });
  return res.data;
}

/**
 * Get fixture statistics
 * External: GET https://v3.football.api-sports.io/fixtures/statistics?fixture={fixture_id}
 */
async function getFixtureStats(fixtureId) {
  const res = await api.get('/fixtures/statistics', {
    params: {
      fixture: fixtureId
    }
  });
  return res.data;
}

/**
 * Get fixture events
 * External: GET https://v3.football.api-sports.io/fixtures/events?fixture={fixture_id}
 */
async function getFixtureEvents(fixtureId) {
  const res = await api.get('/fixtures/events', {
    params: {
      fixture: fixtureId
    }
  });
  return res.data;
}

/**
 * Get fixture players (player stats in a specific match)
 * External: GET https://v3.football.api-sports.io/fixtures/players?fixture={fixture_id}
 */
async function getFixturePlayers(fixtureId) {
  const res = await api.get('/fixtures/players', {
    params: {
      fixture: fixtureId
    }
  });
  return res.data;
}

/**
 * Get team statistics
 * External: GET https://v3.football.api-sports.io/teams/statistics?league={leagueId}&season={season}&team={teamId}
 */
async function getTeamStats(teamId, leagueId, season) {
  const res = await api.get('/teams/statistics', {
    params: {
      team: teamId,
      league: leagueId,
  season: season || DEFAULT_SEASON
    }
  });
  return res.data;
}

module.exports = {
  getLeagues,
  getLeague,
  getTeamsByLeague,
  getTeam,
  getStandings,
  getPlayersByTeam,
  getPlayer,
  searchPlayers,
  getTeamStats,
  getFixtures,
  getFixture,
  getFixtureStats,
  getFixtureEvents,
  getFixturePlayers
};
