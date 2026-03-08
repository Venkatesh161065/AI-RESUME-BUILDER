import { generateAI } from '@/lib/openrouter'

export async function POST(req: Request) {
    const { name, skills, experience, job } = await req.json()

    const prompt = `
Create a professional ATS optimized resume.

Name: ${name}
Target Job: ${job}

Skills:
${skills}

Experience:
${experience}

Return JSON with:
summary
skills
experience
projects
`

    const result = await generateAI(prompt)

    return Response.json({
        resume: result,
    })
}
