// routes/standings.js
const express = require('express');
const router = express.Router();
const { createClient } = require('redis');
const footballApi = require('../utils/footballApi');
const Standing = require('../models/standing');
const { transformStandings } = require('../utils/dataTransformers');

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
      const data = JSON.parse(cachedData);
      
      const raw = req.query.raw === 'true';
      if (raw) {
        return res.json(data);
      } else {
        return res.json({ response: transformStandings(data.response) });
      }
    }

    // Fetch from API and return the raw API response (same as terminal output)
    console.log(`🌐 Fetching standings for league ${leagueId} from API`);
    const apiData = await footballApi.getStandings(leagueId, season);

    if (!apiData || !Array.isArray(apiData.response) || apiData.response.length === 0) {
      await redisClient.disconnect();
      return res.status(404).json({ error: 'No standings found for this league' });
    }

    // Cache the full API response for 30 minutes and return it unchanged
    try {
      await redisClient.setEx(cacheKey, 1800, JSON.stringify(apiData));
    } catch (cacheErr) {
      console.error('Warning: failed to set standings cache', cacheErr && cacheErr.message);
    }
    await redisClient.disconnect();
    
    const raw = req.query.raw === 'true';
    if (raw) {
      return res.json(apiData);
    } else {
      return res.json({ response: transformStandings(apiData.response) });
    }
  } catch (error) {
    console.error(`Error fetching standings for league ${leagueId}:`, error.message);
    if (redisClient) await redisClient.disconnect();
    res.status(500).json({ error: 'Failed to fetch standings' });
  }
});

module.exports = router;
