import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { generateDocument, getDocumentTemplates } from '@/lib/supabase/services/document-template-service'

/**
 * GET /api/contracts/[id]/preview?type=contract
 * Returns HTML document directly — opens with a real URL in the browser
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: paramId } = await params
        const isToken = paramId.length > 36

        if (!isToken) {
            const authResult = await requireAuth()
            if (isAuthError(authResult)) return authResult
        }

        const url = new URL(request.url)
        const type = url.searchParams.get('type') || 'contract'
        const milestoneIndex = url.searchParams.get('milestone')

        // Find template
        const templates = await getDocumentTemplates()
        const template = templates.find(t => t.type === type)
        if (!template) {
            return new Response('Template not found', { status: 404 })
        }

        // Get contract
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminSupabase = createAdminClient()
        const { data: contract, error } = await adminSupabase
            .from('contracts')
            .select('id, customer_id')
            .eq(isToken ? 'public_token' : 'id', paramId)
            .single()

        if (error || !contract) {
            return new Response('Contract not found', { status: 404 })
        }
        
        const contractId = contract.id

        const additionalVariables: Record<string, string> = {}
        if (milestoneIndex) {
            additionalVariables.milestone_index = milestoneIndex
        }

        // Generate document
        const result = await generateDocument(
            template.id,
            contract.customer_id,
            contractId,
            additionalVariables
        )

        let html = result.content || ''
        html = html
            .replace(/style="width:30px;/gi, 'style="width:50px;')
            .replace(/style="width:55px;/gi, 'style="width:50px;')
            .replace(/width="30"/gi, 'width="50"')
            .replace(/width="55"/gi, 'width="50"')
        const DOCUMENT_LABELS: Record<string, string> = {
            contract: 'Hợp đồng dịch vụ',
            freelance_contract: 'Hợp đồng Cộng tác viên',
            order: 'Đơn đặt hàng',
            payment_request: 'Đề nghị thanh toán',
            delivery_minutes: 'Biên bản giao nhận',
            quotation: 'Báo giá',
        }
        const title = DOCUMENT_LABELS[type] || 'Document'

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${result.variables?.contract_number || contractId}</title>
    <style>
        @media print {
            @page { size: A4; margin: 15.24mm 15.24mm 16.256mm; }
            body { margin: 0; background: none; }
            body > div { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; border: none !important; }
        }
    </style>
</head>
<body>${html}</body>
</html>`

        return new Response(fullHtml, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error: any) {
        console.error('Error previewing document:', error)
        return new Response('Failed to generate document', { status: 500 })
    }
}
