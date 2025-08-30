const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema({
    league: {
        id: { type: Number, required: true },
        name: String,
        country: String,
        logo: String,
        season: Number
    },
    team: {
        id: { type: Number, required: true },
        name: String,
        logo: String
    },
    rank: Number,
    points: Number,
    goalsDiff: Number,
    group: String,
    form: String,
    status: String,
    description: String,
    all: {
        played: Number,
        win: Number,
        draw: Number,
        lose: Number,
        goals: {
            for: Number,
            against: Number
        }
    },
    home: {
        played: Number,
        win: Number,
        draw: Number,
        lose: Number,
        goals: {
            for: Number,
            against: Number
        }
    },
    away: {
        played: Number,
        win: Number,
        draw: Number,
        lose: Number,
        goals: {
            for: Number,
            against: Number
        }
    },
    update: Date
}, { timestamps: true });

// Compound index for league and team
standingSchema.index({ 'league.id': 1, 'team.id': 1 }, { unique: true });

module.exports = mongoose.model('Standing', standingSchema);
