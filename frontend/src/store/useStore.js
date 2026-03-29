import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    isPremium: false,
    generationCount: 0,
    resumes: [],
    
    // Auth
    setUser: (user) => set({ user }),
    setPremiumStatus: (status) => set({ isPremium: status }),
    setGenerationCount: (count) => set({ generationCount: count }),
    
    // Resumes
    setResumes: (resumes) => set({ resumes }),
    addResume: (resume) => set((state) => ({ resumes: [resume, ...state.resumes] })),
    updateResume: (updatedResume) => set((state) => ({
        resumes: state.resumes.map(r => r._id === updatedResume._id ? updatedResume : r)
    })),
    
    // API Tokens
    token: null,
    setToken: (token) => set({ token })
}));

export default useStore;
