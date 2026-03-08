import { generateAI } from '@/lib/openrouter'

export async function POST(req: Request) {
    const { name, title, email, phone, location, summary, projects } = await req.json()

    const prompt = `
Create a professional ATS-optimized resume in JSON format.
The response MUST be a valid JSON object.

User Details:
Name: ${name}
Target Job Title: ${title}
Email: ${email}
Phone: ${phone}
Location: ${location}

Professional Summary:
${summary}

Projects / Experience:
${projects}

Structure the JSON as follows:
{
  "personal": {
    "fullName": "${name}",
    "email": "${email}",
    "phone": "${phone}",
    "location": "${location}",
    "website": ""
  },
  "summary": "Keep this professional and impact-driven",
  "experienceText": "Detailed bullet points for projects/experience provided",
  "educationText": "Leave empty if not provided, else format professionally",
  "skillsText": "Extract relevant skills from the content",
  "jobDescription": "${title}"
}

Ensure the content is high-quality, professional, and uses strong action verbs.
Return ONLY the JSON object.
`

    const result = await generateAI(prompt)

    // Clean up potential markdown code blocks from LLM response
    const jsonString = result.replace(/```json\n?|\n?```/g, '').trim()
    const resumeData = JSON.parse(jsonString)

    return Response.json({
        resume: resumeData,
    })
}
