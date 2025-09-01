// routes/fixtures.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Fixture = require('../models/fixture');
const FixtureStatistics = require('../models/fixtureStatistics');
const FixtureEvents = require('../models/fixtureEvents');
const FixturePlayerStats = require('../models/fixturePlayerStats');
const { transformFixtures, transformFixture, transformFixtureStats, transformFixtureEvents, transformFixturePlayerStats } = require('../utils/dataTransformers');

// GET /api/fixtures?league=39&season=2023 → List fixtures by league & season
router.get('/', async (req, res) => {
  const leagueId = req.query.league;
  const season = req.query.season || new Date().getFullYear();
  const raw = req.query.raw === 'true';
  
  if (!leagueId) {
    return res.status(400).json({ 
      error: 'League ID is required. Use ?league=39&season=2023' 
    });
  }

  const cacheKey = `fixtures:league:${leagueId}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cacheKey = `fixtures:league:${leagueId}:${season}`;
    const cachedData = await redisClient.get(raw ? cacheKey + ':raw' : cacheKey);
    if (cachedData) {
      console.log('✅ Fixtures data from Redis Cache');
      const data = JSON.parse(cachedData);
      
      // Check if cached data is valid (not empty)
      if (!data || !data.response || data.response.length === 0) {
        console.log('⚠️ Cached data is empty/invalid, clearing cache and fetching from API');
        await redisClient.del(cacheKey);
        await redisClient.del(cacheKey + ':raw');
      } else {
        await redisClient.disconnect();
        return res.json(data);
      }
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for fixtures data...');
    const dbFixtures = await Fixture.find({ 
      'league.id': parseInt(leagueId),
      'league.season': parseInt(season)
    });
    
    if (dbFixtures && dbFixtures.length > 0) {
      console.log(`✅ Found ${dbFixtures.length} fixtures in MongoDB`);
      
      // Convert Mongoose documents to plain objects
      const plainFixtures = dbFixtures.map(doc => doc.toObject ? doc.toObject() : doc);
      
      // Convert MongoDB data to API format
      const dbData = {
        response: plainFixtures
      };
      
      await redisClient.disconnect();
      
      if (raw) {
        // Cache raw data for raw requests
        await redisClient.connect();
        await redisClient.setEx(cacheKey + ':raw', 7200, JSON.stringify(dbData));
        await redisClient.disconnect();
        return res.json(dbData);
      } else {
        const transformed = transformFixtures(dbData);
        
        // Cache the final response structure
        const finalResponse = { response: transformed };
        await redisClient.connect();
        await redisClient.setEx(cacheKey, 7200, JSON.stringify(finalResponse));
        await redisClient.disconnect();
        
        return res.json(finalResponse);
      }
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching fixtures for league ${leagueId}, season ${season} from API`);
    const apiData = await footballApi.getFixtures(leagueId, season);

    // Only cache if we have valid data
    if (apiData && apiData.response && apiData.response.length > 0) {
      // Cache the result (2 hours for fixtures)
      await redisClient.setEx(cacheKey, 7200, JSON.stringify(apiData));
      console.log(`✅ Cached ${apiData.response.length} fixtures to Redis`);
    } else {
      console.log('⚠️ No fixtures found, not caching empty result');
    }
    
    // Save individual fixtures to MongoDB
    if (apiData && apiData.response && apiData.response.length > 0) {
      let savedCount = 0;
      for (const fixtureData of apiData.response) {
        try {
          await Fixture.findOneAndUpdate(
            { 'fixture.id': fixtureData.fixture.id },
            { ...fixtureData, apiData: fixtureData },
            { upsert: true, new: true }
          );
          savedCount++;
        } catch (saveError) {
          console.error(`❌ Failed to save fixture ${fixtureData.fixture.id}:`, saveError.message);
        }
      }
      console.log(`💾 Saved ${savedCount}/${apiData.response.length} fixtures to MongoDB`);
    }

    await redisClient.disconnect();

    if (raw) {
      return res.json(apiData);
    } else {
      return res.json({ response: transformFixtures(apiData.response) });
    }

  } catch (error) {
    console.error('❌ Error fetching fixtures:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixtures',
      details: error.message 
    });
  }
});

