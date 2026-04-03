const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const { verifyToken } = require('../middleware/auth');
const supabase = require('../config/supabase');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Middleware to ensure user exists in our DB based on Supabase token
const ensureUserExists = async (req, res, next) => {
    try {
        if (!supabase) {
            req.dbUser = { id: "mock_id", email: req.user.email, isPremium: false, generationCount: 0 };
            return next();
        }

        let { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', req.user.email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Error fetching user from Supabase:', fetchError);
            return res.status(500).json({ error: 'Internal server error while syncing user' });
        }

        if (!user) {
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([{
                    email: req.user.email,
                    name: req.user.name || 'User',
                    googleId: req.user.id
                }])
                .select()
                .single();
            if (insertError) throw insertError;
            user = newUser;
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
        
        // Simple free tier limit check
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

        let response;
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });
        } else {
            response = {
                choices: [{
                    message: {
                        content: JSON.stringify({
                            summary: "A highly motivated and results-driven professional with experience in leading cross-functional teams and implementing scalable architectures.",
                            improvedExperience: experience.map(exp => ({ ...exp, description: "- Optimized data pipelines using modern cloud infrastructure.\n- Enhanced user retention by collaborating tightly with product designers.\n- Spearheaded key company initiatives resulting in higher metric improvements." }))
                        })
                    }
                }]
            };
        }

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
        if (supabase) {
            await supabase
                .from('users')
                .update({ generationCount: req.dbUser.generationCount + 1 })
                .eq('id', req.dbUser.id);
        }

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

        let response;
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'dummy_key') {
            response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
            });
        } else {
            response = {
                choices: [{ message: { content: "This is an improved, highly professional version of your text optimized for ATS screening algorithms." } }]
            };
        }

        res.json({ improvedText: response.choices[0].message.content.trim() });
    } catch (error) {
        console.error("AI Improvement Error:", error);
        res.status(500).json({ error: 'Failed to improve text.' });
    }
});

// Save or Update Resume
router.post('/save', verifyToken, ensureUserExists, async (req, res) => {
    try {
        if (!supabase) {
            const resumeData = req.body;
            resumeData.id = resumeData.id || "mock_uuid_" + Date.now();
            return res.json(resumeData);
        }

        const { id, _id, ...resumeData } = req.body; // Remove any mongo _id
        
        // MongoDB used _id, Supabase uses id
        const targetId = id || _id;
        let resume;

        if (targetId) {
            // Update existing
            const { data, error } = await supabase
                .from('resumes')
                .update({ ...resumeData })
                .eq('id', targetId)
                .eq('userId', req.dbUser.id)
                .select()
                .single();

            if (error) {
                console.error("Supabase Update Error:", error);
                return res.status(500).json({ error: 'Resume not found or update failed' });
            }
            resume = data;
        } else {
            // Create new
            const { data, error } = await supabase
                .from('resumes')
                .insert([{ ...resumeData, userId: req.dbUser.id }])
                .select()
                .single();

            if (error) {
                console.error("Supabase Insert Error:", error);
                return res.status(500).json({ error: 'Failed to save new resume' });
            }
            resume = data;
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
        if (!supabase) {
             return res.json({ resumes: [], isPremium: false, generationCount: 0 });
        }

        const { data: resumes, error } = await supabase
            .from('resumes')
            .select('*')
            .eq('userId', req.dbUser.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error("Fetch Resumes Error Supabase:", error);
            return res.status(500).json({ error: 'Failed to fetch resumes' });
        }

        // Map 'id' to '_id' for backward compatibility with frontend if needed
        const formattedResumes = resumes.map(r => ({ ...r, _id: r.id }));

        res.json({ resumes: formattedResumes || [], isPremium: req.dbUser.isPremium, generationCount: req.dbUser.generationCount });
    } catch (error) {
         console.error("Fetch Resumes Error:", error);
         res.status(500).json({ error: 'Failed to fetch resumes' });
    }
});

module.exports = router;
