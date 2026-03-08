'use client'

import { useRef, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { ResumeData } from '@/types/resume'

export default function ResumePreview({ data }: { data: ResumeData }) {
    const resumeRef = useRef<HTMLDivElement>(null)
    const [exporting, setExporting] = useState(false)

    const downloadPDF = async () => {
        if (!resumeRef.current) return
        setExporting(true)
        try {
            const canvas = await html2canvas(resumeRef.current, { scale: 2 })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: 'a4' })
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save('resume.pdf')
        } catch (e) {
            console.error(e)
            alert('Failed to export PDF')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <button
                onClick={downloadPDF}
                disabled={exporting}
                className="self-end inline-flex items-center gap-2 border rounded-md px-4 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
            >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF
            </button>

            <div className="bg-white text-black p-8 shadow" ref={resumeRef}>
                <h1 className="text-2xl font-bold">
                    {data?.personal?.fullName || 'Your Name'}
                </h1>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1 mb-4">
                    {data?.personal?.email && <span>{data.personal.email}</span>}
                    {data?.personal?.phone && <span>· {data.personal.phone}</span>}
                    {data?.personal?.location && <span>· {data.personal.location}</span>}
                    {data?.personal?.website && <span>· {data.personal.website}</span>}
                </div>

                {data?.summary && (
                    <div className="mb-4">
                        <h2 className="font-bold border-b mb-1">Summary</h2>
                        <p className="text-sm">{data.summary}</p>
                    </div>
                )}

                {data?.experienceText && (
                    <div className="mb-4">
                        <h2 className="font-bold border-b mb-1">Experience</h2>
                        <p className="text-sm whitespace-pre-wrap">{data.experienceText}</p>
                    </div>
                )}

                {data?.educationText && (
                    <div className="mb-4">
                        <h2 className="font-bold border-b mb-1">Education</h2>
                        <p className="text-sm whitespace-pre-wrap">{data.educationText}</p>
                    </div>
                )}

                {data?.skillsText && (
                    <div className="mb-4">
                        <h2 className="font-bold border-b mb-1">Skills</h2>
                        <p className="text-sm">{data.skillsText}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
