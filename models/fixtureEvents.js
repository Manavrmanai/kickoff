const mongoose = require('mongoose');

const fixtureEventsSchema = new mongoose.Schema({
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
fixtureEventsSchema.index({ fixture_id: 1 });

module.exports = mongoose.model('FixtureEvents', fixtureEventsSchema);
