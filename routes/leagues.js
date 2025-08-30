// routes/leagues.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const League = require('../models/league');
const Team = require('../models/team');
const Standing = require('../models/standing');

// GET /api/leagues → list all leagues
router.get('/', async (req, res) => {
  const cacheKey = 'leagues:all';
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Leagues data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB
    console.log('🔍 Checking MongoDB for leagues...');
    const dbData = await League.find({});
    if (dbData && dbData.length > 0) {
      console.log('✅ Found leagues in MongoDB, refreshing cache');
      
      // Transform DB data to API format
      const apiFormat = {
        response: dbData
      };
      
      // Refresh cache with DB data (6 hours)
      await redisClient.setEx(cacheKey, 21600, JSON.stringify(apiFormat));
      await redisClient.disconnect();
      return res.json(apiFormat);
    }

    // 3. Data not found - fetch from API
    console.log('🌐 Fetching leagues from API');
    const apiData = await footballApi.getLeagues();
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No leagues found' });
    }

    // Save to MongoDB
    for (const item of apiData.response) {
      const leagueData = {
        apiId: item.league.id,
        name: item.league.name,
        type: item.league.type,
        logo: item.league.logo,
        country: {
          name: item.country.name,
          code: item.country.code,
          flag: item.country.flag
        },
        seasons: item.seasons.map(season => ({
          year: season.year,
          start: season.start,
          end: season.end,
          current: season.current
        }))
      };

      await League.findOneAndUpdate(
        { apiId: item.league.id },
        leagueData,
        { upsert: true, new: true }
      );
    }
    console.log(`💾 Saved ${apiData.response.length} leagues to MongoDB`);

    // Cache the result (6 hours)
    await redisClient.setEx(cacheKey, 21600, JSON.stringify(apiData));
    await redisClient.disconnect();

    res.json(apiData);

  } catch (error) {
    console.error('❌ Error fetching leagues:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch leagues',
      details: error.message 
    });
  }
});

