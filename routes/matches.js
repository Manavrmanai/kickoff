// routes/matches.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const Match = require("../models/match");

router.get("/save-matches", async (req, res) => {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/competitions/2021/matches",
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );

    const matches = response.data.matches;

    // save each match into DB
    for (const match of matches) {
      await Match.updateOne(
        { matchId: match.id },
        {
          matchId: match.id,
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          score: match.score,
          date: match.utcDate,
          competition: match.competition.name,
        },
        { upsert: true } // if match exists, update, else insert
      );
    }

    res.json({ message: "Matches saved to DB!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/matches", async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
