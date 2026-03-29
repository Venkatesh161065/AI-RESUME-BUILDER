const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

router.post('/login', verifyToken, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
             console.log("Mocking DB login because MongoURI is missing.");
             return res.json({ message: 'Login successful (Mock)', user: { email: req.user.email, name: req.user.name, isPremium: false, generationCount: 0 } });
        }

        let user = await User.findOne({ email: req.user.email });
        if (!user) {
            user = new User({
                email: req.user.email,
                name: req.user.name || 'User',
                googleId: req.user.uid
            });
            await user.save();
        }
        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Auth sync error:', error);
        res.status(500).json({ error: 'Failed to sync user data' });
    }
});

module.exports = router;
