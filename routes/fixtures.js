// routes/fixtures.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Fixture = require('../models/fixture');
const FixtureStatistics = require('../models/fixtureStatistics');
const FixtureEvents = require('../models/fixtureEvents');
const FixturePlayerStats = require('../models/fixturePlayerStats');
const dataTransformers = require('../utils/dataTransformers');

// GET /api/fixtures?league=39&season=2023 → List fixtures by league & season
router.get('/', async (req, res) => {
  const leagueId = req.query.league;
  const season = req.query.season || new Date().getFullYear();
  
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
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Fixtures data from Redis Cache');
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for fixtures data...');
    const dbFixtures = await Fixture.find({ 
      'league.id': parseInt(leagueId),
      'league.season': parseInt(season)
    });
    
    if (dbFixtures && dbFixtures.length > 0) {
      console.log(`✅ Found ${dbFixtures.length} fixtures in MongoDB`);
      
      // Convert MongoDB data to API format
      const dbData = {
        response: dbFixtures
      };
      
      // Refresh cache with DB data (2 hours)
      await redisClient.setEx(cacheKey, 7200, JSON.stringify(dbData));
      await redisClient.disconnect();
      return res.json(dbData);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching fixtures for league ${leagueId}, season ${season} from API`);
    const apiData = await footballApi.getFixtures(leagueId, season);

    // Cache the result (2 hours for fixtures)
    await redisClient.setEx(cacheKey, 7200, JSON.stringify(apiData));
    
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

    // Add ?raw=true to get full API response
    if (req.query.raw === 'true') {
      return res.json(apiData);
    }

    // Return transformed data for frontend
    const transformedData = {
      ...apiData,
      response: apiData.response?.map(fixture => dataTransformers.transformFixture(fixture)) || []
    };

    res.json(transformedData);

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
router.get('/:id', async (req, res) => {
  const fixtureId = req.params.id;
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
      
      // Add ?raw=true to get full API response
      if (req.query.raw === 'true') {
        return res.json(dbData);
      }

      // Return transformed data for frontend
      const transformedData = {
        ...dbData,
        response: dbData.response?.map(fixture => dataTransformers.transformFixture(fixture)) || []
      };
      return res.json(transformedData);
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

    // Add ?raw=true to get full API response
    if (req.query.raw === 'true') {
      return res.json(apiData);
    }

    // Return transformed data for frontend
    const transformedData = {
      ...apiData,
      response: apiData.response?.map(fixture => dataTransformers.transformFixture(fixture)) || []
    };

    res.json(transformedData);

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
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    let apiData;
    
    if (cachedData) {
      console.log('✅ Fixture stats data from Redis Cache');
      apiData = JSON.parse(cachedData);
    } else {
      // Fetch from API
      console.log(`🌐 Fetching fixture stats for ${fixtureId} from API`);
      apiData = await footballApi.getFixtureStats(fixtureId);

      // Cache the result (30 minutes for live stats)
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiData));
    }

    // Always save to MongoDB (whether from cache or fresh API call)
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

    await redisClient.disconnect();

    // Return raw API response (statistics are already well-structured)
    res.json(apiData);

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
      apiData = JSON.parse(cachedData);
    } else {
      // Fetch from API
      console.log(`🌐 Fetching fixture events for ${fixtureId} from API`);
      apiData = await footballApi.getFixtureEvents(fixtureId);

      // Cache the result (15 minutes for live events)
      await redisClient.setEx(cacheKey, 900, JSON.stringify(apiData));
    }

    // Always save to MongoDB (whether from cache or fresh API call)
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

    // Return raw API response (events are already well-structured)
    res.json(apiData);

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
      await redisClient.disconnect();
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB
    console.log(`🔍 Checking MongoDB for fixture ${fixtureId} players...`);
    const dbData = await FixturePlayerStats.findOne({ fixture_id: parseInt(fixtureId) });
    if (dbData) {
      console.log('✅ Found fixture players in MongoDB, refreshing cache');
      
      // Transform DB data to API format
      const apiFormat = {
        response: dbData.response
      };
      
      // Refresh cache with DB data (30 minutes for match player stats)
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiFormat));
      await redisClient.disconnect();
      return res.json(apiFormat);
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

    // Return raw API response (player stats are already well-structured)
    res.json(apiData);

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
