'use server'

import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { QuotePortal } from '@/types'
import { revalidatePath } from 'next/cache'
import { logActivity } from './activity-service'
import { v4 as uuidv4 } from 'uuid'

// ============================================
// ADMIN QUERIES
// ============================================

export async function getQuotePortals(customerId?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('quote_portals')
            .select(`
                *,
                customer:customers(id, company_name),
                creator:users!created_by(id, full_name),
                items:quote_portal_items(
                    id, quotation_id, sort_order, is_recommended, is_default,
                    quotation:quotations(id, quotation_number, title, status, total_amount, version_name, created_at)
                )
            `)
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        const { data, error } = await query
        if (error) throw error
        return (data || []) as QuotePortal[]
    } catch (err) {
        console.error('Error fetching quote portals:', err)
        return []
    }
}

export async function getQuotePortalById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('quote_portals')
            .select(`
                *,
                customer:customers(*),
                creator:users!created_by(id, full_name),
                items:quote_portal_items(
                    id, quotation_id, sort_order, is_recommended, is_default, created_at,
                    quotation:quotations(id, quotation_number, title, status, total_amount, version_name, notes, public_token, created_at, updated_at)
                )
            `)
            .eq('id', id)
            .single()

        if (error) throw error

        // Sort items by sort_order
        if (data?.items) {
            data.items.sort((a: any, b: any) => a.sort_order - b.sort_order)
        }

        return data as QuotePortal
    } catch (err) {
        console.error('Error fetching quote portal by id:', err)
        return null
    }
}

// ============================================
// PUBLIC QUERY (for /quote/p_xxx pages)
// ============================================

export async function getQuotePortalByToken(token: string) {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('quote_portals')
            .select(`
                *,
                customer:customers(*),
                items:quote_portal_items(
                    id, quotation_id, sort_order, is_recommended, is_default,
                    quotation:quotations(*, items:quotation_items(*), contracts(id, type, contract_number, order_number))
                )
            `)
            .eq('public_token', token)
            .eq('is_active', true)
            .single()

        if (error || !data) return null

        // Sort items: first by is_default (true comes first), then by sort_order
        if (data.items) {
            data.items.sort((a: any, b: any) => {
                if (a.is_default && !b.is_default) return -1;
                if (!a.is_default && b.is_default) return 1;
                return a.sort_order - b.sort_order;
            })
        }

        return data as QuotePortal
    } catch (err) {
        console.error('Error fetching portal by token:', err)
        return null
    }
}

// ============================================
// MUTATIONS
// ============================================

export async function createQuotePortal(data: {
    title?: string
    customer_id: string
    deal_id?: string
    project_id?: string
    brand?: string
    quotation_ids?: string[]
    attachments?: any[]
}): Promise<{ success: boolean; data?: QuotePortal; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('Auth error in createQuotePortal:', authError)
            return { success: false, error: 'Không xác thực được người dùng. Vui lòng đăng nhập lại.' }
        }

        const publicToken = 'p_' + uuidv4().replace(/-/g, '')

        const { data: portal, error } = await supabase
            .from('quote_portals')
            .insert([{
                title: data.title || 'Portal báo giá',
                customer_id: data.customer_id,
                deal_id: data.deal_id || null,
                project_id: data.project_id || null,
                brand: data.brand || 'tulie_agency',
                public_token: publicToken,
                created_by: user.id,
                is_active: true,
                attachments: data.attachments || [],
            }])
            .select()
            .single()

        if (error) {
            console.error('Supabase insert error (quote_portals):', error)
            return { success: false, error: `Lỗi tạo portal: ${error.message}` }
        }

        // Add initial quotations
        if (data.quotation_ids?.length) {
            const items = data.quotation_ids.map((qId, idx) => ({
                portal_id: portal.id,
                quotation_id: qId,
                sort_order: idx,
            }))
            const { error: itemsError } = await supabase.from('quote_portal_items').insert(items)
            if (itemsError) {
                console.error('Supabase insert error (quote_portal_items):', itemsError)
                // Don't fail the whole operation, portal was already created
            }
        }

        await logActivity({
            action: 'create',
            entity_type: 'quotation',
            entity_id: portal.id,
            description: `Tạo portal báo giá: ${data.title || publicToken}`
        })

        revalidatePath('/quotations')
        return { success: true, data: portal as QuotePortal }
    } catch (err: any) {
        console.error('Error creating quote portal:', err)
        return { success: false, error: err?.message || 'Lỗi không xác định khi tạo portal' }
    }
}

export async function updateQuotePortal(id: string, updates: Partial<QuotePortal>) {
    try {
        const supabase = await createClient()
        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
        }
        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.is_active !== undefined) updateData.is_active = updates.is_active
        if (updates.attachments !== undefined) updateData.attachments = updates.attachments

        const { data, error } = await supabase
            .from('quote_portals')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        revalidatePath('/quotations')
        return data
    } catch (err) {
        console.error('Error updating quote portal:', err)
        throw err
    }
}

