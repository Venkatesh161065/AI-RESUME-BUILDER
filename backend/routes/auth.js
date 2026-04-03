const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.post('/login', verifyToken, async (req, res) => {
    try {
        if (!supabase) {
             console.log("Mocking DB login because Supabase is not configured yet.");
             return res.json({ message: 'Login successful (Mock)', user: { email: req.user.email, name: req.user.name, isPremium: false, generationCount: 0 } });
        }

        // Check if user exists in public.users table
        let { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', req.user.email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Error fetching user from Supabase:', fetchError);
            return res.status(500).json({ error: 'Failed to access database' });
        }

        if (!user) {
            // Insert user into public.users since it's their first login
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    email: req.user.email,
                    name: req.user.name || 'User',
                    googleId: req.user.id // We use the id from auth middleware
                }])
                .select()
                .single();

            if (insertError) {
                console.error('Error creating user in Supabase:', insertError);
                return res.status(500).json({ error: 'Failed to sync user data' });
            }
            user = newUser;
        }

        res.json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Auth sync error:', error);
        res.status(500).json({ error: 'Failed to sync user data' });
    }
});

module.exports = router;
