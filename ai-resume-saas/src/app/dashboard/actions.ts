'use server'

import { createClient } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createResume() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data, error } = await supabase
        .from('resumes')
        .insert([
            {
                user_id: user.id,
                title: 'Untitled Resume',
                data: {
                    personal: { fullName: '', email: '', phone: '', location: '', website: '' },
                    summary: '',
                    experience: [],
                    education: [],
                    skills: []
                }
            }
        ])
        .select()
        .single()

    if (error || !data) {
        console.error('Error creating resume:', error)
        throw new Error('Could not create resume')
    }

    revalidatePath('/dashboard')
    redirect(`/builder/${data.id}`)
}
