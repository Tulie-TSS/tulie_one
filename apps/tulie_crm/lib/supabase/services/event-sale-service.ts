'use server'

import { createClient } from '../server'
import { EventSale } from '@repo/db-types'
import { revalidatePath } from 'next/cache'

export async function getEventSales(): Promise<EventSale[]> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('event_sales')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as EventSale[]
    } catch (err) {
        console.error('Error in getEventSales:', err)
        return []
    }
}

export async function getEventSaleById(id: string): Promise<EventSale | null> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('event_sales')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as EventSale
    } catch (err) {
        console.error('Error in getEventSaleById:', err)
        return null
    }
}

export async function getEventSaleByDomain(domain: string): Promise<EventSale | null> {
    try {
        // Use admin client since this is queried from public landing pages
        const { createAdminClient } = await import('../admin')
        const supabase = createAdminClient()
        
        const { data, error } = await supabase
            .from('event_sales')
            .select('*')
            .eq('is_active', true)
            .contains('subdomains', [domain])
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data as EventSale | null
    } catch (err) {
        console.error('Error in getEventSaleByDomain:', err)
        return null
    }
}

export async function createEventSale(eventData: Partial<EventSale>): Promise<EventSale> {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('event_sales')
            .insert([eventData])
            .select()
            .single()

        if (error) throw error
        revalidatePath('/studio/events')
        return data as EventSale
    } catch (err) {
        console.error('Error creating event sale:', err)
        throw err
    }
}

export async function updateEventSale(id: string, eventData: Partial<EventSale>): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('event_sales')
            .update(eventData)
            .eq('id', id)

        if (error) throw error
        revalidatePath('/studio/events')
        revalidatePath(`/studio/events/${id}`)
        return true
    } catch (err) {
        console.error('Error updating event sale:', err)
        throw err
    }
}

export async function deleteEventSale(id: string): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('event_sales')
            .delete()
            .eq('id', id)

        if (error) throw error
        revalidatePath('/studio/events')
        return true
    } catch (err) {
        console.error('Error deleting event sale:', err)
        throw err
    }
}
