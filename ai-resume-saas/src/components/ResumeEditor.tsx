'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, Save, Loader2 } from 'lucide-react'
import ResumePreview from './ResumePreview'
import { useRouter } from 'next/navigation'
import type { Resume, ResumeData } from '@/types/resume'

export default function ResumeEditor({ initialResume }: { initialResume: Resume }) {
    const [resume, setResume] = useState<Resume>(initialResume)
    const [isSaving, setIsSaving] = useState(false)
    const [atsScore, setAtsScore] = useState<string | null>(null)
    const [isScoring, setIsScoring] = useState(false)
    const router = useRouter()

    const data = resume.data

    const handleUpdate = (section: keyof ResumeData, value: ResumeData[keyof ResumeData]) => {
        setResume((prev) => ({
            ...prev,
            data: { ...prev.data, [section]: value },
        }))
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const { error } = await supabase
                .from('resumes')
                .update({ title: resume.title, data: resume.data, updated_at: new Date().toISOString() })
                .eq('id', resume.id)
            if (error) throw error
            router.refresh()
        } catch (e) {
            console.error(e)
            alert('Failed to save')
        } finally {
            setIsSaving(false)
        }
    }

    const handleEnhance = async (text: string, onResult: (res: string) => void) => {
        try {
            const res = await fetch('/api/rewrite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, jobDescription: data.jobDescription }),
            })
            const json = await res.json()
            onResult(json.enhanced)
        } catch {
            alert('Failed to enhance text')
        }
    }

    const handleCheckATS = async () => {
        setIsScoring(true)
        try {
            const content = `
        ${resume.data.summary}
        ${resume.data.experienceText}
        ${resume.data.educationText}
        ${resume.data.skillsText}
      `
            const res = await fetch('/api/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content }),
            })
            const json = await res.json()
            setAtsScore(json.result)
        } catch {
            alert('Failed to check ATS score')
        } finally {
            setIsScoring(false)
        }
    }

    return (
        <div className="grid grid-cols-2 gap-10 h-full overflow-hidden">

            {/* Edit Panel */}
            <div className="flex flex-col overflow-y-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Edit Resume</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save
                        </button>
                        <button
                            onClick={handleCheckATS}
                            disabled={isScoring}
                            className="inline-flex items-center gap-2 border rounded-md px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                        >
                            {isScoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            ATS Score
                        </button>
                    </div>
                </div>

                {atsScore && (
                    <div className="p-4 border rounded-md bg-muted/30 text-sm">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">ATS Compatibility Report</h3>
                            <button onClick={() => setAtsScore(null)} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                        </div>
                        <pre className="whitespace-pre-wrap font-sans text-xs">{atsScore}</pre>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium">Job Description (Target Role)</label>
                    <textarea
                        className="border p-2 w-full rounded-md text-sm min-h-[80px]"
                        placeholder="Paste the job description here to help AI tailor your resume..."
                        value={data?.jobDescription || ''}
                        onChange={(e) => handleUpdate('jobDescription', e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Full Name</label>
                    <input
                        className="border p-2 w-full rounded-md text-sm"
                        placeholder="John Doe"
                        value={data?.personal?.fullName || ''}
                        onChange={(e) => handleUpdate('personal', { ...data?.personal, fullName: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            className="border p-2 w-full rounded-md text-sm"
                            placeholder="Email"
                            value={data?.personal?.email || ''}
                            onChange={(e) => handleUpdate('personal', { ...data?.personal, email: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Phone</label>
                        <input
                            className="border p-2 w-full rounded-md text-sm"
                            placeholder="Phone"
                            value={data?.personal?.phone || ''}
                            onChange={(e) => handleUpdate('personal', { ...data?.personal, phone: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Location</label>
                        <input
                            className="border p-2 w-full rounded-md text-sm"
                            placeholder="City, Country"
                            value={data?.personal?.location || ''}
                            onChange={(e) => handleUpdate('personal', { ...data?.personal, location: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Website / LinkedIn</label>
                        <input
                            className="border p-2 w-full rounded-md text-sm"
                            placeholder="linkedin.com/in/..."
                            value={data?.personal?.website || ''}
                            onChange={(e) => handleUpdate('personal', { ...data?.personal, website: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Summary</label>
                        <button
                            onClick={() => handleEnhance(data?.summary || '', (res) => handleUpdate('summary', res))}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                        >
                            <Sparkles className="h-3 w-3" /> Enhance with AI
                        </button>
                    </div>
                    <textarea
                        className="border p-2 w-full rounded-md text-sm min-h-[100px]"
                        placeholder="Edit summary"
                        value={data?.summary || ''}
                        onChange={(e) => handleUpdate('summary', e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Experience</label>
                        <button
                            onClick={() => handleEnhance(data?.experienceText || '', (res) => handleUpdate('experienceText', res))}
                            className="text-xs flex items-center gap-1 text-primary hover:text-primary/80"
                        >
                            <Sparkles className="h-3 w-3" /> Enhance with AI
                        </button>
                    </div>
                    <textarea
                        className="border p-2 w-full rounded-md text-sm min-h-[140px] font-mono"
                        placeholder={`Software Engineer - Company (2022 - Present)\n- Built X achieving Y\n- Reduced Z by 30%`}
                        value={data?.experienceText || ''}
                        onChange={(e) => handleUpdate('experienceText', e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Education</label>
                    <textarea
                        className="border p-2 w-full rounded-md text-sm min-h-[80px] font-mono"
                        placeholder="B.S. Computer Science, MIT (2018-2022)"
                        value={data?.educationText || ''}
                        onChange={(e) => handleUpdate('educationText', e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Skills</label>
                    <textarea
                        className="border p-2 w-full rounded-md text-sm min-h-[60px]"
                        placeholder="JavaScript, TypeScript, React, Next.js..."
                        value={data?.skillsText || ''}
                        onChange={(e) => handleUpdate('skillsText', e.target.value)}
                    />
                </div>
            </div>

            {/* Preview Panel */}
            <div className="overflow-y-auto p-6 bg-muted/20">
                <h2 className="text-xl font-bold mb-4">Preview</h2>
                <div className="bg-white p-6 shadow">
                    <ResumePreview data={resume.data} />
                </div>
            </div>

        </div >
    )
}