// GET /api/leagues/:id → single league info
router.get('/:id', async (req, res) => {
  const leagueId = req.params.id;
  const cacheKey = `league:${leagueId}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ League data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB
    console.log(`🔍 Checking MongoDB for league ${leagueId}...`);
    const dbData = await League.findOne({ apiId: parseInt(leagueId) });
    if (dbData) {
      console.log('✅ Found league in MongoDB, refreshing cache');
      
      // Transform DB data to API format
      const apiFormat = {
        response: [dbData]
      };
      
      // Refresh cache with DB data (2 hours)
      await redisClient.setEx(cacheKey, 7200, JSON.stringify(apiFormat));
      await redisClient.disconnect();
      return res.json(apiFormat);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching league ${leagueId} from API`);
    const apiData = await footballApi.getLeague(leagueId);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'League not found' });
    }

    // Save to MongoDB
    const item = apiData.response[0];
    const leagueData = {
      apiId: item.league.id,
      name: item.league.name,
      type: item.league.type,
      logo: item.league.logo,
      country: {
        name: item.country.name,
        code: item.country.code,
        flag: item.country.flag
      },
      seasons: item.seasons.map(season => ({
        year: season.year,
        start: new Date(season.start),
        end: new Date(season.end),
        current: season.current
      }))
    };

    await League.findOneAndUpdate(
      { apiId: item.league.id },
      leagueData,
      { upsert: true, new: true }
    );
    console.log(`💾 Saved league ${leagueId} to MongoDB`);

    // Cache the result (2 hours)
    await redisClient.setEx(cacheKey, 7200, JSON.stringify(apiData));
    await redisClient.disconnect();
    
    res.json(apiData);
  } catch (error) {
    console.error(`Error fetching league ${leagueId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch league' });
  }
});

// GET /api/leagues/:id/teams → teams in a league
router.get('/:id/teams', async (req, res) => {
  const leagueId = req.params.id;
  const season = req.query.season || new Date().getFullYear();
  const cacheKey = `league:${leagueId}:teams:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ League teams data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from API
    console.log(`🌐 Fetching teams for league ${leagueId} from API`);
    const apiData = await footballApi.getTeamsByLeague(leagueId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No teams found for this league' });
    }

    // Transform and save to database
    const teams = [];
    for (const item of apiData.response) {
      const teamData = {
        apiId: item.team.id,
        name: item.team.name,
        code: item.team.code,
        country: item.team.country,
        founded: item.team.founded,
        national: item.team.national,
        logo: item.team.logo,
        venue: item.venue,
        league: {
          id: leagueId,
          season: season
        }
      };

      // Save to MongoDB
      await Team.findOneAndUpdate(
        { apiId: item.team.id },
        teamData,
        { upsert: true, new: true }
      );

      teams.push({
        id: item.team.id,
        name: item.team.name,
        code: item.team.code,
        country: item.team.country,
        founded: item.team.founded,
        logo: item.team.logo,
        venue: item.venue
      });
    }

    // Cache for 2 hours
    await redisClient.setEx(cacheKey, 7200, JSON.stringify(teams));
    await redisClient.disconnect();
    
    res.json(teams);
  } catch (error) {
    console.error(`Error fetching teams for league ${leagueId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch teams for league' });
  }
});

// GET /api/leagues/:id/standings → points table
router.get('/:id/standings', async (req, res) => {
  const leagueId = req.params.id;
  const season = req.query.season || new Date().getFullYear();
  const cacheKey = `standings:${leagueId}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Standings data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // Fetch from API and return raw response (same as terminal output)
    console.log(`🌐 Fetching standings for league ${leagueId} from API`);
    const apiData = await footballApi.getStandings(leagueId, season);
    
    if (!apiData || !Array.isArray(apiData.response) || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No standings found for this league' });
    }

    // Save standings data to MongoDB
    for (const leagueStanding of apiData.response) {
      const leagueInfo = leagueStanding && leagueStanding.league ? leagueStanding.league : {};
      const groups = leagueInfo.standings || leagueStanding.standings || [];
      
      for (const group of groups) {
        if (!Array.isArray(group)) continue;
        for (const teamStanding of group) {
          try {
            const standingData = {
              league: {
                id: leagueInfo.id ?? leagueId,
                name: leagueInfo.name ?? null,
                country: leagueInfo.country ?? null,
                logo: leagueInfo.logo ?? null,
                season: leagueInfo.season ?? season
              },
              team: {
                id: teamStanding?.team?.id ?? null,
                name: teamStanding?.team?.name ?? null,
                logo: teamStanding?.team?.logo ?? null
              },
              rank: teamStanding?.rank ?? null,
              points: teamStanding?.points ?? null,
              goalsDiff: teamStanding?.goalsDiff ?? null,
              group: teamStanding?.group ?? null,
              form: teamStanding?.form ?? null,
              status: teamStanding?.status ?? null,
              description: teamStanding?.description ?? null,
              all: teamStanding?.all ?? null,
              home: teamStanding?.home ?? null,
              away: teamStanding?.away ?? null,
              update: teamStanding?.update ? new Date(teamStanding.update) : null
            };

            // Save to MongoDB
            await Standing.findOneAndUpdate(
              {
                'league.id': standingData.league.id,
                'team.id': standingData.team.id,
                'league.season': standingData.league.season
              },
              standingData,
              { upsert: true, new: true }
            );
          } catch (dbErr) {
            console.error('Warning: Failed to save standing to DB for team', teamStanding?.team?.id, dbErr.message);
          }
        }
      }
    }

    // Cache the full API response for 30 minutes and return it unchanged
    try {
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiData));
    } catch (cacheErr) {
      console.error('Warning: failed to set standings cache', cacheErr && cacheErr.message);
    }
    await redisClient.disconnect();
    return res.json(apiData);
  } catch (error) {
    console.error(`Error fetching standings for league ${leagueId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

module.exports = router;
