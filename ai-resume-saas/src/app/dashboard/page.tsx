import { createClient } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { PlusCircle, FileText, Sparkles, LogOut } from 'lucide-react'
import { createResume } from './actions'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: resumes } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col min-h-[100dvh]">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <Link className="flex items-center justify-center gap-2" href="/dashboard">
                    <Sparkles className="h-6 w-6 text-primary" />
                    <span className="font-bold">AI Resume Pro</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                    <span className="text-sm font-medium text-muted-foreground mr-4">
                        {user.email}
                    </span>
                    <form action="/api/auth/signout" method="POST">
                        <button className="text-sm font-medium hover:underline flex items-center gap-1 text-destructive">
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </form>
                </nav>
            </header>

            <main className="flex-1 py-8 px-4 md:px-6 container">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
                        <p className="text-muted-foreground mt-1">Manage and edit your professional resumes.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/builder/new"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/20 transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Create with AI
                        </Link>
                        <form action={createResume}>
                            <button className="inline-flex h-10 items-center justify-center rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Custom Resume
                            </button>
                        </form>
                    </div>
                </div>

                {resumes && resumes.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {resumes.map((resume) => (
                            <Link
                                href={`/builder/${resume.id}`}
                                key={resume.id}
                                className="group flex flex-col justify-between overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/50 transition-all h-[240px]"
                            >
                                <div className="p-6 flex flex-col items-center justify-center flex-1 bg-muted/10 group-hover:bg-primary/5 transition-colors">
                                    <FileText className="h-16 w-16 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                                </div>
                                <div className="p-4 border-t bg-background">
                                    <h3 className="font-semibold text-lg truncate" title={resume.title}>
                                        {resume.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-xl bg-muted/10 text-center space-y-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                            <FileText className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">No resumes yet</h2>
                        <p className="text-muted-foreground max-w-[500px]">
                            You haven&apos;t created any resumes. Click the &quot;New Resume&quot; button above to get started.
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
