const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'My Resume'
    },
    personalInfo: {
        name: String,
        email: String,
        phone: String,
        linkedin: String,
        github: String,
        portfolio: String
    },
    summary: String,
    education: [{
        degree: String,
        institution: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    experience: [{
        title: String,
        company: String,
        startDate: String,
        endDate: String,
        description: String
    }],
    skills: [String],
    targetRole: String,
    template: {
        type: String,
        default: 'modern'
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
