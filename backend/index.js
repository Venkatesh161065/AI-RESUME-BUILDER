require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: '*', // Automatically allow frontend origins on deploy
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/resume', require('./routes/resume'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/auth', require('./routes/auth'));

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the AI Resume Builder Backend' });
});

// Database connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Connected to MongoDB Atlas');
    }).catch(err => {
        console.error('MongoDB connection error:', err);
    });
} else {
    console.warn('WARNING: MONGO_URI is missing. Please set it in .env');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
