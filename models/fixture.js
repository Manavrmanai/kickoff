const mongoose = require('mongoose');

const fixtureSchema = new mongoose.Schema({
  // Store the complete API response with flexible schema
  fixture: {
    id: Number,
    referee: String,
    timezone: String,
    date: String,
    timestamp: Number,
    periods: {
      first: Number,
      second: Number
    },
    venue: {
      id: Number,
      name: String,
      city: String
    },
    status: {
      long: String,
      short: String,
      elapsed: Number
    }
  },
  league: {
    id: Number,
    name: String,
    country: String,
    logo: String,
    flag: String,
    season: Number,
    round: String
  },
  teams: {
    home: {
      id: Number,
      name: String,
      logo: String,
      winner: mongoose.Schema.Types.Mixed
    },
    away: {
      id: Number,
      name: String,
      logo: String,
      winner: mongoose.Schema.Types.Mixed
    }
  },
  goals: {
    home: Number,
    away: Number
  },
  score: {
    halftime: {
      home: Number,
      away: Number
    },
    fulltime: {
      home: Number,
      away: Number
    },
    extratime: {
      home: mongoose.Schema.Types.Mixed,
      away: mongoose.Schema.Types.Mixed
    },
    penalty: {
      home: mongoose.Schema.Types.Mixed,
      away: mongoose.Schema.Types.Mixed
    }
  },
  // Store any additional data from API
  apiData: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  strict: false // Allow flexible schema for API response variations
});

// Create indexes for common queries
fixtureSchema.index({ 'fixture.id': 1 }, { unique: true });
fixtureSchema.index({ 'league.id': 1, 'league.season': 1 });
fixtureSchema.index({ 'teams.home.id': 1 });
fixtureSchema.index({ 'teams.away.id': 1 });
fixtureSchema.index({ 'fixture.date': 1 });

module.exports = mongoose.model('Fixture', fixtureSchema);
