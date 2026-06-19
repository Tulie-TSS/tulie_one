import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/quotations/[id]
 * Returns full quotation detail including items and customer.
 * Used by the template detail page to auto-populate contract variables.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id } = await params
        const supabase = createAdminClient()

        const { data, error } = await supabase
            .from('quotations')
            .select(`
                *,
                customer:customers!customer_id(
                    id, company_name, tax_code, email, phone, address,
                    invoice_address, representative, position, abbreviation
                ),
                items:quotation_items(*)
            `)
            .eq('id', id)
            .order('sort_order', { foreignTable: 'quotation_items', ascending: true })
            .single()

        if (error || !data) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
        }

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Error in GET /api/quotations/[id]:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
