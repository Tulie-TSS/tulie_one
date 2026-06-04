import { NextResponse } from 'next/server'
import { requirePermission, isAuthError } from '@/lib/security/auth-guard'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string, docId: string }> }
) {
    try {
        const authResult = await requirePermission('contracts', 'edit')
        if (isAuthError(authResult)) return authResult

        const { id, docId } = await params

        const { createAdminClient } = await import('@/lib/supabase/admin')
        const supabase = createAdminClient()

        // Get current status and type
        const { data: doc, error: fetchErr } = await supabase
            .from('contract_documents')
            .select('status, type')
            .eq('id', docId)
            .eq('contract_id', id)
            .single()

        if (fetchErr || !doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        const newStatus = doc.status === 'signed' ? 'draft' : 'signed'

        const { error } = await supabase
            .from('contract_documents')
            .update({ status: newStatus })
            .eq('id', docId)
            .eq('contract_id', id)

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Auto-transition contract status to 'active' when core document is marked as signed
        if (newStatus === 'signed' && ['contract', 'freelance_contract', 'order'].includes(doc.type)) {
            const { data: currentContract } = await supabase
                .from('contracts')
                .select('status, signed_date')
                .eq('id', id)
                .single()

            if (currentContract) {
                const updates: any = {}
                if (['draft', 'sent', 'viewed'].includes(currentContract.status)) {
                    updates.status = 'active'
                }
                if (!currentContract.signed_date) {
                    updates.signed_date = new Date().toISOString().split('T')[0]
                }
                if (Object.keys(updates).length > 0) {
                    await supabase
                        .from('contracts')
                        .update(updates)
                        .eq('id', id)
                }
            }
        }

        return NextResponse.json({ success: true, status: newStatus })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
