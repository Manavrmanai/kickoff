const mongoose = require('mongoose');

const fixtureStatisticsSchema = new mongoose.Schema({
  fixture_id: {
    type: Number,
    required: true,
    index: true
  },
  fixture: {
    type: mongoose.Schema.Types.Mixed
  },
  response: {
    type: mongoose.Schema.Types.Mixed
  },
  apiData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  strict: false
});

// Create compound index for faster queries
fixtureStatisticsSchema.index({ fixture_id: 1 });

module.exports = mongoose.model('FixtureStatistics', fixtureStatisticsSchema);
