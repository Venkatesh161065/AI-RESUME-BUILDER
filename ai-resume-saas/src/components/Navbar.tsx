import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function Navbar() {
    return (
        <header className="px-4 lg:px-6 h-14 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <Link className="flex items-center justify-center gap-2" href="/">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="font-bold">AI Resume Pro</span>
            </Link>
            <nav className="ml-auto flex gap-4 sm:gap-6">
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/templates">
                    Templates
                </Link>
                <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                    Login
                </Link>
            </nav>
        </header>
    )
}
