import { generateAI } from '@/lib/openrouter'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { content } = await req.json()

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 })
        }

        const prompt = `
Score this resume for ATS compatibility. 
Return ONLY a numeric score out of 100 as the first line, followed by 3 brief bullet points on how to improve it.

Resume Content:
${content}
`

        const result = await generateAI(prompt)

        return NextResponse.json({
            result: result,
        })
    } catch (error) {
        console.error('Score API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
