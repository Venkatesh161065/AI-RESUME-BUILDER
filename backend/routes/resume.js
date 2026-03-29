const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { verifyToken } = require('../middleware/auth');
const Resume = require('../models/Resume');
const User = require('../models/User');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Middleware to ensure user exists in our DB based on Firebase token
const ensureUserExists = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            req.dbUser = { _id: "mock_id", email: req.user.email, isPremium: false, generationCount: 0 };
            return next();
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
        req.dbUser = user;
        next();
    } catch (error) {
        console.error('Error ensuring DB user:', error);
        res.status(500).json({ error: 'Internal server error while syncing user' });
    }
};

// Generate Resume Content
router.post('/generate', verifyToken, ensureUserExists, async (req, res) => {
    try {
        const { personalInfo, education, experience, skills, targetRole } = req.body;
        
        // Simple free tier limit check (just an example, customize as needed)
        if (!req.dbUser.isPremium && req.dbUser.generationCount >= 1) {
            return res.status(403).json({ error: 'Free tier limit reached. Please upgrade to Premium.' });
        }

        const prompt = `
        Act as an expert ATS-friendly Resume Writer.
        You are given the following details of a candidate:
        Role: ${targetRole || 'General Professional'}
        Experience: ${JSON.stringify(experience)}
        Education: ${JSON.stringify(education)}
        Skills: ${skills.join(', ')}

        Generate an outstanding professional summary and improve the experience descriptions with strong action verbs and quantified achievements.
        Format your response as a JSON object with two keys:
        - "summary": a 3-4 sentence professional summary highlighting their strengths for the role.
        - "improvedExperience": an array of objects matching the input experience, but with the "description" field rewritten to be professional, ATS-friendly, and using bullet points (formatted as a single string with \n dashes).
        
        ONLY output valid JSON without markdown wrapping like \`\`\`json.
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        // Try parsing JSON carefully
        let generatedContent;
        try {
            const contentString = response.choices[0].message.content.trim().replace(/^```json/, '').replace(/```$/, '');
            generatedContent = JSON.parse(contentString);
        } catch (parseError) {
             console.error('OpenAI JSON parse error', parseError);
             return res.status(500).json({ error: 'Failed to process AI response properly' });
        }

        // Increment generation count securely
        req.dbUser.generationCount += 1;
        await req.dbUser.save();

        res.json(generatedContent);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: 'Failed to generate resume content.' });
    }
});

// Improve Specific Text
router.post('/improve', verifyToken, async (req, res) => {
    try {
        const { text, context } = req.body;
        
        const prompt = `Rewrite the following text to be more professional, ATS-friendly, and perfect for a resume. Context: ${context}. Text to improve: "${text}". ONLY output the standard string, no extra conversational text.`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
        });

        res.json({ improvedText: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error("AI Improvement Error:", error);
        res.status(500).json({ error: 'Failed to improve text.' });
    }
});

// Save or Update Resume
router.post('/save', verifyToken, ensureUserExists, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            const resumeData = req.body;
            resumeData._id = resumeData._id || "mock_resume_" + Date.now();
            return res.json(resumeData);
        }

        const { _id, ...resumeData } = req.body;
        
        let resume;
        if (_id) {
            // Update existing
            resume = await Resume.findOneAndUpdate(
                { _id, userId: req.dbUser._id },
                resumeData,
                { new: true }
            );
            if (!resume) return res.status(404).json({ error: 'Resume not found' });
        } else {
            // Create new
            resume = new Resume({
                userId: req.dbUser._id,
                ...resumeData
            });
            await resume.save();
        }

        res.json(resume);
    } catch (error) {
        console.error("Save Resume Error:", error);
        res.status(500).json({ error: 'Failed to save resume' });
    }
});

// Get all Resumes for current user
router.get('/all', verifyToken, ensureUserExists, async (req, res) => {
    try {
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
             return res.json({ resumes: [], isPremium: false, generationCount: 0 });
        }

        const resumes = await Resume.find({ userId: req.dbUser._id }).sort({ updatedAt: -1 });
        
        res.json({ resumes, isPremium: req.dbUser.isPremium, generationCount: req.dbUser.generationCount });
    } catch (error) {
         console.error("Fetch Resumes Error:", error);
         res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

module.exports = router;
