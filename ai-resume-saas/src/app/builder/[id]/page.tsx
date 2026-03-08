import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ResumeEditor from '@/components/ResumeEditor'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// In Next.js 15+, params is a Promise
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const resolvedParams = await params
    const id = resolvedParams.id

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: resume, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !resume) {
        redirect('/dashboard')
    }

    return (
        <div className="flex flex-col h-[100dvh]">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur z-50 shrink-0">
                <Link className="flex items-center justify-center gap-2 text-sm font-medium hover:text-primary transition-colors" href="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
                <div className="ml-auto text-sm font-medium truncate max-w-[200px] sm:max-w-md">
                    Editing: {resume.title}
                </div>
            </header>

            <main className="flex-1 overflow-hidden">
                <ResumeEditor initialResume={resume} />
            </main>
        </div>
    )
}
