'use client'

interface Template {
    name: string
    description: string
    [key: string]: unknown
}

interface TemplateCardProps {
    template: Template
    onSelect: (template: Template) => void
}

export default function TemplateCard({ template, onSelect }: TemplateCardProps) {
    return (
        <div
            onClick={() => onSelect(template)}
            className="border rounded-xl p-4 hover:shadow-lg cursor-pointer transition-shadow"
        >
            <h3 className="font-bold">{template.name}</h3>
            <p className="text-sm text-gray-500">
                {template.description}
            </p>
        </div>
    )
}
