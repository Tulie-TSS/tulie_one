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
            documentContent = documentContent
                .replace(
                    /<p[^>]*>\s*PHỤ LỤC SỐ 01\s*<\/p>\s*<p[^>]*>\s*VỀ (?:CHI TIẾT SẢN PHẨM, SỐ LƯỢNG, ĐƠN GIÁ VÀ THUẾ GTGT|PHẠM VI CÔNG VIỆC VÀ BẢNG GIÁ CHI TIẾT)\s*<\/p>/gi,
                    '<p style="text-align:center; font-weight:bold; font-size:13pt; margin: 0 0 6px 0;">Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai</p>'
                )
                .replace(
                    'BẢNG BÁO GIÁ CHI TIẾT',
                    'Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai'
                )
                .replace(
                    /\(Kèm theo Hợp đồng dịch vụ/gi,
                    '(Đính kèm hợp đồng dịch vụ'
                )

            // Existing stored documents remain printable with the current placement.
            documentContent = documentContent.replace(/<br><br>\s*<strong>Tổng giá trị thanh toán:<\/strong>[\s\S]*?Khoản 2\.2 dưới đây\./, '')
            if (!documentContent.includes('>2.2.3.</td>')) {
                documentContent = documentContent.replace(
                    /(<tr>\s*<td[^>]*>2\.3\.<\/td>)/,
                    `<tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tổng giá trị thanh toán:</strong><br>
        Tổng giá trị thanh toán Bên A phải thanh toán cho Bên B theo Hợp đồng là: <strong>${formattedAmount} VNĐ</strong><br>
        (Bằng chữ: <em>${readNumberToWords(totalAmount)}</em>). Giá trị này chưa bao gồm thuế GTGT nếu pháp luật hoặc cơ quan thuế có thẩm quyền xác định dịch vụ theo Hợp đồng phải chịu thuế GTGT; phần thuế phát sinh được xử lý theo Khoản 2.2 nêu trên.
      </td>
    </tr>
    $1`
                )
            }
            // Normalize width columns so section title numbers and clause numbers align at 50px
            documentContent = documentContent
                .replace(/style="width:30px;/gi, 'style="width:50px;')
                .replace(/style="width:55px;/gi, 'style="width:50px;')
                .replace(/width="30"/gi, 'width="50"')
                .replace(/width="55"/gi, 'width="50"')

            // Convert legacy 4.1 embedded sub-items into separate table rows
            documentContent = documentContent.replace(
                /<tr>\s*<td[^>]*>\s*4\.1\.\s*<\/td>\s*<td[^>]*>\s*<strong>\s*Quyền của Bên B:\s*<\/strong><br>\s*4\.1\.1\.\s*([\s\S]*?)<\/td>\s*<\/tr>/gi,
                `<tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">4.1.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Quyền của Bên B:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Nhận đầy đủ và đúng hạn các khoản thanh toán theo Điều 2.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên A cung cấp kịp thời, đầy đủ thông tin, nội dung, tài liệu cần thiết để thực hiện hợp đồng.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Từ chối các yêu cầu thay đổi, bổ sung tính năng, nội dung, phạm vi công việc nằm ngoài Hợp đồng và Phụ lục, trừ khi hai bên có thỏa thuận phát sinh bằng văn bản.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tạm dừng thực hiện dịch vụ trong trường hợp Bên A chậm thanh toán, không phối hợp hoặc vi phạm nghĩa vụ theo Hợp đồng, sau khi đã thông báo bằng văn bản cho Bên A.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.1.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Tạm hoãn bàn giao mã nguồn, tài khoản quản trị đầy đủ hoặc các quyền truy cập kỹ thuật khác nếu Bên A chưa thanh toán đủ các khoản đến hạn.</td>
    </tr>`
            )

            // Convert legacy 4.2 embedded sub-items into separate table rows
            documentContent = documentContent.replace(
                /<tr>\s*<td[^>]*>\s*4\.2\.\s*<\/td>\s*<td[^>]*>\s*<strong>\s*Nghĩa vụ của Bên B:\s*<\/strong><br>\s*4\.2\.1\.\s*([\s\S]*?)<\/td>\s*<\/tr>/gi,
                `<tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">4.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Nghĩa vụ của Bên B:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thực hiện công việc theo đúng nội dung, phạm vi, chất lượng, tiến độ đã thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin, dữ liệu, tài khoản truy cập do Bên A cung cấp, trừ trường hợp phải cung cấp theo yêu cầu của cơ quan nhà nước có thẩm quyền.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phối hợp với Bên A trong quá trình nghiệm thu, bàn giao, đào tạo sử dụng Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">4.2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thông báo kịp thời cho Bên A về các sự cố, phát sinh, bất khả kháng ảnh hưởng đến tiến độ, chất lượng dịch vụ.</td>
    </tr>`
            )

            // Convert legacy 5.1 embedded sub-items into separate table rows
            documentContent = documentContent.replace(
                /<tr>\s*<td[^>]*>\s*5\.1\.\s*<\/td>\s*<td[^>]*>\s*<strong>\s*Quyền của Bên A:\s*<\/strong><br>\s*5\.1\.1\.\s*([\s\S]*?)<\/td>\s*<\/tr>/gi,
                `<tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">5.1.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Quyền của Bên A:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Yêu cầu Bên B cung cấp dịch vụ đúng chất lượng, tiến độ, phạm vi đã thỏa thuận.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Kiểm tra, giám sát tiến độ thực hiện; yêu cầu Bên B báo cáo tình hình triển khai khi cần thiết.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.1.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Đề nghị Bên B sửa lỗi, bảo hành theo Điều 3.</td>
    </tr>`
            )

            // Convert legacy 5.2 embedded sub-items into separate table rows
            documentContent = documentContent.replace(
                /<tr>\s*<td[^>]*>\s*5\.2\.\s*<\/td>\s*<td[^>]*>\s*<strong>\s*Nghĩa vụ của Bên A:\s*<\/strong><br>\s*5\.2\.1\.\s*([\s\S]*?)<\/td>\s*<\/tr>/gi,
                `<tr>
      <td style="width:50px; font-weight:bold; vertical-align:top; padding:2px 0;">5.2.</td>
      <td style="font-weight:bold; vertical-align:top; padding:2px 0;">Nghĩa vụ của Bên A:</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.1.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Thanh toán đầy đủ, đúng hạn cho Bên B theo Điều 2.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.2.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Cung cấp kịp thời, đầy đủ và đảm bảo tính hợp pháp của toàn bộ nội dung, dữ liệu, hình ảnh, tài liệu và yêu cầu chi tiết để lập trình Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Chịu trách nhiệm trước pháp luật về tính hợp pháp của toàn bộ nội dung, dữ liệu cung cấp cho Bên B để đưa lên Phần mềm.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.4.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Phối hợp nghiệm thu, ký biên bản nghiệm thu/bàn giao trong thời hạn quy định.</td>
    </tr>
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">5.2.5.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">Không tự ý can thiệp vào mã nguồn, cấu hình hệ thống khi chưa có sự đồng ý của Bên B trong thời gian bảo hành; nếu tự ý can thiệp dẫn đến lỗi, Bên B có quyền từ chối bảo hành miễn phí.</td>
    </tr>`
            )
        }

        const DOC_LABELS: Record<string, string> = {
            contract: 'Hợp đồng dịch vụ',
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
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error: any) {
        console.error('Error previewing document:', error)
        return new Response('Failed to load document', { status: 500 })
    }
}
