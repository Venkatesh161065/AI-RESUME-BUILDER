import jsPDF from 'jspdf'

export function exportPDF(content: string) {
    const doc = new jsPDF()
    doc.text(content, 10, 10)
    doc.save('resume.pdf')
}
