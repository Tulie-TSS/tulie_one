import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// DELETE /api/contracts/[id]/documents/[docId]
// Permanently delete a generated document from the bundle
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    try {
        const { id, docId } = await params
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('generated_documents')
            .delete()
            .eq('id', docId)
            .eq('contract_id', id) // Safety: ensure doc belongs to this contract

        if (error) {
            console.error('Error deleting document:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Error in DELETE document:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}

