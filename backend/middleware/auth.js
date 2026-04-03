const supabase = require('../config/supabase');

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split('Bearer ')[1];
        
        // Mock Token Bypass for Local Testing
        if (token === 'mock_token_123') {
            req.user = { 
                email: "test@example.com", 
                name: "Test User", 
                id: "mock_uuid_123" 
            };
            return next();
        }

        // Verify Supabase Token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('Supabase Auth Token Error:', error);
            return res.status(401).json({ error: 'Unauthorized route, invalid token' });
        }

        // Attach user info to request
        // Supabase user object has id, email, user_metadata, etc.
        req.user = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User'
        };
        
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Unauthorized route, invalid token' });
    }
};

module.exports = { verifyToken };
