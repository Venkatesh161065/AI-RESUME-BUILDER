import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ResumeForm from '../components/ResumeForm';
import ResumePreview from '../components/ResumePreview';
import useStore from '../store/useStore';
import axios from 'axios';

const Builder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, isPremium } = useStore();
    
    // Initial State structure
    const [resumeData, setResumeData] = useState({
        title: 'New Resume',
        targetRole: '',
        personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' },
        summary: '',
        education: [{ degree: '', institution: '', startDate: '', endDate: '', description: '' }],
        experience: [{ title: '', company: '', startDate: '', endDate: '', description: '' }],
        skills: [''],
        template: 'modern'
    });

    const [loading, setLoading] = useState(id ? true : false);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }

        if (id) {
            // We would ideally fetch by ID here. In this simple flow, we might extract it from the local Zustand store
            // For robustness, let's fetch it if possible. But since our /api/resume/all returns all resumes,
            // we'll rely on global store, or fetch it. Let's just fetch all and find it.
            const fetchResume = async () => {
                try {
                    const res = await axios.get('http://localhost:5000/api/resume/all', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const found = res.data.resumes.find(r => r._id === id);
                    if (found) {
                        setResumeData(found);
                    } else {
                        navigate('/dashboard');
                    }
                } catch (error) {
                    console.error('Error fetching resume', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchResume();
        }
    }, [id, token, navigate]);

    if (loading) return <div className="text-white flex justify-center items-center h-screen">Loading...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-background text-white">
            {/* Left side: Editor */}
            <div className="w-1/2 overflow-y-auto border-r border-gray-700 p-6 custom-scrollbar bg-card">
                <ResumeForm 
                    resumeData={resumeData} 
                    setResumeData={setResumeData} 
                    isPremium={isPremium}
                    token={token} 
                />
            </div>
            
            {/* Right side: Preview */}
            <div className="w-1/2 overflow-y-auto p-8 bg-gray-900 flex justify-center view-scrollbar">
                <ResumePreview resumeData={resumeData} />
            </div>
        </div>
    );
};

export default Builder;