// GET /api/fixtures/:id → Single fixture info
router.get('/:id', async (req, res, next) => {
  const fixtureId = req.params.id;
  
  // Only handle if ID is purely numeric (no additional path segments)
  if (!/^\d+$/.test(fixtureId)) {
    return next(); // Pass to next route (like /:id/stats)
  }
  
  const cacheKey = `fixture:${fixtureId}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Single fixture data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for fixture data...');
    const dbFixture = await Fixture.findOne({ 'fixture.id': parseInt(fixtureId) });
    if (dbFixture) {
      console.log('✅ Fixture data found in MongoDB');
      
      // Convert MongoDB data to API format
      const dbData = {
        response: [dbFixture]
      };
      
      // Refresh cache with DB data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(dbData));
      await redisClient.disconnect();
      
      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json(dbData);
      } else {
        return res.json({ response: transformFixture(dbData.response[0]) });
      }
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching fixture ${fixtureId} from API`);
    const apiData = await footballApi.getFixture(fixtureId);

    // Cache the result (1 hour for single fixture)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(apiData));
    
    // Save to MongoDB
    if (apiData && apiData.response && apiData.response.length > 0) {
      const fixtureData = apiData.response[0];
      try {
        await Fixture.findOneAndUpdate(
          { 'fixture.id': fixtureData.fixture.id },
          { ...fixtureData, apiData: fixtureData },
          { upsert: true, new: true }
        );
        console.log(`💾 Saved fixture ${fixtureId} to MongoDB`);
      } catch (saveError) {
        console.error(`❌ Failed to save fixture ${fixtureId}:`, saveError.message);
      }
    }

    await redisClient.disconnect();

    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(apiData);
    } else {
      return res.json({ response: transformFixture(apiData.response[0]) });
    }

  } catch (error) {
    console.error('❌ Error fetching single fixture:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixture',
      details: error.message 
    });
  }
});

// GET /api/fixtures/:id/stats → Match statistics
router.get('/:id/stats', async (req, res) => {
  const fixtureId = req.params.id;
  const cacheKey = `fixture_stats:${fixtureId}`;
  const raw = req.query.raw === 'true';
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cachedData = await redisClient.get(raw ? cacheKey + ':raw' : cacheKey);
    if (cachedData) {
      console.log('✅ Fixture stats data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB if cache miss
    console.log(`🔍 Checking MongoDB for fixture ${fixtureId} stats...`);
    const dbData = await FixtureStatistics.findOne({ fixture_id: parseInt(fixtureId) });
    if (dbData) {
      console.log('✅ Found fixture stats in MongoDB, refreshing cache');
      
      // Convert Mongoose document to plain object
      const plainData = dbData.toObject ? dbData.toObject() : dbData;
      
      // Transform DB data to API format
      const apiFormat = {
        response: plainData.response
      };
      
      await redisClient.disconnect();
      
      if (raw) {
        // Cache raw data for raw requests
        await redisClient.connect();
        await redisClient.setEx(cacheKey + ':raw', 1800, JSON.stringify(apiFormat));
        await redisClient.disconnect();
        return res.json(apiFormat);
      } else {
        // Transform and cache the final response
        let transformedStats;
        if (Array.isArray(apiFormat.response)) {
          transformedStats = apiFormat.response.map(teamStats => transformFixtureStats(teamStats));
        } else {
          transformedStats = transformFixtureStats(apiFormat.response);
        }
        
        const finalResponse = { response: transformedStats };
        await redisClient.connect();
        await redisClient.setEx(cacheKey, 1800, JSON.stringify(finalResponse));
        await redisClient.disconnect();
        
        return res.json(finalResponse);
      }
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching fixture stats for ${fixtureId} from API`);
    const apiData = await footballApi.getFixtureStats(fixtureId);

    // Save to MongoDB when fetching fresh data from API
    if (apiData && apiData.response) {
      try {
        await FixtureStatistics.findOneAndUpdate(
          { fixture_id: parseInt(fixtureId) },
          { 
            fixture_id: parseInt(fixtureId),
            response: apiData.response,
            apiData: apiData
          },
          { upsert: true, new: true }
        );
        console.log(`💾 Saved fixture stats for ${fixtureId} to MongoDB`);
      } catch (saveError) {
        console.error(`❌ Failed to save fixture stats for ${fixtureId}:`, saveError.message);
      }
    }

    // Cache the result (30 minutes for live stats)
    await redisClient.setEx(raw ? cacheKey + ':raw' : cacheKey, 1800, JSON.stringify(raw ? apiData : { response: Array.isArray(apiData.response) ? apiData.response.map(teamStats => transformFixtureStats(teamStats)) : transformFixtureStats(apiData.response) }));
    await redisClient.disconnect();

    if (raw) {
      return res.json(apiData);
    } else {
      // Check if apiData.response is an array (multiple teams) or single object
      if (Array.isArray(apiData.response)) {
        // Transform each team's stats
        const transformedStats = apiData.response.map(teamStats => transformFixtureStats(teamStats));
        return res.json({ response: transformedStats });
      } else {
        // Single team stats
        return res.json({ response: transformFixtureStats(apiData.response) });
      }
    }

  } catch (error) {
    console.error('❌ Error fetching fixture stats:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixture statistics',
      details: error.message 
    });
  }
});

// GET /api/fixtures/:id/events → Match events (goals, cards, substitutions)
router.get('/:id/events', async (req, res) => {
  const fixtureId = req.params.id;
  const cacheKey = `fixture_events:${fixtureId}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    let apiData;
    
    if (cachedData) {
      console.log('✅ Fixture events data from Redis Cache');
      const data = JSON.parse(cachedData);
      
      // Check if cached data is valid (not empty)
      if (!data || !data.response || data.response.length === 0) {
        console.log('⚠️ Cached events data is empty/invalid, clearing cache and fetching from API');
        await redisClient.del(cacheKey);
      } else {
        await redisClient.disconnect();
        const raw = req.query.raw === 'true';
        if (raw) {
          return res.json(data);
        } else {
          return res.json({ response: transformFixtureEvents(data) });
        }
      }
    }

    // Fetch from API
    console.log(`🌐 Fetching fixture events for ${fixtureId} from API`);
    apiData = await footballApi.getFixtureEvents(fixtureId);

    // Only cache if we have valid data
    if (apiData && apiData.response && apiData.response.length > 0) {
      await redisClient.setEx(cacheKey, 900, JSON.stringify(apiData));
      console.log(`✅ Cached ${apiData.response.length} events to Redis`);
    } else {
      console.log('⚠️ No events found, not caching empty result');
    }

    // Save to MongoDB only when fetching fresh data from API
    if (apiData && apiData.response) {
      try {
        await FixtureEvents.findOneAndUpdate(
          { fixture_id: parseInt(fixtureId) },
          { 
            fixture_id: parseInt(fixtureId),
            response: apiData.response,
            apiData: apiData
          },
          { upsert: true, new: true }
        );
        console.log(`💾 Saved fixture events for ${fixtureId} to MongoDB`);
      } catch (saveError) {
        console.error(`❌ Failed to save fixture events for ${fixtureId}:`, saveError.message);
      }
    }

    await redisClient.disconnect();

    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(apiData);
    } else {
      return res.json({ response: transformFixtureEvents(apiData) });
    }

  } catch (error) {
    console.error('❌ Error fetching fixture events:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixture events',
      details: error.message 
    });
  }
});

