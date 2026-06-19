import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { convertQuotationToOrder } from '@/lib/supabase/services/contract-service'

/**
 * POST /api/quotations/[id]/convert-contract
 * Converts an accepted quotation into a formal contract.
 * Returns { success, id } where id is the new contract's ID.
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await requireAuth()
        if (isAuthError(authResult)) return authResult

        const { id: quotationId } = await params

        const result = await convertQuotationToOrder(quotationId, 'contract')

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || 'Không thể tạo hợp đồng' },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true, id: result.id })
    } catch (error: any) {
        console.error('Error in POST /api/quotations/[id]/convert-contract:', error)
        return NextResponse.json(
            { error: error.message || 'Lỗi hệ thống' },
            { status: 500 }
        )
    }
}
