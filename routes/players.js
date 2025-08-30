// routes/players.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Player = require('../models/player');

// GET /api/players/search?name=ronaldo&season=2023 → search players by name
router.get('/search', async (req, res) => {
  const playerName = req.query.name;
  const season = req.query.season || new Date().getFullYear();
  
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
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB for players matching search
    console.log('🔍 Checking MongoDB for player search...');
    const dbPlayers = await Player.find({ 
      'player.name': { $regex: playerName, $options: 'i' } 
    });
    
    if (dbPlayers && dbPlayers.length > 0) {
      console.log(`✅ Found ${dbPlayers.length} players in MongoDB`);
      
      // Convert MongoDB data to API format
      const dbData = {
        response: dbPlayers.map(p => ({
          player: p.player,
          statistics: p.statistics || []
        }))
      };
      
      // Refresh cache with DB data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(dbData));
      await redisClient.disconnect();
      return res.json(dbData);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Searching for player "${playerName}" from API`);
    const apiData = await footballApi.searchPlayers(playerName, season);

    // Cache the result (1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(apiData));
    
    // Save to MongoDB (individual players)
    if (apiData && apiData.response && apiData.response.length > 0) {
      for (const playerData of apiData.response) {
        await Player.findOneAndUpdate(
          { 'player.id': playerData.player.id },
          playerData,
          { upsert: true, new: true }
        );
      }
      console.log(`💾 Saved ${apiData.response.length} players to MongoDB`);
    }

    await redisClient.disconnect();
    res.json(apiData);

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
  const season = req.query.season || new Date().getFullYear();
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
      return res.json(JSON.parse(cachedData));
    }

    // 2. Check MongoDB if cache miss
    console.log('🔍 Checking MongoDB for player data...');
    const dbPlayer = await Player.findOne({ 'player.id': parseInt(playerId) });
    if (dbPlayer) {
      console.log('✅ Player data found in MongoDB');
      
      // Convert MongoDB data to API format
      const dbData = {
        response: [dbPlayer]
      };
      
      // Refresh cache with DB data (1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(dbData));
      await redisClient.disconnect();
      return res.json(dbData);
    }

    // 3. Data not found - fetch from API
    console.log(`🌐 Fetching player ${playerId} from API`);
    const apiData = await footballApi.getPlayer(playerId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Player not found' });
    }

    // Save to MongoDB
    const apiPlayerData = apiData.response[0];
    await Player.findOneAndUpdate(
      { 'player.id': apiPlayerData.player.id },
      apiPlayerData,
      { upsert: true, new: true }
    );
    console.log(`💾 Saved player ${playerId} to MongoDB`);
    
    // Cache the result (1 hour)
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(apiData));
    await redisClient.disconnect();

    res.json(apiData);
    res.json(apiData);

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
