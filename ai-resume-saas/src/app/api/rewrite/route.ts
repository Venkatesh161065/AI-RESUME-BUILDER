import { NextResponse } from 'next/server'
import { generateAI } from '@/lib/openrouter'

export async function POST(req: Request) {
    try {
        const { text, jobDescription } = await req.json()

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 })
        }

        const prompt = jobDescription
            ? `You are an expert resume writer. Rewrite the following resume text to better match this job description: "${jobDescription}". Focus on relevant keywords and achievements. Return ONLY the rewritten text, no explanations or markdown.\n\nText to rewrite:\n${text}`
            : `You are an expert resume writer. Enhance the following text to sound more professional, action-oriented, and impactful. Use strong action verbs and quantifiable achievements where possible. Return ONLY the enhanced text, no explanations or markdown.\n\nText to enhance:\n${text}`

        const enhanced = await generateAI(prompt)

        return NextResponse.json({ enhanced })
    } catch (error) {
        console.error('Rewrite API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
