import React from 'react';

const ResumePreview = ({ resumeData }) => {
    
    // We can conditionally render different templates here based on resumeData.template
    // For now, let's build a solid, ATS-friendly modern template
    
    const { personalInfo, summary, experience, education, skills, targetRole } = resumeData;

    return (
        <div 
            id="resume-preview-content" 
            className="bg-white text-black w-[794px] h-[1123px] shadow-2xl overflow-hidden shrink-0 flex flex-col p-[40px] font-sans box-border"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* Header */}
            <header className="text-center border-b-2 border-gray-300 pb-4 mb-4">
                <h1 className="text-4xl font-bold uppercase tracking-wider text-gray-800 mb-1">
                    {personalInfo?.name || 'Your Name'}
                </h1>
                <h2 className="text-xl text-primary font-medium mb-2">{targetRole || 'Your Title'}</h2>
                
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    {personalInfo?.email && <span>{personalInfo.email}</span>}
                    {personalInfo?.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo?.linkedin && <span>• {personalInfo.linkedin}</span>}
                    {personalInfo?.github && <span>• {personalInfo.github}</span>}
                    {personalInfo?.portfolio && <span>• {personalInfo.portfolio}</span>}
                </div>
            </header>

            {/* Summary */}
            {summary && (
                <section className="mb-5">
                    <h3 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-2">Professional Summary</h3>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">{summary}</p>
                </section>
            )}

            {/* Experience */}
            {experience && experience.length > 0 && experience[0].title !== '' && (
                <section className="mb-5">
                    <h3 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Experience</h3>
                    <div className="space-y-4">
                        {experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-base font-bold text-gray-800">{exp.title}</h4>
                                    <span className="text-sm font-medium text-gray-600">{exp.startDate} – {exp.endDate || 'Present'}</span>
                                </div>
                                <div className="text-sm font-semibold text-primary mb-2">{exp.company}</div>
                                {exp.description && (
                                    <ul className="list-disc list-outside ml-4 text-sm text-gray-700 space-y-1">
                                        {exp.description.split('\n').filter(item => item.trim() !== '').map((item, i) => (
                                            <li key={i}>{item.replace(/^- /, '')}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {skills && skills.length > 0 && skills[0] !== '' && (
                <section className="mb-5">
                    <h3 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-2">Skills & Technologies</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                        {skills.map((skill, index) => (
                            <span key={index} className="bg-gray-100 px-2 py-1 rounded font-medium border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {education && education.length > 0 && education[0].degree !== '' && (
                <section className="mb-5">
                    <h3 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 mb-3">Education</h3>
                    <div className="space-y-3">
                        {education.map((edu, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline">
                                    <h4 className="text-base font-bold text-gray-800">{edu.degree}</h4>
                                    <span className="text-sm font-medium text-gray-600">{edu.startDate} – {edu.endDate}</span>
                                </div>
                                <div className="text-sm text-gray-700">{edu.institution}</div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
        </div>
    );
};

export default ResumePreview;
