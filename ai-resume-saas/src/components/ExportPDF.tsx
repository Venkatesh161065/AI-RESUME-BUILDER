'use client'

import { exportPDF } from '@/lib/exportPDF'

interface ExportPDFProps {
    content: string
}

export default function ExportPDF({ content }: ExportPDFProps) {
    return (
        <button
            onClick={() => exportPDF(content)}
            className="inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors gap-2"
        >
            Download PDF
        </button>
    )
}
