// routes/players.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Player = require('../models/player');
const { transformPlayers, transformPlayer, transformPlayerStats } = require('../utils/dataTransformers');

// GET /api/players/search?name=ronaldo&season=2023 → search players by name
router.get('/search', async (req, res) => {
  const playerName = req.query.name;
  const { DEFAULT_SEASON } = require('../utils/config');
  const season = req.query.season || DEFAULT_SEASON;
  const raw = req.query.raw === 'true';
  
  if (!playerName) {
    return res.status(400).json({ error: 'Player name is required. Use ?name=ronaldo' });
  }

  const cacheKey = `player_search:${playerName}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Player search data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      // Cache now contains clean data, so return directly
      return res.json(data);
    }

    // 2. Check MongoDB for players matching search
    console.log('🔍 Checking MongoDB for player search...');
    const dbPlayers = await Player.find({ 
      name: { $regex: playerName, $options: 'i' } 
    });
    
    if (dbPlayers && dbPlayers.length > 0) {
      console.log(`✅ Found ${dbPlayers.length} players in MongoDB`);
      
      // MongoDB has complete data, transform for frontend
      const cleanPlayers = dbPlayers.map(p => ({
        id: p.apiId,
        name: p.name,
        age: p.age,
        nationality: p.nationality,
        photo: p.photo,
        position: p.statistics?.[0]?.games?.position || null,
        height: p.height,
        weight: p.weight
      }));
      
      const cleanApiFormat = { response: cleanPlayers };
      
      // Cache clean data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(cleanApiFormat));
      await redisClient.disconnect();
      return res.json(raw ? { response: dbPlayers } : cleanApiFormat);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Searching for player "${playerName}" from API`);
  const apiData = await footballApi.searchPlayers(playerName, season);
  console.log('🔎 Raw API response:', JSON.stringify(apiData, null, 2));

    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No players found' });
    }

    // Save original data to MongoDB (for completeness) + return transformed data
    for (const player of apiData.response) {
      await Player.findOneAndUpdate(
        { apiId: player.player.id },
        {
          apiId: player.player.id,
          name: player.player.name,
          firstname: player.player.firstname,
          lastname: player.player.lastname,
          age: player.player.age,
          birth: player.player.birth,
          nationality: player.player.nationality,
          height: player.player.height,
          weight: player.player.weight,
          injured: player.player.injured,
          photo: player.player.photo,
          statistics: player.statistics || []
        },
        { upsert: true, new: true }
      );
    }

    // Transform for frontend response
    const transformedPlayers = transformPlayers(apiData);
    console.log(`💾 Saved ${apiData.response.length} complete players to MongoDB`);

    // Cache transformed data (1 hour)
    const cleanApiFormat = { response: transformedPlayers };
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(cleanApiFormat));
    await redisClient.disconnect();
    
    return res.json(raw ? apiData : cleanApiFormat);

  } catch (error) {
    console.error('❌ Error searching players:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to search players',
      details: error.message 
    });
  }
});

// GET /api/players/:id → single player info
router.get('/:id', async (req, res) => {
  const playerId = req.params.id;
  const { DEFAULT_SEASON } = require('../utils/config');
  const season = req.query.season || DEFAULT_SEASON;
  const cacheKey = `player:${playerId}:${season}`;
  let redisClient;

  try {
    // Initialize Redis client
    redisClient = createClient();
    await redisClient.connect();

    // 1. Check Redis cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Player data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      // Cache now contains clean data, so return directly
      return res.json(data);
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for player data...');
    const dbPlayer = await Player.findOne({ apiId: parseInt(playerId) });
    if (dbPlayer) {
      console.log('✅ Player data found in MongoDB');
      
      // MongoDB has complete data, transform for frontend  
      const cleanPlayer = {
        id: dbPlayer.apiId,
        name: dbPlayer.name,
        age: dbPlayer.age,
        nationality: dbPlayer.nationality,
        photo: dbPlayer.photo,
        position: dbPlayer.statistics?.[0]?.games?.position || null,
        height: dbPlayer.height,
        weight: dbPlayer.weight
      };
      
      const cleanApiFormat = { response: cleanPlayer };
      
      // Cache clean data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(cleanApiFormat));
      await redisClient.disconnect();
      return res.json(req.query.raw === 'true' ? { response: [dbPlayer] } : cleanApiFormat);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching player ${playerId} from API`);
    const apiData = await footballApi.getPlayer(playerId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Player not found' });
    }

    // Transform player immediately
    const cleanPlayer = transformPlayer(apiData.response[0]);

    // Save original data to MongoDB (for completeness)
    await Player.findOneAndUpdate(
      { apiId: cleanPlayer.id },
      {
        apiId: cleanPlayer.id,
        name: cleanPlayer.name,
        firstname: apiData.response[0].player.firstname,
        lastname: apiData.response[0].player.lastname,
        age: cleanPlayer.age,
        birth: apiData.response[0].player.birth,
        nationality: cleanPlayer.nationality,
        height: cleanPlayer.height,
        weight: cleanPlayer.weight,
        injured: apiData.response[0].player.injured,
        photo: cleanPlayer.photo,
        statistics: apiData.response[0].statistics || []
      },
      { upsert: true, new: true }
    );
    console.log(`💾 Saved complete player ${playerId} to MongoDB`);
    
    // Cache transformed data (1 hour)
    const cleanApiFormat = { response: cleanPlayer };
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(cleanApiFormat));
    await redisClient.disconnect();

    return res.json(req.query.raw === 'true' ? apiData : cleanApiFormat);

  } catch (error) {
    console.error('❌ Error fetching player:', error.message);
    if (redisClient && redisClient.isReady) {
      await redisClient.disconnect();
    }
    res.status(500).json({ 
      error: 'Failed to fetch player',
      details: error.message 
    });
  }
});

module.exports = router;
