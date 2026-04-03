import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';

const ResumeForm = ({ resumeData, setResumeData, isPremium, token }) => {
    const [loadingAi, setLoadingAi] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e, section, index, field) => {
        if (section) {
            const newData = { ...resumeData };
            newData[section][index][field] = e.target.value;
            setResumeData(newData);
        } else {
            setResumeData({ ...resumeData, [e.target.name]: e.target.value });
        }
    };

    const handlePersonalInfo = (e) => {
        setResumeData({
            ...resumeData,
            personalInfo: { ...resumeData.personalInfo, [e.target.name]: e.target.value }
        });
    };

    const addListItem = (section, defaultObj) => {
        setResumeData({ ...resumeData, [section]: [...resumeData[section], defaultObj] });
    };

    const handleGenerateAI = async () => {
        setLoadingAi(true);
        try {
            const res = await axios.post('https://backend-pi-six-94.vercel.app/api/resume/generate', resumeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const { summary, improvedExperience } = res.data;
            setResumeData(prev => ({
                ...prev,
                summary: summary || prev.summary,
                experience: improvedExperience || prev.experience
            }));
            alert('AI Generation Complete!');
        } catch (error) {
            if (error.response?.status === 403) {
                alert('Free tier limit reached! Please upgrade to Premium.');
            } else {
                alert('Failed to generate AI content.');
            }
        } finally {
            setLoadingAi(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.post('https://backend-pi-six-94.vercel.app/api/resume/save', resumeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumeData(res.data); // updates with _id
            alert('Resume saved successfully!');
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const downloadPDF = () => {
        const input = document.getElementById('resume-preview-content');
        if (!input) return;
        
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${resumeData.title || 'resume'}.pdf`);
        });
    };

    const handlePremiumUpgrade = async () => {
        if (isPremium) return alert("You are already Premium!");
        // We will navigate to a checkout modal or route
        navigate('/premium');
    };

    return (
        <div className="space-y-8 pb-32">
            <div className="sticky top-0 bg-card z-10 py-4 border-b border-gray-700 flex justify-between items-center">
                <input 
                    type="text" 
                    name="title" 
                    value={resumeData.title} 
                    onChange={e => handleChange(e)}
                    className="bg-transparent text-xl font-bold text-white outline-none border-b border-gray-600 focus:border-primary px-2"
                />
                <div className="flex gap-3">
                    <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white font-medium">
                        {saving ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button onClick={downloadPDF} className="px-4 py-2 bg-secondary hover:bg-green-600 rounded text-sm text-white font-medium shadow-lg shadow-green-500/30">
                        Download PDF
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 p-5 rounded-xl border border-primary/30 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-primary mb-1">AI Magic Auto-Writer</h3>
                    <p className="text-sm text-gray-400">Let AI write your professional summary and improve bullet points.</p>
                </div>
                <button 
                    onClick={handleGenerateAI} 
                    disabled={loadingAi}
                    className="bg-primary hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-indigo-500/50 transition-all flex items-center gap-2"
                >
                    {loadingAi ? 'Generating...' : '✨ Generate with AI'}
                </button>
            </div>

            {!isPremium && (
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 p-4 rounded-xl flex justify-between items-center text-black">
                    <span className="font-semibold">Unlock Premium Templates & Unlimited AI</span>
                    <button onClick={handlePremiumUpgrade} className="bg-black text-white px-4 py-2 rounded font-bold text-sm hover:bg-gray-900 transition-colors">Upgrade Now</button>
                </div>
            )}

            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Personal Info</h2>
                <div className="grid grid-cols-2 gap-4">
                    {['name', 'email', 'phone', 'linkedin', 'github', 'portfolio'].map(field => (
                        <div key={field}>
                            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-1">{field}</label>
                            <input 
                                type="text" 
                                name={field} 
                                value={resumeData.personalInfo[field] || ''} 
                                onChange={handlePersonalInfo}
                                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Target Role</h2>
                <input 
                    type="text" 
                    name="targetRole" 
                    value={resumeData.targetRole || ''} 
                    onChange={e => handleChange(e)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none"
                />
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Professional Summary</h2>
                <textarea 
                    name="summary" 
                    value={resumeData.summary || ''} 
                    onChange={e => handleChange(e)}
                    rows="4"
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none resize-y"
                    placeholder="Brief overview of your experience..."
                />
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">Experience</h2>
                    <button 
                        onClick={() => addListItem('experience', { title: '', company: '', startDate: '', endDate: '', description: '' })}
                        className="text-primary text-sm hover:underline font-medium"
                    >+ Add Role</button>
                </div>
                <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                        <div key={index} className="bg-gray-900 p-4 rounded border border-gray-700 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Job Title" value={exp.title} onChange={e => handleChange(e, 'experience', index, 'title')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="Company" value={exp.company} onChange={e => handleChange(e, 'experience', index, 'company')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="Start Date" value={exp.startDate} onChange={e => handleChange(e, 'experience', index, 'startDate')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="End Date" value={exp.endDate} onChange={e => handleChange(e, 'experience', index, 'endDate')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                            </div>
                            <textarea 
                                placeholder="Description (Use bullet points)" 
                                value={exp.description} 
                                onChange={e => handleChange(e, 'experience', index, 'description')} 
                                rows="3"
                                className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-200">Education</h2>
                    <button 
                        onClick={() => addListItem('education', { degree: '', institution: '', startDate: '', endDate: '', description: '' })}
                        className="text-primary text-sm hover:underline font-medium"
                    >+ Add Education</button>
                </div>
                <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                        <div key={index} className="bg-gray-900 p-4 rounded border border-gray-700 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="Degree / Certification" value={edu.degree} onChange={e => handleChange(e, 'education', index, 'degree')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="Institution" value={edu.institution} onChange={e => handleChange(e, 'education', index, 'institution')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="Start Year" value={edu.startDate} onChange={e => handleChange(e, 'education', index, 'startDate')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                                <input type="text" placeholder="End Year" value={edu.endDate} onChange={e => handleChange(e, 'education', index, 'endDate')} className="bg-gray-800 border border-gray-600 rounded p-2 text-white w-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold mb-4 text-gray-200">Skills</h2>
                <input 
                    type="text" 
                    value={resumeData.skills.join(', ')} 
                    onChange={e => setResumeData({...resumeData, skills: e.target.value.split(',').map(s => s.trim())})} 
                    placeholder="React, Node.js, Python..."
                    className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-primary outline-none"
                />
            </section>
        </div>
    );
};

export default ResumeForm;
