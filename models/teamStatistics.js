const mongoose = require('mongoose');

const teamStatisticsSchema = new mongoose.Schema({
  // Keep basic required fields
  team: {
    id: { type: Number, required: true },
    name: String,
    logo: String
  },
  league: {
    id: { type: Number, required: true },
    name: String,
    country: String,
    logo: String,
    flag: String,
    season: Number
  },
  // Use Mixed type for all other fields to allow any structure
  form: mongoose.Schema.Types.Mixed,
  fixtures: mongoose.Schema.Types.Mixed,
  goals: mongoose.Schema.Types.Mixed,
  biggest: mongoose.Schema.Types.Mixed,
  clean_sheet: mongoose.Schema.Types.Mixed,
  failed_to_score: mongoose.Schema.Types.Mixed,
  penalty: mongoose.Schema.Types.Mixed,
  lineups: mongoose.Schema.Types.Mixed,
  cards: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  strict: false // Allow additional fields not defined in schema
});

// Compound index for team + league + season
teamStatisticsSchema.index({ 'team.id': 1, 'league.id': 1, 'league.season': 1 }, { unique: true });

module.exports = mongoose.model('TeamStatistics', teamStatisticsSchema);
