const admin = require('../config/firebase');

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
                uid: "mock_uid_123" 
            };
            return next();
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Attach user info to request
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(401).json({ error: 'Unauthorized route, invalid token' });
    }
};

module.exports = { verifyToken };
