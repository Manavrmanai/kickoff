const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    apiId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    code: String,
    country: String,
    founded: Number,
    national: Boolean,
    logo: String,
    venue: {
        id: Number,
        name: String,
        address: String,
        city: String,
        capacity: Number,
        surface: String,
        image: String
    },
    league: {
        id: Number,
        name: String,
        country: String,
        logo: String,
        season: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('Team', teamSchema);