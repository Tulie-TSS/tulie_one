import { requirePermission, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { readNumberToWords } from '@/lib/utils/format'

/**
 * GET /api/contracts/[id]/documents/[docId]/preview
 * Returns the stored HTML content of a specific generated document
 * Requires 'view' permission on contracts
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    try {
        const authResult = await requirePermission('contracts', 'view')
        if (isAuthError(authResult)) return authResult

        const { id: contractId, docId } = await params
        const supabase = createAdminClient()

        const { data: doc, error } = await supabase
            .from('contract_documents')
            .select('*')
            .eq('id', docId)
            .eq('contract_id', contractId)
            .single()

        if (error || !doc) {
            return new Response('Document not found', { status: 404 })
        }

        let documentContent = doc.content || ''
        if (doc.type === 'contract') {
            const { data: contract } = await supabase
                .from('contracts')
                .select('total_amount')
                .eq('id', contractId)
                .single()
            const totalAmount = contract?.total_amount || 0
            const formattedAmount = new Intl.NumberFormat('vi-VN').format(totalAmount)

            // Render legacy stored documents with the current unified appendix title.
            documentContent = documentContent.replace(
                'BẢNG BÁO GIÁ CHI TIẾT',
                'VỀ PHẠM VI CÔNG VIỆC, SẢN PHẨM BÀN GIAO, BẢNG GIÁ VÀ LỘ TRÌNH TRIỂN KHAI'
            )

            // Signed/draft documents generated before this clause are still printable
            // with the final payment obligation, without silently mutating the record.
            if (!documentContent.includes('Tổng giá trị thanh toán Bên A phải thanh toán')) {
                documentContent = documentContent.replace(
                    /Cơ cấu giá chi tiết theo Phụ lục\s*0?1\s*\.?/i,
                    `Cơ cấu giá chi tiết theo Phụ lục 01.<br><br>
        <strong>Tổng giá trị thanh toán:</strong><br>
        Tổng giá trị thanh toán Bên A phải thanh toán cho Bên B theo Hợp đồng là: <strong>${formattedAmount} VNĐ</strong><br>
        (Bằng chữ: <em>${readNumberToWords(totalAmount)}</em>). Giá trị này chưa bao gồm thuế GTGT nếu pháp luật hoặc cơ quan thuế có thẩm quyền xác định dịch vụ theo Hợp đồng phải chịu thuế GTGT; phần thuế phát sinh được xử lý theo Khoản 2.2 dưới đây.`
                )
            }
        }

        const DOC_LABELS: Record<string, string> = {
            contract: 'Hợp đồng kinh tế',
            freelance_contract: 'Hợp đồng Cộng tác viên',
            order: 'Đơn đặt hàng',
            payment_request: 'Đề nghị thanh toán',
            delivery_minutes: 'Biên bản giao nhận',
        }
        const title = DOC_LABELS[doc.type] || 'Document'

        const fullHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title} - ${doc.doc_number || contractId}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        body, table, tr, td, th, div, p, span, ul, li {
            font-family: Arial, "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Meiryo", "MS Gothic", sans-serif;
        }
        @media print {
            @page {
                size: A4;
                margin: 15.24mm 15.24mm 16.256mm;
                @bottom-right {
                    content: "Trang " counter(page) " / " counter(pages);
                    font-family: Arial, sans-serif;
                    font-size: 10pt;
                }
            }
            body { margin: 0; background: none; }
            body > div { padding: 0 !important; margin: 0 !important; max-width: none !important; box-shadow: none !important; border: none !important; }
        }
    </style>
</head>
<body>
    ${documentContent}
</body>
</html>`

        return new Response(fullHtml, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
    } catch (error: any) {
        console.error('Error previewing document:', error)
        return new Response('Failed to load document', { status: 500 })
    }
}
