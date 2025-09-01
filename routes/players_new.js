// routes/players.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Player = require('../models/player');
const { transformPlayers, transformPlayer } = require('../utils/dataTransformers');

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

    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log('✅ Player data from Redis Cache');
      await redisClient.disconnect();
      const data = JSON.parse(cachedData);
      
      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json(data);
      } else {
        return res.json({ response: transformPlayer(data.response?.[0]) });
      }
    }

    // Fetch from API
    console.log(`🌐 Fetching player ${playerId} from API`);
    const apiData = await footballApi.getPlayer(playerId, season);
    
    if (!apiData.response || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'Player not found' });
    }

    const item = apiData.response[0];
    const playerData = {
      apiId: item.player.id,
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

    // Save to MongoDB
    await Player.findOneAndUpdate(
      { apiId: item.player.id },
      playerData,
      { upsert: true, new: true }
    );

    const result = {
      id: item.player.id,
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
      statistics: item.statistics
    };

    // Cache for 6 hours
    await redisClient.setEx(cacheKey, 21600, JSON.stringify(apiData));
    await redisClient.disconnect();
    
    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(apiData);
    } else {
      return res.json({ response: transformPlayer(apiData.response[0]) });
    }
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

module.exports = router;
