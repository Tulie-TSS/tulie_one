import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAuth } from '@/lib/supabase/auth'
import { z } from 'zod'
import crypto from 'crypto'

const milestoneSchema = z.object({
    label: z.string().max(200),
    amount: z.number().min(0),
    due_date: z.string().optional(),
})

const ctvContractSchema = z.object({
    title: z.string().min(2).max(500),
    total_amount: z.number().min(0),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    terms: z.string().max(5000).optional(),
    product_name_in_contract: z.string().max(300).optional(),
    freelancer_metadata: z.object({
        project_name: z.string().max(500).optional(),
        deposit_percent: z.number().min(0).max(100).optional(),
        cancel_penalty_percent: z.number().min(0).max(100).optional(),
        notice_days: z.number().min(0).max(365).optional(),
    }).optional(),
    milestones: z.array(milestoneSchema).optional(),
})

/**
 * POST /api/contracts/ctv
 * Create a new freelancer contract without requiring customer_id.
 * Auto-generates public_token for CTV self-service portal.
 */
export async function POST(request: NextRequest) {
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult

    try {
        const body = await request.json()
        const parsed = ctvContractSchema.safeParse(body)
        if (!parsed.success) {
            const firstError = parsed.error.issues[0]
            return NextResponse.json({ error: firstError?.message || 'Dữ liệu không hợp lệ' }, { status: 400 })
        }

        const data = parsed.data
        const supabase = createAdminClient()

        // Auto-generate contract number: CTV-YYYYMMDD-XXXX
        const today = new Date()
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
        const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
        const contractNumber = `CTV-${dateStr}-${suffix}`

        // Generate unique public token for CTV self-service portal
        const publicToken = crypto.randomBytes(32).toString('hex')

        const { data: contract, error } = await supabase
            .from('contracts')
            .insert({
                contract_number: contractNumber,
                title: data.title,
                total_amount: data.total_amount,
                start_date: data.start_date || null,
                end_date: data.end_date || null,
                terms: data.terms || null,
                product_name_in_contract: data.product_name_in_contract || null,
                status: 'draft',
                type: 'contract',
                category: 'freelancer',
                brand: 'TMM',
                public_token: publicToken,
                freelancer_metadata: data.freelancer_metadata || {},
                // No customer_id, quotation_id required for CTV contracts
            })
            .select('id, contract_number, public_token')
            .single()

        if (error) {
            console.error('[CTV Contract] Insert error:', error)
            return NextResponse.json({ error: 'Không thể tạo hợp đồng' }, { status: 500 })
        }

        // Insert milestones if provided
        if (data.milestones && data.milestones.length > 0 && contract) {
            const milestoneRows = data.milestones
                .filter(m => m.label || m.amount > 0)
                .map((m, i) => ({
                    contract_id: contract.id,
                    label: m.label || `Đợt ${i + 1}`,
                    amount: m.amount,
                    due_date: m.due_date || null,
                    status: 'pending',
                    order: i,
                }))

            if (milestoneRows.length > 0) {
                await supabase.from('contract_milestones').insert(milestoneRows)
            }
        }

        return NextResponse.json({
            id: contract.id,
            contract_number: contract.contract_number,
            public_token: contract.public_token,
            ctv_portal_url: `/ctv/${contract.public_token}`,
        }, { status: 201 })

    } catch (err) {
        console.error('[CTV Contract] Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
