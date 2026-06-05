import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// DELETE /api/contracts/[id]/documents/[docId]
// Permanently delete a generated document from the bundle
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; docId: string } }
) {
    try {
        const supabase = createAdminClient()

        const { error } = await supabase
            .from('generated_documents')
            .delete()
            .eq('id', params.docId)
            .eq('contract_id', params.id) // Safety: ensure doc belongs to this contract

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
