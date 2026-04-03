require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: true, // Echo origin to allow credentials from any frontend
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/resume', require('./routes/resume'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/auth', require('./routes/auth'));

// Basic Route for testing
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the AI Resume Builder Backend (Powered by Supabase)' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
