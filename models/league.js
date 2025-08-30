const mongoose = require('mongoose');

const leagueSchema = new mongoose.Schema({
    apiId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    type: String,
    logo: String,
    country: {
        name: String,
        code: String,
        flag: String
    },
    seasons: [{
        year: Number,
        start: Date,
        end: Date,
        current: Boolean
    }]
}, { timestamps: true });

module.exports = mongoose.model('League', leagueSchema);