// GET /api/fixtures/:id/players → Match player statistics
router.get('/:id/players', async (req, res) => {
  const fixtureId = req.params.id;
  const cacheKey = `fixture_players:${fixtureId}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Fixture players data from Redis Cache');
      const data = JSON.parse(cachedData);
      
      // Check if cached data is valid (not empty)
      if (!data || !data.response || data.response.length === 0) {
        console.log('⚠️ Cached players data is empty/invalid, clearing cache');
        await redisClient.del(cacheKey);
      } else {
        await redisClient.disconnect();
        const raw = req.query.raw === 'true';
        if (raw) {
          return res.json(data);
        } else {
          // Handle array of teams (transform each team)
          if (Array.isArray(data.response)) {
            const transformedPlayers = data.response.map(teamData => transformFixturePlayerStats(teamData));
            return res.json({ response: transformedPlayers });
          } else {
            return res.json({ response: transformFixturePlayerStats(data.response) });
          }
        }
      }
    }

    // 2. Check MongoDB
    console.log(`🔍 Checking MongoDB for fixture ${fixtureId} players...`);
    const dbData = await FixturePlayerStats.findOne({ fixture_id: parseInt(fixtureId) });
    if (dbData) {
      console.log('✅ Found fixture players in MongoDB, refreshing cache');
      
      // Convert Mongoose document to plain object
      const plainData = dbData.toObject ? dbData.toObject() : dbData;
      
      // Transform DB data to API format
      const apiFormat = {
        response: plainData.response
      };
      
      // Refresh cache with DB data (30 minutes for match player stats)
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiFormat));
      await redisClient.disconnect();
      
      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json(apiFormat);
      } else {
        // Handle array of teams (transform each team)
        if (Array.isArray(apiFormat.response)) {
          const transformedPlayers = apiFormat.response.map(teamData => transformFixturePlayerStats(teamData));
          return res.json({ response: transformedPlayers });
        } else {
          return res.json({ response: transformFixturePlayerStats(apiFormat.response) });
        }
      }
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching fixture players for ${fixtureId} from API`);
    const apiData = await footballApi.getFixturePlayers(fixtureId);

    // Always save to MongoDB (whether from cache or fresh API call)
    if (apiData && apiData.response) {
      try {
        await FixturePlayerStats.findOneAndUpdate(
          { fixture_id: parseInt(fixtureId) },
          { 
            fixture_id: parseInt(fixtureId),
            response: apiData.response,
            apiData: apiData
          },
          { upsert: true, new: true }
        );
        console.log(`💾 Saved fixture players for ${fixtureId} to MongoDB`);
      } catch (saveError) {
        console.error(`❌ Failed to save fixture players for ${fixtureId}:`, saveError.message);
      }
    }

    // Cache the result (30 minutes for match player stats)
    await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiData));
    await redisClient.disconnect();

    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(apiData);
    } else {
      // Handle array of teams (transform each team)
      if (Array.isArray(apiData.response)) {
        const transformedPlayers = apiData.response.map(teamData => transformFixturePlayerStats(teamData));
        return res.json({ response: transformedPlayers });
      } else {
        return res.json({ response: transformFixturePlayerStats(apiData.response) });
      }
    }

  } catch (error) {
    console.error('❌ Error fetching fixture players:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixture players',
      details: error.message 
    });
  }
});

