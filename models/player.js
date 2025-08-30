const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    apiId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    firstname: String,
    lastname: String,
    age: Number,
    birth: {
        date: Date,
        place: String,
        country: String
    },
    nationality: String,
    height: String,
    weight: String,
    injured: Boolean,
    photo: String,
    team: {
        id: Number,
        name: String,
        logo: String
    },
    statistics: [{
        team: {
            id: Number,
            name: String,
            logo: String
        },
        league: {
            id: Number,
            name: String,
            country: String,
            logo: String,
            season: Number
        },
        games: {
            appearences: Number,
            lineups: Number,
            minutes: Number,
            number: Number,
            position: String,
            rating: String,
            captain: Boolean
        },
        substitutes: {
            in: Number,
            out: Number,
            bench: Number
        },
        shots: {
            total: Number,
            on: Number
        },
        goals: {
            total: Number,
            conceded: Number,
            assists: Number,
            saves: Number
        },
        passes: {
            total: Number,
            key: Number,
            accuracy: Number
        },
        tackles: {
            total: Number,
            blocks: Number,
            interceptions: Number
        },
        duels: {
            total: Number,
            won: Number
        },
        dribbles: {
            attempts: Number,
            success: Number,
            past: Number
        },
        fouls: {
            drawn: Number,
            committed: Number
        },
        cards: {
            yellow: Number,
            yellowred: Number,
            red: Number
        },
        penalty: {
            won: Number,
            commited: Number,
            scored: Number,
            missed: Number,
            saved: Number
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Player', playerSchema);
