import { requireAuth, isAuthError } from '@/lib/security/auth-guard'
import { generateDocument, getDocumentTemplates } from '@/lib/supabase/services/document-template-service'
import { cleanContractSummaryTableBorders } from '@/lib/utils/contract-html-cleaner'
import { readNumberToWords } from '@/lib/utils/format'

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

        // Get contract and customer first
        const { createAdminClient } = await import('@/lib/supabase/admin')
        const adminSupabase = createAdminClient()
        const { data: contract, error } = await adminSupabase
            .from('contracts')
            .select('*, customer:customers(*)')
            .eq(isToken ? 'public_token' : 'id', paramId)
            .single()

        if (error || !contract) {
            return new Response('Contract not found', { status: 404 })
        }
        
        const contractId = contract.id

        // Find template dynamically based on customer and contract type
        const templates = await getDocumentTemplates()
        let template = templates.find(t => t.type === type)

        const companyName = (contract.customer?.company_name || contract.customer?.name || '').toLowerCase()
        const isSchool = contract.contract_template === 'school' || 
                         companyName.includes('mầm non') || 
                         companyName.includes('tiểu học') || 
                         companyName.includes('thcs') || 
                         companyName.includes('thpt') || 
                         companyName.includes('đại học') || 
                         companyName.includes('cao đẳng') || 
                         companyName.includes('maple bear')

        if (type === 'contract') {
            const targetName = isSchool
                ? 'Hợp đồng dịch vụ trường học / giáo dục (Mẫu chuẩn)'
                : contract.contract_template === 'design'
                ? 'Hợp đồng thiết kế & in ấn (Mẫu chuẩn)'
                : 'Hợp đồng dịch vụ (Mẫu chuẩn)'
            const specificTemplate = templates.find(t => t.name === targetName)
            if (specificTemplate) {
                template = specificTemplate
            }
        }

        if (!template) {
            return new Response('Template not found', { status: 404 })
        }

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
            .replace(
                /<p[^>]*>\s*2\.\s*Kết quả kiểm thử[\s\S]*?<\/table>/gi,
                `<p style="margin:10px 0; font-weight:bold;">2. Kết quả kiểm thử và nghiệm thu kỹ thuật:</p>
  <table style="width:100%; border-collapse:collapse; margin-bottom: 12px; font-size:9.5pt;">
    <tr>
      <td style="width:230px; padding:4px 0; font-weight:bold; vertical-align:middle;">- Thiết kế & Giao diện (UI/UX):</td>
      <td style="width:270px; padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1;">☑</span> Đạt yêu cầu kỹ thuật & Responsive</td>
      <td style="padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1; color:#555;">☐</span> Chưa đạt</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0; vertical-align:middle;">- Chức năng hệ thống (Feature):</td>
      <td style="width:270px; padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1;">☑</span> Đạt yêu cầu vận hành theo hợp đồng</td>
      <td style="padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1; color:#555;">☐</span> Chưa đạt</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0; vertical-align:middle;">- Quản trị nội dung (CMS/Backend):</td>
      <td style="width:270px; padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1;">☑</span> Đạt yêu cầu cập nhật & Phân quyền</td>
      <td style="padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1; color:#555;">☐</span> Chưa đạt</td>
    </tr>
    <tr>
      <td style="font-weight:bold; padding:4px 0; vertical-align:middle;">- Tối ưu SEO & Tốc độ tải trang:</td>
      <td style="width:270px; padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1;">☑</span> Đạt chỉ số cam kết (Lighthouse)</td>
      <td style="padding:4px 0; vertical-align:middle;"><span style="font-size:11pt; line-height:1; color:#555;">☐</span> Chưa đạt</td>
    </tr>
  </table>`
            )
            .replace(/<p[^>]*>\s*\*?\s*Ghi chú các lỗi\/chỉnh sửa nhỏ[\s\S]*?<\/p>/gi, '')
            .replace(/\s*\(trừ các lỗi nhỏ được ghi nhận tại mục 2 nêu trên nếu có\)/gi, '')
            .replace(/<table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt;"/gi, '<table style="width:100%; border-collapse:collapse; margin-bottom:14px; font-size:10pt; text-align:left;"')
            .replace(/<colgroup><col style="width:(?:160|170|210)px"><col style="width:(?:auto|220px)">/gi, '<colgroup><col style="width:170px"><col style="width:220px">')
            .replace(/<td style="vertical-align:top; white-space:nowrap;">(Chức vụ:)<\/td>/gi, '<td style="vertical-align:top; white-space:nowrap; padding-left:15px;">$1</td>')
            .replace(/<td style="vertical-align:top;">(Di động:|Email:|tại)<\/td>/gi, '<td style="vertical-align:top; padding-left:15px;">$1</td>')
            .replace(/<col style="width:80px">/gi, '<col style="width:70px">')
            .replace(/Đại diện pháp luật:/g, 'Người đại diện pháp luật:')
            .replace(
                /Hôm nay, (?:ngày [^,]+, )?tại (?:văn phòng giao dịch của các bên|văn phòng khách hàng|văn phòng của Bên A|văn phòng của|trụ sở của|trụ sở)(?:\s*\([^)]+\))?, chúng tôi gồm(?: có)?:/gi,
                (match: string) => {
                    const datePrefixMatch = match.match(/Hôm nay, (ngày [^,]+, )?/i)
                    const datePrefix = datePrefixMatch ? datePrefixMatch[0] : 'Hôm nay, '
                    const compStr = contract.customer?.company_name || contract.customer?.name || ''
                    return `${datePrefix}tại trụ sở ${compStr || 'Bên A'}, chúng tôi gồm:`
                }
            )
            .replace(/Tổng cộng thanh toán\s*\([^)]*\)/gi, 'Tổng cộng thanh toán')
            .replace(
                /<tr><td style="vertical-align:top;">(Người đại diện pháp luật:|Đại diện pháp luật:)<\/td><td style="font-weight:bold; vertical-align:top;">/g,
                '<tr><td style="vertical-align:top; white-space:nowrap;">Người đại diện pháp luật:</td><td style="font-weight:bold; vertical-align:top; white-space:nowrap;">'
            )
            .replace(
                /\(tương đương:\s*<strong>([\s\S]*?)<\/strong>\)(?!\s*—\s*Bằng chữ:)/gi,
                (match: string, numText: string) => {
                    const cleanNum = parseFloat(numText.replace(/[^0-9]/g, ''))
                    if (!isNaN(cleanNum) && cleanNum > 0) {
                        const words = readNumberToWords(cleanNum)
                        return `(tương đương: <strong>${numText}</strong> — Bằng chữ: <em>${words}</em>)`
                    }
                    return match
                }
            )
            .replace(/(đồng\.\/\.)\s*(?:đồng\.\/\.|đồng)/gi, '$1')
            .replace(/style="width:30px;/gi, 'style="width:50px;')
            .replace(/style="width:55px;/gi, 'style="width:50px;')
            .replace(/width="30"/gi, 'width="50"')
            .replace(/width="55"/gi, 'width="50"')

        if (type === 'contract' && isSchool) {
            html = html.replace(
                /(Bên sử dụng dịch vụ \(Bên A\)<\/td>\s*<td[^>]*>\s*)(.*?)(<\/td>)/gi,
                (match: string, p1: string, companyText: string, p3: string) => {
                    if (!companyText.includes('Nhà trường')) {
                        const cleanText = companyText.replace(/<\/?strong>/g, '').trim()
                        return `${p1}<strong>${cleanText} (sau đây gọi tắt là &ldquo;Nhà trường&rdquo;)</strong>${p3}`
                    }
                    return match
                }
            )
            .replace(
                /7\.2\.1\.\s*[\s\S]*?<\/tr>/gi,
                '<tr><td style="width:50px; vertical-align:top; padding:2px 0;">7.2.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật thông tin và quyền riêng tư: Bên B cam kết bảo mật tuyệt đối thông tin và quyền riêng tư gồm dữ liệu Học sinh, Giáo viên, Phụ huynh và Nhà trường; triển khai biện pháp kỹ thuật chống tấn công mạng, bảo vệ hệ thống khỏi rò rỉ dữ liệu và thực hiện sao lưu dự phòng (backup) dữ liệu định kỳ đảm bảo an toàn dữ liệu. Bên A là Bên Kiểm soát dữ liệu cá nhân (Data Controller), Bên B là Bên Xử lý dữ liệu cá nhân (Data Processor).</td></tr>'
            )
            .replace(
                /7\.2\.2\.\s*[\s\S]*?<\/tr>/gi,
                '<tr><td style="width:50px; vertical-align:top; padding:2px 0;">7.2.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bảo mật mã nguồn và dữ liệu nhà trường: Không được chia sẻ, sao chép hoặc sử dụng dữ liệu của nhà trường vào bất kỳ mục đích nào khác nếu không có sự đồng ý của Bên A bằng văn bản. Dữ liệu của Nhà trường là tài sản sở hữu riêng tuyệt đối của Bên A.</td></tr>'
            )
        }

        if (type === 'contract') {
            html = html
                .replace(/<tr[^>]*>\s*<td[^>]*>\s*<strong>Tạm tính<\/strong>[\s\S]*?<\/tr>/gi, '')
                .replace(/<tr[^>]*>\s*<td[^>]*>\s*<strong>Tổng chiết khấu<\/strong>[\s\S]*?<\/tr>/gi, '')
                .replace(/<tr[^>]*>\s*<td[^>]*>\s*<strong>Chiết khấu tổng[\s\S]*?<\/tr>/gi, '')
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?CK\(%\)[\s\S]*?<\/th>/gi, '')
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?(Giảm giá|Discount)[\s\S]*?<\/th>/gi, '')
                .replace(/colspan="10"/gi, 'colspan="8"')
                .replace(/colspan="11"/gi, 'colspan="9"')
                .replace(
                    /<td([^>]*)>\s*[\d.]+\s*<\/td>\s*<td[^>]*>\s*(?:\d+%\s*|-)\s*<\/td>\s*<td[^>]*>\s*(?:[\d.]+\s*|-)\s*<\/td>\s*<td([^>]*)>\s*([\d.]+)\s*<\/td>/gi,
                    '<td$1>$3</td><td$2>$3</td>'
                )
        }

        html = cleanContractSummaryTableBorders(html)

        const DOCUMENT_LABELS: Record<string, string> = {
            contract: 'Hợp đồng dịch vụ',
            freelance_contract: 'Hợp đồng Cộng tác viên',
            order: 'Đơn đặt hàng',
            payment_request: 'Đề nghị thanh toán',
            delivery_minutes: 'Biên bản nghiệm thu',
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
