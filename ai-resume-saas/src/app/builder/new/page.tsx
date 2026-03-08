'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const steps = [
    {
        id: 'personal',
        title: 'Basic Info',
        fields: ['name', 'title', 'email', 'phone', 'location'],
    },
    {
        id: 'summary',
        title: 'Professional Summary',
        fields: ['summary'],
    },
    {
        id: 'projects',
        title: 'Projects & Experience',
        fields: ['projects'],
    },
]

export default function QuickBuilder() {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        projects: '',
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const router = useRouter()

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1)
    }

    const handleBack = () => {
        if (step > 0) setStep(step - 1)
    }

    const generateResume = async () => {
        setIsGenerating(true)
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()
            const resumeData = data.resume

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please login to save your resume')
                router.push('/login')
                return
            }

            // Save to Supabase
            const { data: newResume, error } = await supabase
                .from('resumes')
                .insert({
                    user_id: user.id,
                    title: `${formData.title || 'Resume'} - AI Generated`,
                    data: resumeData,
                })
                .select()
                .single()

            if (error) throw error

            router.push(`/builder/${newResume.id}`)
        } catch (error) {
            console.error(error)
            alert('Failed to generate resume. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    const currentStep = steps[step]

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="max-w-xl w-full">
                {/* Progress Bar */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Glass decorations */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                {currentStep.title}
                            </h2>
                            <p className="text-slate-400 mb-8 text-sm">Step {step + 1} of {steps.length}</p>

                            <div className="space-y-4">
                                {currentStep.fields.map((field) => (
                                    <div key={field} className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            {field === 'name' ? 'Full Name' : field === 'title' ? 'Target Job' : field}
                                        </label>
                                        {field === 'summary' || field === 'projects' ? (
                                            <textarea
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all min-h-[150px]"
                                                placeholder={`Tell us about your ${field}...`}
                                                value={formData[field as keyof typeof formData]}
                                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                            />
                                        ) : (
                                            <input
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                                                placeholder={`Enter your ${field}...`}
                                                value={formData[field as keyof typeof formData]}
                                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between mt-10">
                                <button
                                    onClick={handleBack}
                                    disabled={step === 0 || isGenerating}
                                    className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all hover:bg-slate-800 disabled:opacity-0"
                                >
                                    <ArrowLeft className="h-4 w-4" /> Back
                                </button>

                                {step === steps.length - 1 ? (
                                    <button
                                        onClick={generateResume}
                                        disabled={isGenerating}
                                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-5 w-5" />
                                                Generate AI Resume
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleNext}
                                        className="bg-white text-black px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all shadow-lg"
                                    >
                                        Next <ArrowRight className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Loading State Overlay */}
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6"
                    >
                        <div className="relative w-24 h-24 mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-4 border-cyan-500 rounded-full"
                            />
                            <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-cyan-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Crafting Your Masterpiece</h3>
                        <p className="text-slate-400 max-w-xs mx-auto">
                            Our AI is analyzing your details to build a high-impact, ATS-optimized resume just for you.
                        </p>

                        <div className="mt-8 flex gap-3">
                            <div className="flex items-center gap-2 text-xs text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-3 w-3" /> ATS Optimization
                            </div>
                            <div className="flex items-center gap-2 text-xs text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 rounded-full">
                                <CheckCircle2 className="h-3 w-3" /> Smart Phrasing
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
