'use server'

import { createClient } from '../server'

export interface EntityLineage {
    deal: { id: string; title: string; status: string } | null
    quotations: { id: string; quotation_number: string; version_name: string; title: string; status: string; is_primary: boolean }[] | null
    contract: { id: string; contract_number: string; title: string; status: string } | null
    project: { id: string; title: string; status: string } | null
}

export async function getEntityLineage(entityType: 'deal' | 'quotation' | 'contract' | 'project', entityId: string): Promise<EntityLineage> {
    const supabase = await createClient()
    const result: EntityLineage = { deal: null, quotations: null, contract: null, project: null }

    let dealId = null
    let quotationId = null
    let contractId = null
    let projectId = null

    // 1. Resolve initial IDs based on input entity
    try {
        if (entityType === 'deal') {
            dealId = entityId
        } else if (entityType === 'quotation') {
            quotationId = entityId
            const { data } = await supabase.from('quotations').select('deal_id, project_id').eq('id', entityId).single()
            if (data) {
                dealId = data.deal_id
                projectId = data.project_id
            }
        } else if (entityType === 'contract') {
            contractId = entityId
            const { data } = await supabase.from('contracts').select('quotation_id, project_id').eq('id', entityId).single()
            if (data) {
                quotationId = data.quotation_id
                projectId = data.project_id
                if (quotationId) {
                    const { data: qData } = await supabase.from('quotations').select('deal_id').eq('id', quotationId).single()
                    if (qData) dealId = qData.deal_id
                }
            }
        } else if (entityType === 'project') {
            projectId = entityId
            const { data } = await supabase.from('projects').select('contract_id').eq('id', entityId).single()
            if (data) {
                contractId = data.contract_id
                if (contractId) {
                    const { data: cData } = await supabase.from('contracts').select('quotation_id').eq('id', contractId).single()
                    if (cData) {
                        quotationId = cData.quotation_id
                        if (quotationId) {
                            const { data: qData } = await supabase.from('quotations').select('deal_id').eq('id', quotationId).single()
                            if (qData) dealId = qData.deal_id
                        }
                    }
                }
            }
        }

        // 2. Fetch full lineage objects if IDs are known
        if (dealId) {
            const { data } = await supabase.from('deals').select('id, title, status').eq('id', dealId).single()
            if (data) result.deal = data
            
            // Fetch all quotations for this deal
            const { data: qData } = await supabase.from('quotations').select('id, quotation_number, version_name, title, status, is_primary').eq('deal_id', dealId).order('created_at', { ascending: false })
            if (qData) result.quotations = qData
        }

        if (quotationId && !dealId) {
            // Fallback if no deal but quotation exists
            const { data: qData } = await supabase.from('quotations').select('id, quotation_number, version_name, title, status, is_primary').eq('id', quotationId)
            if (qData) result.quotations = qData
        }

        if (contractId) {
            const { data } = await supabase.from('contracts').select('id, contract_number, title, status').eq('id', contractId).single()
            if (data) result.contract = data
        } else if (quotationId) {
            // Try to find contract by quotation
            const { data } = await supabase.from('contracts').select('id, contract_number, title, status').eq('quotation_id', quotationId).order('created_at', { ascending: false }).limit(1).maybeSingle()
            if (data) result.contract = data
        }

        if (projectId) {
            const { data } = await supabase.from('projects').select('id, title, status').eq('id', projectId).single()
            if (data) result.project = data
        } else if (contractId) {
            const { data } = await supabase.from('projects').select('id, title, status').eq('contract_id', contractId).limit(1).maybeSingle()
            if (data) result.project = data
        }
    } catch (err) {
        console.error('Error fetching lineage:', err)
    }

    return result
}
