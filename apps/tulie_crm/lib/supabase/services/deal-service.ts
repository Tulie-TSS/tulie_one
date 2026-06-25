'use server'

import { createClient } from '../server'
import { Deal, DealStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import { logActivity, logDestructiveAction } from './activity-service'
import { notifyDealWon, notifyDealLost } from './notification-service'

const stageToStatus: Record<string, DealStatus> = {
    lead: 'new',
    prospecting: 'new',
    qualified: 'briefing',
    meeting: 'briefing',
    proposal: 'proposal_sent',
    won: 'closed_won',
    lost: 'closed_lost',
    new: 'new',
    briefing: 'briefing',
    proposal_sent: 'proposal_sent',
    closed_won: 'closed_won',
    closed_lost: 'closed_lost',
}

const statusToStage: Record<DealStatus, string> = {
    new: 'lead',
    briefing: 'qualified',
    proposal_sent: 'proposal',
    closed_won: 'won',
    closed_lost: 'lost',
}

function normalizeDeal(row: any): Deal {
    const status = stageToStatus[row.status || row.stage] || 'new'
    return {
        ...row,
        status,
        budget: Number(row.budget ?? row.value ?? 0),
        priority: row.priority || 'medium',
        assigned_user: row.assigned_user || null,
    } as Deal
}

function toNewDealSchemaPayload(deal: Partial<Deal>) {
    const payload: any = { ...deal }
    if (payload.status) {
        payload.stage = statusToStage[payload.status as DealStatus] || payload.status
        delete payload.status
    }
    if (payload.budget !== undefined) {
        payload.value = payload.budget
        delete payload.budget
    }
    return payload
}

export async function getDeals(customerId?: string, brand?: string) {
    try {
        const supabase = await createClient()
        let query = supabase
            .from('deals')
            .select('*, customer:customers(id, company_name)')
            .order('created_at', { ascending: false })

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (brand) {
            query = query.eq('brand', brand)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching deals:', {
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
            })
            return []
        }

        return (data || []).map(normalizeDeal)
    } catch (err) {
        console.error('Fatal error in getDeals:', err)
        return []
    }
}

export async function getDealById(id: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('deals')
            .select('*, customer:customers(*), quotations(*)')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching deal by id:', {
                code: error?.code,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
            })
            return null
        }

        return normalizeDeal(data)
    } catch (err) {
        console.error('Fatal error in getDealById:', err)
        return null
    }
}

export async function createDeal(deal: Partial<Deal>) {
    try {
        const supabase = await createClient()

        // Get current user id
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        let { data, error } = await supabase
            .from('deals')
            .insert([{
                ...deal,
                created_by: user.id
            }])
            .select()
            .single()

        if (error) {
            const fallback = await supabase
                .from('deals')
                .insert([{
                    ...toNewDealSchemaPayload(deal),
                    created_by: user.id
                }])
                .select()
                .single()

            if (fallback.error) {
                console.error('Error creating deal:', {
                    code: error?.code,
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    fallback: {
                        code: fallback.error?.code,
                        message: fallback.error?.message,
                        details: fallback.error?.details,
                        hint: fallback.error?.hint,
                    }
                })
                throw fallback.error
            }
            data = fallback.data
            error = null
        }

        revalidatePath('/deals')

        await logActivity({
            action: 'create',
            entity_type: 'deal',
            entity_id: data.id,
            description: `Tạo cơ hội mới: ${data.title}`
        })

        return data as Deal
    } catch (err) {
        console.error('Service error creating deal:', err)
        throw err
    }
}

export async function updateDeal(id: string, deal: Partial<Deal>) {
    try {
        const supabase = await createClient()

        // Get current deal for status change detection
        const { data: currentDeal } = await supabase
            .from('deals')
            .select('*')
            .eq('id', id)
            .single()

        let { error } = await supabase
            .from('deals')
            .update(deal)
            .eq('id', id)

        if (error) {
            const fallbackPayload = toNewDealSchemaPayload(deal)
            const fallback = await supabase
                .from('deals')
                .update(fallbackPayload)
                .eq('id', id)

            if (fallback.error) {
                console.error('Error updating deal:', {
                    code: error?.code,
                    message: error?.message,
                    details: error?.details,
                    hint: error?.hint,
                    fallback: {
                        code: fallback.error?.code,
                        message: fallback.error?.message,
                        details: fallback.error?.details,
                        hint: fallback.error?.hint,
                    }
                })
                throw fallback.error
            }
            error = null
        }

        const currentStatus = currentDeal ? normalizeDeal(currentDeal).status : undefined
        await logActivity({
            action: 'update',
            entity_type: 'deal',
            entity_id: id,
            description: `Cập nhật cơ hội: ${deal.title || currentDeal?.title || id}`,
            metadata: deal
        })

        // Notify on deal status changes
        if (deal.status && currentDeal && deal.status !== currentStatus) {
            const dealForNotify = {
                id,
                title: deal.title || currentDeal.title || '',
                assigned_to: currentDeal.assigned_to,
                created_by: currentDeal.created_by || '',
            }
            if (deal.status === 'closed_won') {
                notifyDealWon(dealForNotify).catch(() => {})
            } else if (deal.status === 'closed_lost') {
                notifyDealLost(dealForNotify).catch(() => {})
            }
        }

        revalidatePath('/deals')
        revalidatePath(`/deals/${id}`)
        return true
    } catch (err) {
        console.error('Service error updating deal:', err)
        throw err
    }
}

export async function updateDealStatus(id: string, status: DealStatus) {
    return updateDeal(id, { status })
}

export async function deleteDeal(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase
            .from('deals')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting deal:', error)
            throw error
        }

        revalidatePath('/deals')
        await logDestructiveAction('deal', id, 'delete')
        return true
    } catch (err) {
        console.error('Service error deleting deal:', err)
        throw err
    }
}
