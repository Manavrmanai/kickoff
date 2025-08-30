// routes/teams.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Team = require('../models/team');
const Player = require('../models/player');
const { transformTeamData, transformPlayerData } = require('../utils/dataTransformers');

// GET /api/teams/:id → single team info
router.get('/:id', async (req, res) => {
  const teamId = req.params.id;
  const cacheKey = `team:${teamId}`;
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
      const parsedData = JSON.parse(cachedData);
      
      // Add ?raw=true to get full API response
      if (req.query.raw === 'true') {
        return res.json(parsedData);
      } else {
        const transformedData = transformTeamData(parsedData);
        return res.json(transformedData);
      }
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for team data...');
    const dbTeam = await Team.findOne({ apiId: parseInt(teamId) });
    if (dbTeam) {
      console.log('✅ Team data found in MongoDB');
      
      // Convert MongoDB data to API format for consistency
      const dbData = {
        response: [{
          team: {
            id: dbTeam.apiId,
            name: dbTeam.name,
            code: dbTeam.code,
            country: dbTeam.country,
            founded: dbTeam.founded,
            national: dbTeam.national,
            logo: dbTeam.logo
          },
          venue: dbTeam.venue
        }]
      };
      
      // Refresh cache with DB data (4 hours)
      await redisClient.setEx(cacheKey, 14400, JSON.stringify(dbData));
      await redisClient.disconnect();
      
      // Add ?raw=true to get full API response
      if (req.query.raw === 'true') {
        return res.json(dbData);
      } else {
        const transformedData = transformTeamData(dbData);
        return res.json(transformedData);
      }
    }

    // 3. Data not in cache or DB - fetch from API
    console.log(`🌐 Fetching team ${teamId} from API`);
    const apiData = await footballApi.getTeam(teamId);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Team not found' });
    }

    const item = apiData.response[0];
    const teamData = {
      apiId: item.team.id,
      name: item.team.name,
      code: item.team.code,
      country: item.team.country,
      founded: item.team.founded,
      national: item.team.national,
      logo: item.team.logo,
      venue: item.venue
    };

    // Save to MongoDB
    await Team.findOneAndUpdate(
      { apiId: item.team.id },
      teamData,
      { upsert: true, new: true }
    );
    console.log(`💾 Saved team ${teamId} to MongoDB`);

    // Cache for 4 hours
    await redisClient.setEx(cacheKey, 14400, JSON.stringify(apiData));
    await redisClient.disconnect();
    
    // Add ?raw=true to get full API response
    if (req.query.raw === 'true') {
      return res.json(apiData);
    } else {
      const transformedData = transformTeamData(apiData);
      return res.json(transformedData);
    }
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
      const parsedData = JSON.parse(cachedData);
      
      // Return transformed data for frontend by default
      // Add ?raw=true to get full API response
      if (req.query.raw === 'true') {
        return res.json(parsedData);
      } else {
        const transformedData = transformPlayerData(parsedData);
        return res.json(transformedData);
      }
    }

    // Fetch from API
    console.log(`🌐 Fetching players for team ${teamId} from API`);
    const apiData = await footballApi.getPlayersByTeam(teamId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No players found for this team' });
    }

    // Save players to MongoDB and build transformed data
    const playersMap = new Map();
    let savedCount = 0;
    
    for (const item of apiData.response) {
      const pid = item.player && item.player.id;
      if (!pid) continue;

      // If statistics exist, use first statistics entry for position/number
      const stat = Array.isArray(item.statistics) && item.statistics.length > 0 ? item.statistics[0] : null;

      const playerData = {
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
      };

      // Save to MongoDB with detailed logging
      try {
        console.log(`🔄 Attempting to save player ${item.player.name} (ID: ${pid}) to MongoDB...`);
        console.log(`📝 Player data structure:`, JSON.stringify(playerData, null, 2).substring(0, 200) + '...');
        
        const savedPlayer = await Player.findOneAndUpdate(
          { apiId: pid },
          playerData,
          { upsert: true, new: true }
        );
        savedCount++;
        console.log(`✅ Successfully saved player ${savedPlayer.name} (ID: ${pid}) to MongoDB`);
      } catch (dbErr) {
        console.error(`❌ Failed to save player ${item.player.name} (ID: ${pid}) to MongoDB:`);
        console.error(`❌ Error details:`, dbErr.message);
        console.error(`❌ Full error:`, dbErr);
      }

      const playerObj = {
        id: pid,
        name: item.player.name,
        age: item.player.age,
        number: stat?.games?.number || null,
        position: stat?.games?.position || null,
        photo: item.player.photo,
        nationality: item.player.nationality,
        height: item.player.height,
        weight: item.player.weight
      };

      // avoid duplicates
      playersMap.set(pid, playerObj);
    }

    const players = Array.from(playersMap.values());
    console.log(`📊 Total players processed: ${apiData.response.length}, Saved to MongoDB: ${savedCount}`);

    // Cache the full API response for 6 hours
    await redisClient.setEx(cacheKey, 21600, JSON.stringify(apiData));
    await redisClient.disconnect();
    
    // Return transformed data for frontend by default
    // Add ?raw=true to get full API response
    if (req.query.raw === 'true') {
      return res.json(apiData);
    } else {
      const transformedData = transformPlayerData(apiData);
      return res.json(transformedData);
    }
  } catch (error) {
    console.error(`Error fetching players for team ${teamId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch team players' });
  }
});

module.exports = router;
