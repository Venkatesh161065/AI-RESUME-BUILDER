export interface ResumePersonal {
    fullName: string
    email: string
    phone: string
    location: string
    website: string
}

export interface ResumeData {
    personal: ResumePersonal
    summary: string
    experienceText: string
    educationText: string
    skillsText: string
    jobDescription: string
}

export interface Resume {
    id: string
    user_id: string
    title: string
    data: ResumeData
    created_at: string
    updated_at: string
}
