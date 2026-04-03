import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import useStore from '../store/useStore';
import axios from 'axios';

const Landing = () => {
    const navigate = useNavigate();
    const { setUser, setToken, setPremiumStatus, setGenerationCount } = useStore();

    useEffect(() => {
        if (!supabase) return;
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                try {
                    const token = session.access_token;
                    setToken(token);
                    
                    // Sync with backend
                    const res = await axios.post('https://backend-pi-six-94.vercel.app/api/auth/login', {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    setUser(res.data.user);
                    setPremiumStatus(res.data.user.isPremium);
                    setGenerationCount(res.data.user.generationCount);
                    
                    navigate('/dashboard');
                } catch (error) {
                    console.error('Failed to sync with backend after Supabase login', error);
                }
            }
        });

        return () => {
            if (subscription) subscription.unsubscribe();
        };
    }, [navigate, setToken, setUser, setPremiumStatus, setGenerationCount]);

    const handleLogin = async () => {
        if (!supabase) {
            console.warn('Supabase not configured, mocking login');
            // Mock login fallback
            const mockToken = "mock_token_123";
            setToken(mockToken);
            try {
                const res = await axios.post('https://backend-pi-six-94.vercel.app/api/auth/login', {}, {
                    headers: { Authorization: `Bearer ${mockToken}` }
                });
                
                setUser(res.data.user);
                setPremiumStatus(res.data.user.isPremium);
                setGenerationCount(res.data.user.generationCount);
                
                navigate('/dashboard');
            } catch (err) {
                alert('Backend is unreachable. Is the Node server running?');
            }
            return;
        }

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            console.error('Supabase login failed:', error);
            alert('Login failed. Ensure Supabase is correctly configured in .env');
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
