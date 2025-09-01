// routes/teams.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Team = require('../models/team');
const Player = require('../models/player');
const { transformTeam, transformPlayers, transformTeamStats } = require('../utils/dataTransformers');

// GET /api/teams/:id → single team info
router.get('/:id', async (req, res) => {
  const teamId = req.params.id;
  const cacheKey = `team:${teamId}`;
  const raw = req.query.raw === 'true';
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Team data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      
      // Cache now contains clean data, so return directly
      return res.json(data);
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for team data...');
    const dbTeam = await Team.findOne({ apiId: parseInt(teamId) });
    if (dbTeam) {
      console.log('✅ Team data found in MongoDB');
      
      // MongoDB already has clean transformed data
      const cleanTeam = {
        id: dbTeam.apiId,
        name: dbTeam.name,
        logo: dbTeam.logo,
        country: dbTeam.country,
        founded: dbTeam.founded,
        national: dbTeam.national,
        venue: dbTeam.venue
      };
      
      const cleanApiFormat = { response: cleanTeam };
      
      // Cache clean data (4 hours)
      await redisClient.setEx(cacheKey, 14400, JSON.stringify(cleanApiFormat));
      await redisClient.disconnect();
      
      return res.json(raw ? { response: [dbTeam] } : cleanApiFormat);
    }

    // 3. Data not in cache or DB - fetch from API
    console.log(`🌐 Fetching team ${teamId} from API`);
    const apiData = await footballApi.getTeam(teamId);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Team not found' });
    }

    // Transform raw API data immediately
    const item = apiData.response[0];
    const cleanTeam = transformTeam(item);

    // Save transformed data to MongoDB (not raw)
    await Team.findOneAndUpdate(
      { apiId: cleanTeam.id },
      {
        apiId: cleanTeam.id,
        name: cleanTeam.name,
        logo: cleanTeam.logo,
        country: cleanTeam.country,
        founded: cleanTeam.founded,
        national: cleanTeam.national,
        venue: cleanTeam.venue,
        // Keep original for debugging if needed
        originalApiData: raw ? item : null
      },
      { upsert: true, new: true }
    );
    console.log(`💾 Saved transformed team ${teamId} to MongoDB`);

    // Cache transformed data (not raw)
    const cleanApiFormat = { response: cleanTeam };
    await redisClient.setEx(cacheKey, 14400, JSON.stringify(cleanApiFormat));
    await redisClient.disconnect();
    
    return res.json(raw ? apiData : cleanApiFormat);
  } catch (error) {
    console.error(`Error fetching team ${teamId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// GET /api/teams/:id/players → squad of a team
router.get('/:id/players', async (req, res) => {
  const teamId = req.params.id;
  const season = req.query.season || new Date().getFullYear();
  const cacheKey = `team:${teamId}:players:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Team players data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      
      // Cache now contains clean data, so return directly
      return res.json(data);
    }

    // Fetch from API
    console.log(`🌐 Fetching players for team ${teamId} from API`);
    const apiData = await footballApi.getPlayersByTeam(teamId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No players found for this team' });
    }

    // Save original data to MongoDB (for completeness) + return transformed data
    let savedCount = 0;
    for (const item of apiData.response) {
      const pid = item.player && item.player.id;
      if (!pid) continue;

      try {
        await Player.findOneAndUpdate(
          { apiId: pid },
          {
            apiId: pid,
            name: item.player.name,
            firstname: item.player.firstname,
            lastname: item.player.lastname,
            age: item.player.age,
            birth: item.player.birth,
            nationality: item.player.nationality,
            height: item.player.height,
            weight: item.player.weight,
            injured: item.player.injured,
            photo: item.player.photo,
            statistics: item.statistics || []
          },
          { upsert: true, new: true }
        );
        savedCount++;
      } catch (dbErr) {
        console.error(`❌ Failed to save player ${item.player.name}:`, dbErr.message);
      }
    }

    // Transform for frontend response
    const cleanPlayers = transformPlayers(apiData);
    console.log(`📊 Saved ${savedCount} complete players to MongoDB`);

    // Cache transformed data (6 hours)
    const cleanApiFormat = { response: cleanPlayers };
    await redisClient.setEx(cacheKey, 21600, JSON.stringify(cleanApiFormat));
    await redisClient.disconnect();
    
    return res.json(req.query.raw === 'true' ? apiData : cleanApiFormat);
  } catch (error) {
    console.error(`Error fetching players for team ${teamId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch team players' });
  }
});

module.exports = router;
