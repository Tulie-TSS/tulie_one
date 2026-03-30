'use client'

import { createClient } from '../client'

export async function getPartnerRegistrations() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('partner_registrations')
        .select(`
            *,
            users!reviewed_by (full_name, email)
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching partner registrations:', error)
        throw error
    }
    
    return data || []
}

export async function updatePartnerRegistrationStatus(
    id: string, 
    status: 'approved' | 'rejected', 
    reviewedBy: string,
    rejectReason?: string
) {
    const supabase = createClient()
    
    // In a real app we might wrap this in an RPC or trigger to auto-create user accounts
    // For now we just update the status
    const updates: any = {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
    
    if (rejectReason) {
        updates.reject_reason = rejectReason
    }
    
    const { data, error } = await supabase
        .from('partner_registrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating partner registration:', error)
        throw error
    }
    
    return data
}
