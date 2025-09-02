// routes/statistics.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const TeamStatistics = require('../models/teamStatistics');
const PlayerStatistics = require('../models/playerStatistics');
const { transformTeamStats, transformPlayerStats } = require('../utils/dataTransformers');

// GET /api/teams/:id/stats → team statistics
router.get('/teams/:id/stats', async (req, res) => {
  const teamId = req.params.id;
  const leagueId = req.query.league;
  const season = req.query.season || new Date().getFullYear();
  
  if (!leagueId) {
    return res.status(400).json({ error: 'League ID is required as query parameter' });
  }

  const cacheKey = `team:${teamId}:stats:${leagueId}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Team stats data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      
      // Cache now contains clean data, so return directly
      return res.json(data);
    }

    // 2. Check MongoDB
    console.log(`🔍 Checking MongoDB for team ${teamId} stats...`);
    const dbData = await TeamStatistics.findOne({ 
      'team.id': parseInt(teamId),
      'league.id': parseInt(leagueId),
      'league.season': parseInt(season)
    });
    
    if (dbData) {
      console.log('✅ Found team stats in MongoDB, refreshing cache');
      
      // Transform DB data to API format
      const apiFormat = {
        response: dbData
      };
      
      // Refresh cache with DB data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(apiFormat));
      await redisClient.disconnect();
      
      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json(apiFormat);
      } else {
        return res.json({ response: transformTeamStats(apiFormat.response) });
      }
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching stats for team ${teamId} from API`);
    const apiData = await footballApi.getTeamStats(teamId, leagueId, season);

    if (!apiData) {
      await redisClient.disconnect();
      return res.status(500).json({ error: 'Failed to fetch statistics from API' });
    }

    // Return the raw API response (same as terminal output) and cache it
    // The response can be an object (with data) or an empty array
    let result;
    if (apiData.response && typeof apiData.response === 'object' && !Array.isArray(apiData.response)) {
      // Response is an object with statistics data
      result = apiData.response;
    } else if (Array.isArray(apiData.response) && apiData.response.length > 0) {
      // Response is an array with data
      result = apiData.response[0];
    } else {
      // No data available
      result = { 
        message: 'No statistics available for this team/league/season combination',
        team: teamId,
        league: leagueId, 
        season: season 
      };
    }
    
    // Save to MongoDB if we have data
    if (result && result.team && result.league) {
      try {
        console.log(`💾 Saving team statistics to MongoDB for team ${result.team.id}, league ${result.league.id}, season ${result.league.season}`);
        const savedDoc = await TeamStatistics.findOneAndUpdate(
          {
            'team.id': result.team.id,
            'league.id': result.league.id,
            'league.season': result.league.season
          },
          result,
          { upsert: true, new: true }
        );
        console.log(`✅ Successfully saved team statistics to MongoDB: ${savedDoc._id}`);
      } catch (dbErr) {
        console.error('❌ Failed to save team statistics to DB:', dbErr.message);
        console.error('Full error:', dbErr);
        // Continue execution even if DB save fails
      }
    } else {
      console.log('⚠️ Skipping MongoDB save: missing team or league data');
    }

    try {
      await redisClient.setEx(cacheKey, 7200, JSON.stringify(result));
    } catch (cacheErr) {
      console.error('Warning: failed to set team stats cache', cacheErr && cacheErr.message);
    }
    await redisClient.disconnect();
    
    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(result);
    } else {
      return res.json({ response: transformTeamStats(result) });
    }
  } catch (error) {
    console.error(`Error fetching stats for team ${teamId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch team statistics' });
  }
});

// GET /api/players/:id/stats → player statistics
router.get('/players/:id/stats', async (req, res) => {
  const playerId = req.params.id;
  const season = req.query.season || new Date().getFullYear();
  const league = req.query.league; // Add league parameter
  const cacheKey = `player:${playerId}:stats:${league || 'all'}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Player stats data from Redis Cache');
      const data = JSON.parse(cachedData);
      
      // Check if cached data is valid (not null/empty)
      if (!data || !data.player || !data.statistics || data.statistics.length === 0) {
        console.log('⚠️ Cached data is empty/invalid, clearing cache and fetching from API');
        await redisClient.del(cacheKey);
      } else {
        await redisClient.disconnect();
        const raw = req.query.raw === 'true';
        if (raw) {
          return res.json({ response: [data] });
        } else {
          return res.json({ response: transformPlayerStats(data) });
        }
      }
    }

    // Check MongoDB after cache miss
    console.log(`🔍 Checking MongoDB for player ${playerId} stats (season ${season})...`);
    let dbData = await PlayerStatistics.findOne({ 
      'player.id': parseInt(playerId), 
      'statistics.league.season': parseInt(season) 
    });

    if (dbData) {
      console.log(`✅ Found player ${playerId} stats in MongoDB`);
      
      // Filter by league if provided
      let filteredStats = dbData.statistics;
      if (league) {
        filteredStats = dbData.statistics.filter(stat => 
          stat.league && stat.league.id === parseInt(league)
        );
        console.log(`🎯 Filtered to ${filteredStats.length} stats for league ${league}`);
      }

      // Create the data structure to cache and return
      const dataToCache = {
        ...dbData.toObject(),
        statistics: filteredStats
      };

      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(dataToCache));
        console.log('💾 Player stats data cached from DB');
      } catch (cacheErr) {
        console.error('Warning: failed to cache player stats from DB', cacheErr && cacheErr.message);
      }
      await redisClient.disconnect();

      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json({ response: [dataToCache] });
      } else {
        return res.json({ response: transformPlayerStats(dataToCache) });
      }
    }

    // Fetch from API as last resort
    console.log(`🌐 Fetching stats for player ${playerId} from API`);
    const apiData = await footballApi.getPlayer(playerId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      console.log(`⚠️ No player data found for player ${playerId} in season ${season}`);
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Player statistics not found' });
    }

    const playerData = apiData.response[0] || {};
    
    // Check if player has statistics for this season
    if (!playerData.statistics || playerData.statistics.length === 0) {
      console.log(`⚠️ No statistics found for player ${playerId} in season ${season}`);
      await redisClient.disconnect();
      return res.status(404).json({ error: `No statistics found for player ${playerId} in season ${season}` });
    }
    
    console.log(`✅ Found ${playerData.statistics.length} stat records for player ${playerId}`);
    
    // Filter by league if provided
    let filteredStats = playerData.statistics;
    if (league) {
      filteredStats = playerData.statistics.filter(stat => 
        stat.league && stat.league.id === parseInt(league)
      );
      console.log(`🎯 Filtered to ${filteredStats.length} stats for league ${league}`);
      
      if (filteredStats.length === 0) {
        console.log(`⚠️ No statistics found for player ${playerId} in league ${league} for season ${season}`);
        await redisClient.disconnect();
        return res.status(404).json({ 
          error: `No statistics found for player ${playerId} in league ${league} for season ${season}` 
        });
      }
    }

    // Create the data structure to cache and return
    const dataToCache = {
      ...playerData,
      statistics: filteredStats
    };
    
    // Save to MongoDB if we have data
    if (playerData.player) {
      try {
        await PlayerStatistics.findOneAndUpdate(
          { 'player.id': playerData.player.id, 'statistics.league.season': season },
          playerData,
          { upsert: true, new: true }
        );
        console.log(`💾 Saved player ${playerId} statistics to MongoDB`);
      } catch (dbErr) {
        console.error('Warning: Failed to save player statistics to DB:', dbErr.message);
      }
    }

    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(dataToCache));
      console.log(`💾 Cached player ${playerId} statistics (${filteredStats.length} records)`);
    } catch (cacheErr) {
      console.error('Warning: failed to set player stats cache', cacheErr && cacheErr.message);
    }
    await redisClient.disconnect();
    
    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(dataToCache);
    } else {
      return res.json({ response: transformPlayerStats(dataToCache) });
    }
  } catch (error) {
    console.error(`Error fetching stats for player ${playerId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch player statistics' });
  }
});

module.exports = router;
