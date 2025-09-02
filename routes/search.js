const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Player = require('../models/player');
const Team = require('../models/team');
const League = require('../models/league');
const Fixture = require('../models/fixture'); // Use the correct fixture model
const { transformPlayers, transformTeams, transformLeagues, transformLeague, transformTeam, transformPlayer } = require('../utils/dataTransformers');

// Smart flow helper
async function withRedis(fn) {
  const client = createClient();
  await client.connect();
  try {
    return await fn(client);
  } finally {
    if (client && client.isReady) await client.disconnect();
  }
}

// GET /api/search?type=players&query=ronaldo&season=2023&league=39
router.get('/', async (req, res) => {
  const type = (req.query.type || '').toLowerCase();
  const query = req.query.query || req.query.search || req.query.name || null;
  const season = req.query.season;
  const league = req.query.league;
  const team = req.query.team;
  const date = req.query.date;
  const raw = req.query.raw === 'true';

  if (!type) return res.status(400).json({ error: 'Missing type param. Use ?type=players|teams|fixtures|leagues' });

  try {
    if (type === 'players') {
      if (!query && !team && !league) return res.status(400).json({ error: 'Players search requires query or team or league (e.g. ?query=Messi or &team=33)' });

      const cacheKey = `search:players:${query || ''}:team:${team || ''}:league:${league || ''}:season:${season || ''}`;
      return await withRedis(async redisClient => {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Player search data from Redis Cache');
          return res.json(JSON.parse(cached));
        }

        // Check MongoDB: simple text match by name
        if (query) {
          const dbPlayers = await Player.find({ name: { $regex: query, $options: 'i' } }).limit(50);
          if (dbPlayers && dbPlayers.length) {
              console.log(`✅ Found ${dbPlayers.length} players in MongoDB`);
              const transformed = transformPlayers({ response: dbPlayers.map(p => ({ player: p, statistics: p.statistics || [] })) });
              const out = { response: transformed };
              await redisClient.setEx(cacheKey, 3600, JSON.stringify(out));
              return res.json(out);
            }
        }

        // API call (respect API requirements: if search present and API requires league/team, pass them if provided)
  console.log('🌐 Fetching players from API');
  const apiRes = await footballApi.searchPlayers(query || '', season);
  console.log('🔎 Raw players API response:', apiRes.errors || (apiRes.response && apiRes.response.length));
        if (apiRes.errors && (apiRes.errors.league || apiRes.errors.team)) {
          // Retry using team or league if provided in params
          if (team) {
            const apiByTeam = await footballApi.getPlayersByTeam(team, season);
            if (apiByTeam.response && apiByTeam.response.length) {
              console.log(`🌐 Fetched ${apiByTeam.response.length} players from API by team ${team}`);
              // save raw to DB
              for (const item of apiByTeam.response) {
                await Player.findOneAndUpdate({ apiId: item.player.id }, { apiId: item.player.id, name: item.player.name, statistics: item.statistics || [], photo: item.player.photo }, { upsert: true });
              }
              console.log(`💾 Saved ${apiByTeam.response.length} players to MongoDB (by team)`);
              const transformed = transformPlayers({ response: apiByTeam.response });
              const out = { response: transformed };
              await redisClient.setEx(cacheKey, 3600, JSON.stringify(out));
              return res.json(out);
            }
          }
          if (league) {
            // try fetch teams in league then players by team – fallback is expensive; skip here and return informative error
            return res.status(400).json({ error: 'API requires league or team when using search; provide &league=39 or &team=33' });
          }
        }

  if (!apiRes.response || apiRes.response.length === 0) return res.status(404).json({ error: 'No players found' });

        // Save raw to DB and transform
  for (const p of apiRes.response) {
          // apiRes.response items are objects with player and statistics
          const pl = p.player || p;
          await Player.findOneAndUpdate({ apiId: pl.id }, { apiId: pl.id, name: pl.name, firstname: pl.firstname, lastname: pl.lastname, age: pl.age, nationality: pl.nationality, photo: pl.photo, statistics: p.statistics || [] }, { upsert: true });
        }
  console.log(`💾 Saved ${apiRes.response.length} players to MongoDB (search)`);
        const transformed = transformPlayers(apiRes);
        const out = { response: transformed };
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(out));
        return res.json(out);
      });
    }

    if (type === 'teams') {
      if (!query) return res.status(400).json({ error: 'Teams search requires query param (?query=barcelona)' });
      const cacheKey = `search:teams:${query}`;
      return await withRedis(async redisClient => {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Teams search data from Redis Cache');
          return res.json(JSON.parse(cached));
        }

        // try DB
        const dbTeams = await Team.find({ name: { $regex: query, $options: 'i' } }).limit(50);
        if (dbTeams && dbTeams.length) {
          console.log(`✅ Found ${dbTeams.length} teams in MongoDB`);
          const out = { response: dbTeams.map(t => transformTeam({ team: t })) };
          await redisClient.setEx(cacheKey, 3600, JSON.stringify(out));
          return res.json(out);
        }

        // API
        const apiRes = await footballApi.getTeamsByLeague(query, season); // if query is numeric league id this works, else API teams? we will call /teams?search not implemented in utils
        // fallback: call /teams?search via axios directly
        const axios = require('axios');
  console.log('🌐 Fetching teams from API');
  const resApi = await axios.get('https://v3.football.api-sports.io/teams', { params: { search: query }, headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY } });
        const apiData = resApi.data;
  console.log('🔎 Raw teams API response count:', apiData.response && apiData.response.length);
        if (!apiData.response || apiData.response.length === 0) return res.status(404).json({ error: 'No teams found' });

        // save to DB
  for (const item of apiData.response) {
          const t = item.team || item;
          await Team.findOneAndUpdate({ apiId: t.id }, { apiId: t.id, name: t.name, code: t.code, country: t.country, founded: t.founded, national: t.national, logo: t.logo, venue: item.venue || null }, { upsert: true });
        }
  console.log(`💾 Saved ${apiData.response.length} teams to MongoDB`);
  const transformed = apiData.response.map(r => transformTeam(r));
        const out = { response: transformed };
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(out));
        return res.json(out);
      });
    }

    if (type === 'leagues') {
      if (!query) return res.status(400).json({ error: 'Leagues search requires query param (?query=premier)' });
      const cacheKey = `search:leagues:${query}`;
      return await withRedis(async redisClient => {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Leagues search data from Redis Cache');
          return res.json(JSON.parse(cached));
        }

        // DB search
        const dbLeagues = await League.find({ name: { $regex: query, $options: 'i' } }).limit(50);
        if (dbLeagues && dbLeagues.length) {
          console.log(`✅ Found ${dbLeagues.length} leagues in MongoDB`);
          const out = { response: dbLeagues.map(l => ({ id: l.apiId, name: l.name, country: l.country?.name, logo: l.logo })) };
          await redisClient.setEx(cacheKey, 21600, JSON.stringify(out));
          return res.json(out);
        }

        // API
        const axios = require('axios');
  console.log('🌐 Fetching leagues from API');
  const resApi = await axios.get('https://v3.football.api-sports.io/leagues', { params: { search: query }, headers: { 'x-apisports-key': process.env.FOOTBALL_API_KEY } });
        const apiData = resApi.data;
  console.log('🔎 Raw leagues API response count:', apiData.response && apiData.response.length);
        if (!apiData.response || apiData.response.length === 0) return res.status(404).json({ error: 'No leagues found' });

  for (const item of apiData.response) {
          const l = item.league || item;
          await League.findOneAndUpdate({ apiId: l.id }, { apiId: l.id, name: l.name, type: l.type, logo: l.logo, country: item.country || null, seasons: item.seasons || [] }, { upsert: true });
        }
  console.log(`💾 Saved ${apiData.response.length} leagues to MongoDB`);
  const transformed = apiData.response.map(r => transformLeague(r));
  const out = { response: transformed };
        await redisClient.setEx(cacheKey, 21600, JSON.stringify(out));
        return res.json(out);
      });
    }

    if (type === 'fixtures') {
      const cacheKey = `search:fixtures:team:${team || ''}:league:${league || ''}:date:${date || ''}:season:${season || ''}`;
      return await withRedis(async redisClient => {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          console.log('✅ Fixtures search data from Redis Cache');
          return res.json(JSON.parse(cached));
        }

        // Check DB: Use correct fixture model with proper field queries
        console.log('🔍 Checking MongoDB for fixtures...');
        let dbQuery = {};
        if (team) {
          dbQuery.$or = [
            { 'teams.home.id': parseInt(team) },
            { 'teams.away.id': parseInt(team) }
          ];
        }
        if (league) dbQuery['league.id'] = parseInt(league);
        if (date) dbQuery['fixture.date'] = { $regex: date }; // Date stored as string
        if (season) dbQuery['league.season'] = parseInt(season);
        
        const dbMatches = await Fixture.find(dbQuery).limit(100);
        if (dbMatches && dbMatches.length) {
          console.log(`✅ Found ${dbMatches.length} fixtures in MongoDB`);
          const out = { 
            response: dbMatches.map(m => ({ 
              id: m.fixture?.id, 
              date: m.fixture?.date, 
              homeTeam: m.teams?.home, 
              awayTeam: m.teams?.away, 
              status: m.fixture?.status, 
              score: m.score,
              goals: m.goals,
              league: m.league
            })) 
          };
          
          try {
            await redisClient.setEx(cacheKey, 600, JSON.stringify(out));
            console.log('💾 Fixtures data cached from DB');
          } catch (cacheErr) {
            console.error('Warning: failed to cache fixtures from DB', cacheErr && cacheErr.message);
          }
          
          return res.json(out);
        }

        // API call
        console.log(`🌐 Fetching fixtures for league ${league || 'all'}, season ${season || 'current'} from API`);
        const apiRes = await footballApi.getFixtures(league || '', season);
        if (!apiRes.response || apiRes.response.length === 0) return res.status(404).json({ error: 'No fixtures found' });

        // save to DB using correct fixture model structure
        console.log(`💾 Saving ${apiRes.response.length} fixtures to MongoDB`);
        for (const f of apiRes.response) {
          try {
            await Fixture.findOneAndUpdate(
              { 'fixture.id': f.fixture.id }, 
              { 
                fixture: f.fixture, 
                league: f.league, 
                teams: f.teams, 
                goals: f.goals,
                score: f.score 
              }, 
              { upsert: true }
            );
          } catch (e) { 
            console.error('Error saving fixture:', e.message);
          }
        }
        const transformed = apiRes.response.map(f => ({ id: f.fixture.id, date: f.fixture.date, homeTeam: f.teams.home, awayTeam: f.teams.away, status: f.fixture.status, score: f.score }));
        const out = { response: transformed };
        await redisClient.setEx(cacheKey, 600, JSON.stringify(out));
        console.log(`✅ Cached ${transformed.length} fixtures to Redis`);
        return res.json(out);
      });
    }

    return res.status(400).json({ error: 'Unknown search type' });
  } catch (err) {
    console.error('Search error:', err.message || err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

module.exports = router;
