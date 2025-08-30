// models/fixturePlayerStats.js
const mongoose = require('mongoose');

const fixturePlayerStatsSchema = new mongoose.Schema({
  fixture_id: {
    type: Number,
    required: true,
    index: true
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  apiData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  strict: false  // Allow flexible schema for API response variations
});

// Create index for efficient querying
fixturePlayerStatsSchema.index({ fixture_id: 1 });

module.exports = mongoose.model('FixturePlayerStats', fixturePlayerStatsSchema);
