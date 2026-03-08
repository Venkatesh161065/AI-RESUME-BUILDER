import Navbar from '@/components/Navbar'
import TemplateCard from '@/components/TemplateCard'

export default function TemplatesPage() {
    const templates = [
        {
            id: 'modern-clean',
            title: 'Modern Clean',
            description: 'A minimalist ATS-friendly design focusing on readability.',
            isPremium: false,
        },
        {
            id: 'executive-pro',
            title: 'Executive Pro',
            description: 'Sophisticated layout tailored for senior management roles.',
            isPremium: true,
        },
        {
            id: 'creative-studio',
            title: 'Creative Studio',
            description: 'Stand out with bold typography and a two-column unique layout.',
            isPremium: true,
        },
        {
            id: 'tech-focused',
            title: 'Tech Focused',
            description: 'Highlight your skills and GitHub projects prominently.',
            isPremium: false,
        }
    ]

    return (
        <div className="flex flex-col min-h-[100dvh]">
            <Navbar />
            <main className="flex-1 py-12 px-4 md:px-6 container">
                <div className="mb-8 max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Resume Templates</h1>
                    <p className="text-muted-foreground">
                        Choose a professional template to start building your resume. All our templates are designed to pass Applicant Tracking Systems (ATS).
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {templates.map(template => (
                        <TemplateCard key={template.id} {...template} />
                    ))}
                </div>
            </main>
        </div>
    )
}