export async function addQuotationToPortal(portalId: string, quotationId: string) {
    try {
        const supabase = await createClient()

        // Get max sort_order
        const { data: existingItems } = await supabase
            .from('quote_portal_items')
            .select('sort_order')
            .eq('portal_id', portalId)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingItems?.[0]?.sort_order ?? -1) + 1

        const { error } = await supabase
            .from('quote_portal_items')
            .insert([{
                portal_id: portalId,
                quotation_id: quotationId,
                sort_order: nextOrder,
            }])

        if (error) throw error

        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        console.error('Error adding quotation to portal:', err)
        return { success: false, error: err.message }
    }
}

export async function removeQuotationFromPortal(portalId: string, quotationId: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quote_portal_items')
            .delete()
            .eq('portal_id', portalId)
            .eq('quotation_id', quotationId)

        if (error) throw error

        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        console.error('Error removing quotation from portal:', err)
        return { success: false, error: err.message }
    }
}

export async function reorderPortalItems(portalId: string, orderedQuotationIds: string[]) {
    try {
        const supabase = await createClient()

        // Update sort_order for each item
        const updates = orderedQuotationIds.map((qId, idx) =>
            supabase
                .from('quote_portal_items')
                .update({ sort_order: idx })
                .eq('portal_id', portalId)
                .eq('quotation_id', qId)
        )

        await Promise.all(updates)
        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        console.error('Error reordering portal items:', err)
        return { success: false, error: err.message }
    }
}

export async function toggleRecommended(portalId: string, quotationId: string, isRecommended: boolean) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quote_portal_items')
            .update({ is_recommended: isRecommended })
            .eq('portal_id', portalId)
            .eq('quotation_id', quotationId)

        if (error) throw error

        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function toggleDefault(portalId: string, quotationId: string) {
    try {
        const supabase = await createClient()
        // Define all as false first
        await supabase
            .from('quote_portal_items')
            .update({ is_default: false })
            .eq('portal_id', portalId)
            
        // Set the targeted one
        const { error } = await supabase
            .from('quote_portal_items')
            .update({ is_default: true })
            .eq('portal_id', portalId)
            .eq('quotation_id', quotationId)

        if (error) throw error

        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

export async function deleteQuotePortal(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('quote_portals')
            .delete()
            .eq('id', id)

        if (error) throw error

        revalidatePath('/quotations')
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message }
    }
}

// ============================================
// AUTO-CREATE PORTAL (called from quotation-service)
// ============================================

/**
 * Find or create a portal for a deal/project, then add the quotation to it.
 */
export async function ensureQuotationInPortal(quotationId: string, dealId?: string | null, projectId?: string | null, customerId?: string | null, brand?: string | null) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!dealId && !projectId) return // No grouping key

        // Check if portal already exists for this deal/project
        let query = supabase.from('quote_portals').select('id').eq('is_active', true)
        if (dealId) {
            query = query.eq('deal_id', dealId)
        } else {
            query = query.eq('project_id', projectId!).is('deal_id', null)
        }

        const { data: existingPortals } = await query.limit(1)

        let portalId: string

        if (existingPortals && existingPortals.length > 0) {
            portalId = existingPortals[0].id
        } else {
            // Get customer name for title
            let customerName = 'Khách hàng'
            if (customerId) {
                const { data: customer } = await supabase.from('customers').select('company_name').eq('id', customerId).single()
                if (customer) customerName = customer.company_name
            }

            const publicToken = 'p_' + uuidv4().replace(/-/g, '')
            const { data: newPortal, error } = await supabase
                .from('quote_portals')
                .insert([{
                    title: `Portal — ${customerName}`,
                    customer_id: customerId,
                    deal_id: dealId || null,
                    project_id: projectId || null,
                    brand: brand || 'tulie_agency',
                    public_token: publicToken,
                    created_by: user?.id,
                    is_active: true,
                }])
                .select('id')
                .single()

            if (error || !newPortal) return
            portalId = newPortal.id
        }

        // Add quotation to portal (ignore duplicate)
        const { data: existingItems } = await supabase
            .from('quote_portal_items')
            .select('sort_order')
            .eq('portal_id', portalId)
            .order('sort_order', { ascending: false })
            .limit(1)

        const nextOrder = (existingItems?.[0]?.sort_order ?? -1) + 1

        await supabase
            .from('quote_portal_items')
            .upsert([{
                portal_id: portalId,
                quotation_id: quotationId,
                sort_order: nextOrder,
            }], { onConflict: 'portal_id,quotation_id' })

    } catch (err) {
        // Non-blocking — portal creation should never break quotation flow
        console.error('Error in ensureQuotationInPortal:', err)
    }
}
