'use server'

import { createClient } from '../server'

export interface EntityLineage {
    deal: { id: string; title: string; status: string } | null
    quotation: { id: string; quotation_number: string; status: string } | null
    contract: { id: string; contract_number: string; status: string } | null
    project: { id: string; title: string; status: string } | null
}

/**
 * Resolve the full lineage chain: Deal → Quotation → Contract → Project
 * 
 * DB relationships:
 * - quotations.deal_id → deals.id
 * - contracts.quotation_id → quotations.id  
 * - contracts.project_id → projects.id
 * - quotations.project_id → projects.id (alternate path)
 * - projects.contract_id → contracts.id (forward FK, may be null)
 */
export async function getEntityLineage(
    entityType: 'deal' | 'quotation' | 'contract' | 'project',
    entityId: string
): Promise<EntityLineage> {
    const supabase = await createClient()
    const result: EntityLineage = { deal: null, quotation: null, contract: null, project: null }

    try {
        if (entityType === 'deal') {
            // Deal → find accepted/primary quotation → contract → project
            const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', entityId).single()
            if (deal) result.deal = deal

            // Get the most relevant quotation (accepted > primary > newest)
            const { data: quotations } = await supabase
                .from('quotations')
                .select('id, quotation_number, status')
                .eq('deal_id', entityId)
                .order('created_at', { ascending: false })
            
            if (quotations && quotations.length > 0) {
                const accepted = quotations.find(q => q.status === 'accepted' || q.status === 'converted')
                result.quotation = accepted || quotations[0]
            }

            // Find contract linked to any quotation of this deal
            if (result.quotation) {
                const { data: contract } = await supabase
                    .from('contracts')
                    .select('id, contract_number, status')
                    .eq('quotation_id', result.quotation.id)
                    .limit(1).maybeSingle()
                if (contract) result.contract = contract
            }

            // Find project linked to contract or quotation
            if (result.contract) {
                const { data: project } = await supabase
                    .from('projects')
                    .select('id, title, status')
                    .eq('contract_id', result.contract.id)
                    .limit(1).maybeSingle()
                if (project) result.project = project

                if (!result.project) {
                    // Try reverse: contract.project_id
                    const { data: cWithProject } = await supabase
                        .from('contracts')
                        .select('project_id')
                        .eq('id', result.contract.id)
                        .single()
                    if (cWithProject?.project_id) {
                        const { data: project } = await supabase
                            .from('projects')
                            .select('id, title, status')
                            .eq('id', cWithProject.project_id)
                            .single()
                        if (project) result.project = project
                    }
                }
            }

        } else if (entityType === 'quotation') {
            // Quotation → resolve deal (up), contract & project (down)
            const { data: q } = await supabase
                .from('quotations')
                .select('id, quotation_number, status, deal_id, project_id')
                .eq('id', entityId).single()
            if (q) {
                result.quotation = { id: q.id, quotation_number: q.quotation_number, status: q.status }

                // Up: Deal
                if (q.deal_id) {
                    const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', q.deal_id).single()
                    if (deal) result.deal = deal
                }

                // Down: Contract from quotation
                const { data: contract } = await supabase
                    .from('contracts')
                    .select('id, contract_number, status, project_id')
                    .eq('quotation_id', entityId)
                    .order('created_at', { ascending: false })
                    .limit(1).maybeSingle()
                if (contract) {
                    result.contract = { id: contract.id, contract_number: contract.contract_number, status: contract.status }
                    // Project from contract.project_id
                    if (contract.project_id) {
                        const { data: project } = await supabase
                            .from('projects').select('id, title, status')
                            .eq('id', contract.project_id).single()
                        if (project) result.project = project
                    }
                }

                // Fallback: Project from quotation.project_id
                if (!result.project && q.project_id) {
                    const { data: project } = await supabase
                        .from('projects').select('id, title, status')
                        .eq('id', q.project_id).single()
                    if (project) result.project = project
                }

                // Fallback: Find project that has contract_id matching our contract
                if (!result.project && result.contract) {
                    const { data: project } = await supabase
                        .from('projects').select('id, title, status')
                        .eq('contract_id', result.contract.id)
                        .limit(1).maybeSingle()
                    if (project) result.project = project
                }
            }

        } else if (entityType === 'contract') {
            // Contract → resolve quotation & deal (up), project (down)
            const { data: c } = await supabase
                .from('contracts')
                .select('id, contract_number, status, quotation_id, project_id')
                .eq('id', entityId).single()
            if (c) {
                result.contract = { id: c.id, contract_number: c.contract_number, status: c.status }

                // Up: Quotation
                if (c.quotation_id) {
                    const { data: q } = await supabase
                        .from('quotations').select('id, quotation_number, status, deal_id')
                        .eq('id', c.quotation_id).single()
                    if (q) {
                        result.quotation = { id: q.id, quotation_number: q.quotation_number, status: q.status }
                        if (q.deal_id) {
                            const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', q.deal_id).single()
                            if (deal) result.deal = deal
                        }
                    }
                }

                // Down: Project
                if (c.project_id) {
                    const { data: project } = await supabase
                        .from('projects').select('id, title, status').eq('id', c.project_id).single()
                    if (project) result.project = project
                }
                if (!result.project) {
                    const { data: project } = await supabase
                        .from('projects').select('id, title, status')
                        .eq('contract_id', entityId)
                        .limit(1).maybeSingle()
                    if (project) result.project = project
                }
            }

        } else if (entityType === 'project') {
            // Project → resolve contract, quotation, deal (all up)
            const { data: p } = await supabase
                .from('projects')
                .select('id, title, status, contract_id')
                .eq('id', entityId).single()
            if (p) {
                result.project = { id: p.id, title: p.title, status: p.status }

                // Up: Contract — try forward FK first, then reverse FK
                let contractId = p.contract_id
                if (contractId) {
                    const { data: c } = await supabase
                        .from('contracts').select('id, contract_number, status, quotation_id')
                        .eq('id', contractId).single()
                    if (c) {
                        result.contract = { id: c.id, contract_number: c.contract_number, status: c.status }
                        // Quotation from contract
                        if (c.quotation_id) {
                            const { data: q } = await supabase
                                .from('quotations').select('id, quotation_number, status, deal_id')
                                .eq('id', c.quotation_id).single()
                            if (q) {
                                result.quotation = { id: q.id, quotation_number: q.quotation_number, status: q.status }
                                if (q.deal_id) {
                                    const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', q.deal_id).single()
                                    if (deal) result.deal = deal
                                }
                            }
                        }
                    }
                }

                // Fallback: contract.project_id → project (reverse FK)
                if (!result.contract) {
                    const { data: c } = await supabase
                        .from('contracts')
                        .select('id, contract_number, status, quotation_id')
                        .eq('project_id', entityId)
                        .order('created_at', { ascending: false })
                        .limit(1).maybeSingle()
                    if (c) {
                        result.contract = { id: c.id, contract_number: c.contract_number, status: c.status }
                        if (c.quotation_id) {
                            const { data: q } = await supabase
                                .from('quotations').select('id, quotation_number, status, deal_id')
                                .eq('id', c.quotation_id).single()
                            if (q) {
                                result.quotation = { id: q.id, quotation_number: q.quotation_number, status: q.status }
                                if (q.deal_id) {
                                    const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', q.deal_id).single()
                                    if (deal) result.deal = deal
                                }
                            }
                        }
                    }
                }

                // Fallback: quotation.project_id → project (reverse FK)
                if (!result.quotation) {
                    const { data: q } = await supabase
                        .from('quotations')
                        .select('id, quotation_number, status, deal_id')
                        .eq('project_id', entityId)
                        .order('created_at', { ascending: false })
                        .limit(1).maybeSingle()
                    if (q) {
                        result.quotation = { id: q.id, quotation_number: q.quotation_number, status: q.status }
                        if (q.deal_id) {
                            const { data: deal } = await supabase.from('deals').select('id, title, status').eq('id', q.deal_id).single()
                            if (deal) result.deal = deal
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error fetching lineage:', err)
    }

    return result
}