// DEBUG endpoint to check fixture player stats storage
router.get('/:id/players/debug', async (req, res) => {
  const fixtureId = req.params.id;
  
  try {
    const dbData = await FixturePlayerStats.findOne({ fixture_id: parseInt(fixtureId) });
    
    if (dbData) {
      res.json({
        found: true,
        fixture_id: dbData.fixture_id,
        document_keys: Object.keys(dbData.toObject()),
        response_type: Array.isArray(dbData.response) ? 'array' : typeof dbData.response,
        response_length: Array.isArray(dbData.response) ? dbData.response.length : 'not_array',
        sample_data: dbData.response ? (Array.isArray(dbData.response) ? dbData.response[0] : dbData.response) : null
      });
    } else {
      res.json({
        found: false,
        message: `No fixture player stats found for fixture ${fixtureId}`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/fixtures/:id/players/:playerId → Single player stats in match
router.get('/:id/players/:playerId', async (req, res) => {
  const fixtureId = req.params.id;
  const playerId = req.params.playerId;
  const cacheKey = `fixture_player:${fixtureId}:${playerId}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Fixture player data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB for fixture player stats
    console.log(`🔍 Checking MongoDB for player ${playerId} in fixture ${fixtureId}...`);
    const dbData = await FixturePlayerStats.findOne({ fixture_id: parseInt(fixtureId) });
    
    if (dbData && dbData.response) {
      // Find specific player in the data
      let playerFound = null;
      
      for (const team of dbData.response) {
        if (team.players && Array.isArray(team.players)) {
          const player = team.players.find(p => p.player.id == playerId);
          if (player) {
            playerFound = {
              fixture_id: fixtureId,
              team: team.team,
              player: player
            };
            break;
          }
        }
      }
      
      if (playerFound) {
        console.log(`✅ Found player ${playerId} in MongoDB, refreshing cache`);
        
        // Refresh cache with player data (1 hour)
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(playerFound));
        await redisClient.disconnect();
        return res.json(playerFound);
      }
    }

    // 3. If not found in DB, fetch all fixture players from API and extract specific player
    console.log(`🌐 Fetching all players for fixture ${fixtureId} from API to find player ${playerId}`);
    const apiData = await footballApi.getFixturePlayers(fixtureId);

    if (!apiData || !apiData.response) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No player data found for this fixture' });
    }

    // Find specific player in API response
    let playerFound = null;
    
    for (const team of apiData.response) {
      if (team.players && Array.isArray(team.players)) {
        const player = team.players.find(p => p.player.id == playerId);
        if (player) {
          playerFound = {
            fixture_id: fixtureId,
            team: team.team,
            player: player
          };
          break;
        }
      }
    }

    if (!playerFound) {
      await redisClient.disconnect();
      return res.status(404).json({ error: `Player ${playerId} not found in fixture ${fixtureId}` });
    }

    // Save complete fixture player data to MongoDB (if not already saved)
    if (!dbData) {
      await FixturePlayerStats.findOneAndUpdate(
        { fixture_id: parseInt(fixtureId) },
        { 
          fixture_id: parseInt(fixtureId),
          response: apiData.response,
          apiData: apiData
        },
        { upsert: true, new: true }
      );
      console.log(`💾 Saved fixture ${fixtureId} player stats to MongoDB`);
    }

    // Cache the specific player result (1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(playerFound));
    await redisClient.disconnect();

    res.json(playerFound);

  } catch (error) {
    console.error('❌ Error fetching fixture player stats:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch fixture player stats',
      details: error.message 
    });
  }
});

module.exports = router;
