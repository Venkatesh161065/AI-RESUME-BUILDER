const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You must set these environment variables using your Firebase service account key
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
        })
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
}

module.exports = admin;
