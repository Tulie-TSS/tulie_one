import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/quotations?customer_id=...&status=...
 * Returns a list of quotations for dropdown selection in template pages.
 * Filtered by customer_id if provided.
 */
export async function GET(request: Request) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const url = new URL(request.url)
        const customerId = url.searchParams.get('customer_id')
        const status = url.searchParams.get('status') // e.g. 'accepted' for contract-ready quotes

        const supabase = createAdminClient()

        let query = supabase
            .from('quotations')
            .select('id, quotation_number, title, total_amount, status, customer_id, customer:customers(id, company_name), created_at')
            .order('created_at', { ascending: false })
            .limit(200)

        if (customerId) {
            query = query.eq('customer_id', customerId)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching quotations:', error)
            return NextResponse.json([], { status: 500 })
        }

        return NextResponse.json(data || [])
    } catch (error: any) {
        console.error('Error in GET /api/quotations:', error)
        return NextResponse.json([], { status: 500 })
    }
}
