'use client'

interface TemplateCardProps {
    id: string
    title: string
    description: string
    isPremium: boolean
}

export default function TemplateCard({ id, title, description, isPremium }: TemplateCardProps) {
    return (
        <div
            className="group relative border rounded-xl p-6 hover:shadow-xl transition-all duration-300 bg-card hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
            <div className="flex flex-col h-full">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-xl">{title}</h3>
                        {isPremium && (
                            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Premium
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="mt-auto pt-4 flex items-center gap-2 text-primary font-semibold text-sm">
                    <span>Use Template</span>
                    <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>

            {/* Hover overlay/effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/20 rounded-xl transition-all pointer-events-none" />
        </div>
    )
}

