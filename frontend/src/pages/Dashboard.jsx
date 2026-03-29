import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useStore from '../store/useStore';
import { auth, logout } from '../firebase';

const Dashboard = () => {
    const { user, token, setToken, resumes, setResumes, isPremium, setPremiumStatus } = useStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple auth check
        if (!token) {
            navigate('/');
            return;
        }
        
        const fetchResumes = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/resume/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setResumes(res.data.resumes);
                setPremiumStatus(res.data.isPremium);
            } catch (error) {
                console.error('Failed to fetch resumes', error);
                if (error.response?.status === 401) {
                    navigate('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResumes();
    }, [token, navigate, setResumes, setPremiumStatus]);

    const handleCreateNew = () => {
        navigate('/builder');
    };

    const handleLogout = async () => {
        await logout();
        setToken(null);
        navigate('/');
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
                    <div className="flex gap-4 items-center">
                        <div className="text-gray-300">
                            {user?.name} {isPremium && <span className="bg-yellow-500 text-xs text-black font-bold px-2 py-1 rounded ml-2">PREMIUM</span>}
                        </div>
                        <button onClick={handleLogout} className="text-red-400 hover:text-red-300">Logout</button>
                    </div>
                </header>

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-200">My Resumes</h2>
                    <button 
                        onClick={handleCreateNew}
                        className="bg-primary hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium shadow"
                    >
                        + Create New Resume
                    </button>
                </div>

                {resumes.length === 0 ? (
                    <div className="bg-card p-10 rounded-xl text-center border border-gray-700">
                        <p className="text-gray-400 mb-4">You haven't created any resumes yet.</p>
                        <button onClick={handleCreateNew} className="text-primary hover:underline">Start building now</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {resumes.map(resume => (
                            <div key={resume._id} className="bg-card border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition cursor-pointer" onClick={() => navigate(`/builder/${resume._id}`)}>
                                <h3 className="text-lg font-medium text-white mb-2">{resume.title || 'Untitled Resume'}</h3>
                                <p className="text-sm text-gray-400 mb-4">Target: {resume.targetRole || 'N/A'}</p>
                                <div className="text-xs text-gray-500">
                                    Updated: {new Date(resume.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
