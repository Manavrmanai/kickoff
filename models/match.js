const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  matchId: { type: Number, unique: true },
  homeTeam: String,
  awayTeam: String,
  score: Object,
  date: Date,
  competition: String
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
