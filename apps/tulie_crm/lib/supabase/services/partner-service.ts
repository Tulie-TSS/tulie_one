'use server'

import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { revalidatePath } from 'next/cache'

// Define the type for Partner Registration
export interface PartnerRegistration {
    id: string
    full_name: string
    phone: string
    email?: string | null
    address?: string | null
    id_card_type: 'images' | 'pdf'
    id_card_front_url?: string | null
    id_card_back_url?: string | null
    id_card_pdf_url?: string | null
    bank_account_number?: string | null
    bank_account_name?: string | null
    bank_name?: string | null
    preferred_role: 'lead_only' | 'consult_close' | 'full_close'
    experience?: string | null
    referral_source?: string | null
    note?: string | null
    status: 'pending' | 'approved' | 'rejected'
    reviewed_by?: string | null
    reviewed_at?: string | null
    reject_reason?: string | null
    user_id?: string | null
    created_at: string
    updated_at: string
}

export async function getPartnerRegistrations(): Promise<PartnerRegistration[]> {
    try {
        const supabase = await createClient()
        
        const { data, error } = await supabase
            .from('partner_registrations')
            .select(`
                *,
                reviewer:users!reviewed_by(id, full_name)
            `)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching partner registrations:', error)
            return []
        }

        return data as PartnerRegistration[]
    } catch (error) {
        console.error('Exception fetching partner registrations:', error)
        return []
    }
}

export async function updatePartnerRegistrationStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    reason?: string
) {
    try {
        const supabase = await createClient()
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id

        if (!userId) {
            return { success: false, error: 'Unauthorized' }
        }

        const updateData: any = {
            status,
            reviewed_by: userId,
            reviewed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }

        if (status === 'rejected' && reason) {
            updateData.reject_reason = reason
        }

        const { error } = await supabase
            .from('partner_registrations')
            .update(updateData)
            .eq('id', id)

        if (error) {
            console.error('Failed to update registration status:', error)
            return { success: false, error: error.message }
        }

        revalidatePath('/team/partners')
        return { success: true }
    } catch (error: any) {
        console.error('Exception updating registration status:', error)
        return { success: false, error: error.message }
    }
}
