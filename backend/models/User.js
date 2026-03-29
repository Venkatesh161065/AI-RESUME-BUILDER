const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    googleId: {
        type: String,
        required: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    generationCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
