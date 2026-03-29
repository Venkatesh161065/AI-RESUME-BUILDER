import React from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle } from '../firebase';
import useStore from '../store/useStore';
import axios from 'axios';

const Landing = () => {
    const navigate = useNavigate();
    const { setUser, setToken, setPremiumStatus, setGenerationCount } = useStore();

    const handleLogin = async () => {
        try {
            const fbUser = await loginWithGoogle();
            const token = await fbUser.getIdToken();
            setToken(token);
            
            // Sync with backend
            const res = await axios.post('http://localhost:5000/api/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setUser(res.data.user);
            setPremiumStatus(res.data.user.isPremium);
            setGenerationCount(res.data.user.generationCount);
            
            navigate('/dashboard');
        } catch (error) {
            console.warn('Firebase login failed, using Mock User for local testing:', error);
            const mockToken = "mock_token_123";
            setToken(mockToken);
            
            // Sync with backend using mock token
            try {
                const res = await axios.post('http://localhost:5000/api/auth/login', {}, {
                    headers: { Authorization: `Bearer ${mockToken}` }
                });
                
                setUser(res.data.user);
                setPremiumStatus(res.data.user.isPremium);
                setGenerationCount(res.data.user.generationCount);
                
                navigate('/dashboard');
            } catch (err) {
                alert('Backend is unreachable. Is the Node server running?');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background text-white p-6">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-4">
                AI Resume Builder
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg text-center">
                Craft ATS-friendly, professional resumes in seconds with the power of AI. Choose from modern templates and unlock unlimited generation with Premium.
            </p>
            <button 
                onClick={handleLogin}
                className="px-8 py-3 rounded-full bg-white text-gray-900 font-bold hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-3">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                Continue with Google
            </button>
        </div>
    );
};

export default Landing;
