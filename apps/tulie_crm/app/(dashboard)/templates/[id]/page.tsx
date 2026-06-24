'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui'
import { Button } from '@repo/ui'
import { Input } from '@repo/ui'
import { Label } from '@repo/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui'
import { Badge } from '@repo/ui'
import { Separator } from '@repo/ui'
import { ArrowLeft, FileText, Download, FilePlus2, Loader2, Eye, EyeOff, Send } from 'lucide-react'
import { LoadingSpinner } from '@repo/ui'
import Link from 'next/link'
import { toast } from 'sonner'

interface Template {
    id: string
    name: string
    type: string
    content: string
    variables: string[]
}

interface Customer {
    id: string
    company_name: string
    address?: string
    tax_code?: string
    email?: string
    phone?: string
    representative?: string
    position?: string
}

interface QuotationSummary {
    id: string
    quotation_number: string
    title: string
    total_amount: number
    status: string
    customer_id: string
}

interface QuotationItem {
    id: string
    product_name: string
    description?: string
    quantity: number
    unit?: string
    unit_price: number
    discount?: number
    vat_percent?: number
    total_price?: number
    sort_order?: number
    section_name?: string
    is_optional?: boolean
}

interface QuotationDetail {
    id: string
    quotation_number: string
    title: string
    type?: string
    total_amount: number
    subtotal?: number
    vat_percent?: number
    vat_amount?: number
    discount_amount?: number
    discount_percent?: number
    terms?: string
    notes?: string
    status: string
    customer_id: string
    vat_exempt_status?: string
    customer?: Customer
    items?: QuotationItem[]
    proposal_content?: Record<string, string>
}

// ─── Vietnamese number to words ────────────────────────────────────────────────
function readNumberToWords(num: number): string {
    if (num === 0) return 'Không đồng'
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
    const teens = ['mười', 'mười một', 'mười hai', 'mười ba', 'mười bốn', 'mười lăm', 'mười sáu', 'mười bảy', 'mười tám', 'mười chín']
    const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi']

    function readHundreds(n: number): string {
        if (n === 0) return ''
        const h = Math.floor(n / 100)
        const t = Math.floor((n % 100) / 10)
        const u = n % 10
        let result = h > 0 ? units[h] + ' trăm' : ''
        if (t === 1) {
            result += (result ? ' ' : '') + teens[u]
        } else if (t > 1) {
            result += (result ? ' ' : '') + tens[t]
            if (u > 0) result += ' ' + (u === 5 ? 'lăm' : units[u])
        } else if (u > 0 && h > 0) {
            result += ' linh ' + (u === 5 ? 'lăm' : units[u])
        } else if (u > 0) {
            result += units[u]
        }
        return result
    }

    const billions = Math.floor(num / 1_000_000_000)
    const millions = Math.floor((num % 1_000_000_000) / 1_000_000)
    const thousands = Math.floor((num % 1_000_000) / 1_000)
    const remainder = num % 1_000

    let result = ''
    if (billions > 0) result += readHundreds(billions) + ' tỷ'
    if (millions > 0) result += (result ? ' ' : '') + readHundreds(millions) + ' triệu'
    if (thousands > 0) result += (result ? ' ' : '') + readHundreds(thousands) + ' nghìn'
    if (remainder > 0) result += (result ? ' ' : '') + readHundreds(remainder)

    return result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
}

// ─── Build contract_items_table HTML from quotation items ───────────────────
function buildItemsTableHtml(items: QuotationItem[], vatExempt: boolean, quoteVatPercent: number = 0, overallDiscountAmount: number = 0, overallDiscountPercent: number = 0): {
    contractItemsTable: string
    grossTotal: string
    totalDiscount: string
    subtotal: string
    vatAmount: string
    totalAmount: string
    totalAmountRaw: number
    hasVat: boolean
    hasDiscount: boolean
    discountRowHtml: string
    vatBreakdownHtml: string
    totalColumns: number
} {
    const validItems = items.filter(i => !i.is_optional)

    const hasDiscount = validItems.some(i => (i.discount || 0) > 0)
    const hasVat = !vatExempt && validItems.some(i => {
        const vr = i.vat_percent !== undefined && i.vat_percent !== null ? i.vat_percent : quoteVatPercent
        return vr > 0
    })

    let totalColumns = 11
    if (!hasDiscount) totalColumns -= 2
    if (!hasVat) totalColumns -= 2

    let grossTotal = 0
    let totalDiscountAmt = 0
    let totalVat = 0
    let totalAfterVat = 0
    let rowsHtml = ''

    // Group by section_name
    const sections: Record<string, QuotationItem[]> = {}
    validItems.forEach(item => {
        const sec = item.section_name || ''
        if (!sections[sec]) sections[sec] = []
        sections[sec].push(item)
    })
    const sectionEntries = Object.entries(sections).sort((a, b) => {
        if (a[0] === '') return 1
        if (b[0] === '') return -1
        return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0)
    })

    // For VAT breakdown
    const vatGroupsMap: Record<number, number> = {}

    sectionEntries.forEach(([sectionName, sectionItems], sIdx) => {
        if (sectionName) {
            rowsHtml += `<tr style="background:#f0f0f0;">
                <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns}"><strong>${sectionName}</strong></td>
            </tr>`
        }
        sectionItems.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        sectionItems.forEach((item, iIdx) => {
            const qty = item.quantity || 1
            const unitPrice = item.unit_price || 0
            const itemGross = qty * unitPrice
            const discountPct = item.discount || 0
            const discountAmount = Math.round(itemGross * discountPct / 100)
            const afterDiscount = itemGross - discountAmount
            const itemVatRate = vatExempt ? 0 : (item.vat_percent !== undefined && item.vat_percent !== null ? item.vat_percent : quoteVatPercent)
            const itemVat = Math.round(afterDiscount * itemVatRate / 100)
            const afterVat = afterDiscount + itemVat

            grossTotal += itemGross
            totalDiscountAmt += discountAmount
            totalVat += itemVat
            totalAfterVat += afterVat

            // Accumulate VAT by rate
            if (!vatGroupsMap[itemVatRate]) vatGroupsMap[itemVatRate] = 0
            vatGroupsMap[itemVatRate] += itemVat

            const rawDesc = item.description || ''
            let descHtml = ''
            if (rawDesc) {
                const lines = rawDesc.split(/\n/).filter((l: string) => l.trim())
                const linesDivs = lines.map((line: string) => `<div style="margin-top:3px;">${line.trim()}</div>`).join('')
                descHtml = `<div style="font-size:7.5pt; color:#555; font-style:italic; line-height:1.4; margin-top:4px; padding-top:3px; border-top:1px dashed #ddd;">${linesDivs}</div>`
            }

            const itemNum = sectionName ? `${sIdx + 1}.${iIdx + 1}` : `${iIdx + 1}`

            let rowHtml = `<tr>
                <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${itemNum}</td>
                <td style="border:1px solid #000; padding:4px; vertical-align:top;"><strong>${item.product_name}</strong>${descHtml}</td>
                <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${item.unit || 'Gói'}</td>
                <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${qty}</td>
                <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(unitPrice)}</td>`

            if (hasDiscount) {
                rowHtml += `
                <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${discountPct > 0 ? discountPct + '%' : '-'}</td>
                <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${discountAmount > 0 ? new Intl.NumberFormat('vi-VN').format(discountAmount) : '-'}</td>`
            }

            rowHtml += `
                <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(afterDiscount)}</td>`

            if (hasVat) {
                rowHtml += `
                <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${vatExempt ? 'KCT' : (itemVatRate > 0 ? itemVatRate + '%' : '0%')}</td>
                <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${itemVat > 0 ? new Intl.NumberFormat('vi-VN').format(itemVat) : '0'}</td>`
            }

            rowHtml += `
                <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(afterVat)}</td>
            </tr>`

            rowsHtml += rowHtml
        })
    })

    // Build discount_row_html (overall quotation discount, not per-item)
    let discountRowHtml = ''
    if (overallDiscountAmount > 0) {
        const pctStr = overallDiscountPercent > 0 ? ` (${overallDiscountPercent}%)` : ''
        discountRowHtml = `<tr>
            <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Chiết khấu tổng${pctStr}</strong></td>
            <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold;">-${new Intl.NumberFormat('vi-VN').format(overallDiscountAmount)}</td>
        </tr>`
    }

    // Build vat_breakdown_html
    let vatBreakdownHtml = ''
    if (vatExempt) {
        vatBreakdownHtml = `<tr style="background:#f5f5f5;">
            <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Thuế suất GTGT (VAT):</strong></td>
            <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">Không chịu thuế</td>
        </tr>`
    } else if (hasVat) {
        Object.entries(vatGroupsMap).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([rate, amt]) => {
            vatBreakdownHtml += `<tr style="background:#f5f5f5;">
                <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Tổng thuế suất GTGT (VAT) ${rate}%:</strong></td>
                <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(amt as number)}</td>
            </tr>`
        })
    }

    const subtotalAfterItemDiscount = grossTotal - totalDiscountAmt
    const finalTotal = totalAfterVat - overallDiscountAmount

    return {
        contractItemsTable: rowsHtml,
        grossTotal: new Intl.NumberFormat('vi-VN').format(grossTotal),
        totalDiscount: new Intl.NumberFormat('vi-VN').format(totalDiscountAmt + overallDiscountAmount),
        subtotal: new Intl.NumberFormat('vi-VN').format(subtotalAfterItemDiscount),
        vatAmount: new Intl.NumberFormat('vi-VN').format(totalVat),
        totalAmount: new Intl.NumberFormat('vi-VN').format(finalTotal),
        totalAmountRaw: finalTotal,
        hasVat,
        hasDiscount,
        discountRowHtml,
        vatBreakdownHtml,
        totalColumns,
    }
}

// ─── Status badge colors ─────────────────────────────────────────────────────
const quotationStatusLabel: Record<string, { label: string; color: string }> = {
    draft: { label: 'Nháp', color: 'bg-slate-100 text-slate-700' },
    sent: { label: 'Đã gửi', color: 'bg-blue-100 text-blue-700' },
    viewed: { label: 'Đã xem', color: 'bg-purple-100 text-purple-700' },
    accepted: { label: 'Chấp nhận', color: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
    expired: { label: 'Hết hạn', color: 'bg-orange-100 text-orange-700' },
    converted: { label: 'Đã chuyển HĐ', color: 'bg-gray-100 text-gray-500' },
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function TemplateDetailPage() {
    const params = useParams()
    const router = useRouter()
    const templateId = params.id as string

    const [template, setTemplate] = useState<Template | null>(null)
    const [variables, setVariables] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [customers, setCustomers] = useState<Customer[]>([])
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

    // Quotation state
    const [quotations, setQuotations] = useState<QuotationSummary[]>([])
    const [selectedQuotationId, setSelectedQuotationId] = useState<string>('')
    const [isFetchingQuotation, setIsFetchingQuotation] = useState(false)

    // Contract creation state
    const [isCreatingContract, setIsCreatingContract] = useState(false)

    // ── Clean mode: biến chưa điền sẽ để trống (cho xuất PDF gửi khách) ────
    const [cleanMode, setCleanMode] = useState(false)

    // ── Load template + customers + all quotations ──────────────────────────
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const [templateRes, custRes, quoteRes] = await Promise.all([
                    fetch(`/api/templates/${templateId}`),
                    fetch('/api/customers'),
                    fetch('/api/quotations'),
                ])

                if (templateRes.ok) {
                    const tmpl = await templateRes.json()
                    setTemplate(tmpl)
                    const initialVars: Record<string, string> = {}
                    tmpl.variables.forEach((v: string) => { initialVars[v] = '' })
                    const now = new Date()
                    initialVars['day'] = now.getDate().toString().padStart(2, '0')
                    initialVars['month'] = (now.getMonth() + 1).toString().padStart(2, '0')
                    initialVars['year'] = now.getFullYear().toString()
                    setVariables(initialVars)
                }

                if (custRes.ok) {
                    const custData = await custRes.json()
                    setCustomers(Array.isArray(custData) ? custData : custData.customers || [])
                }

                if (quoteRes.ok) {
                    const quoteData = await quoteRes.json()
                    setQuotations(Array.isArray(quoteData) ? quoteData : [])
                }
            } catch (err) {
                console.error('Error loading template:', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [templateId])

    // ── Filter quotations when customer changes ─────────────────────────────
    const filteredQuotations = useMemo(() => {
        if (!selectedCustomerId) return quotations
        return quotations.filter(q => q.customer_id === selectedCustomerId)
    }, [quotations, selectedCustomerId])

    // ── Customer selection ──────────────────────────────────────────────────
    const handleCustomerSelect = (customerId: string) => {
        setSelectedCustomerId(customerId)
        setSelectedQuotationId('') // reset quotation when customer changes
        const customer = customers.find(c => c.id === customerId)
        if (customer) {
            setVariables(prev => ({
                ...prev,
                customer_company: customer.company_name || '',
                customer_address: customer.address || '',
                customer_tax_code: customer.tax_code || '',
                customer_email: customer.email || '',
                customer_phone: customer.phone || '',
                customer_representative: customer.representative || '',
                customer_position: customer.position || '',
                customer_mobile: customer.phone || '',
            }))
        }
    }

    // ── Quotation selection → auto-fill variables ───────────────────────────
    const handleQuotationSelect = async (quotationId: string) => {
        setSelectedQuotationId(quotationId)
        if (!quotationId) return

        setIsFetchingQuotation(true)
        try {
            const res = await fetch(`/api/quotations/${quotationId}`)
            if (!res.ok) return
            const q: QuotationDetail = await res.json()

            const isExempt = q.vat_exempt_status === 'exempt'
            const quoteVatPercent = q.vat_percent || 0
            const overallDiscountAmount = q.discount_amount || 0
            const overallDiscountPercent = 0 // not stored per-quotation in this context
            const items = q.items || []

            const {
                contractItemsTable, grossTotal, totalDiscount, subtotal, vatAmount,
                totalAmount, totalAmountRaw, discountRowHtml, vatBreakdownHtml,
            } = buildItemsTableHtml(items, isExempt, quoteVatPercent, overallDiscountAmount, overallDiscountPercent)

            const totalNum = q.total_amount || totalAmountRaw || 0
            const vatRate = isExempt ? 'Không chịu thuế' : (quoteVatPercent > 0 ? `${quoteVatPercent}%` : '0%')

            // Auto-fill customer info if not already selected
            const cust = q.customer
            const customerUpdates: Record<string, string> = {}
            if (cust && !selectedCustomerId) {
                setSelectedCustomerId(cust.id)
                customerUpdates.customer_company = cust.company_name || ''
                customerUpdates.customer_address = cust.address || ''
                customerUpdates.customer_tax_code = cust.tax_code || ''
                customerUpdates.customer_email = cust.email || ''
                customerUpdates.customer_phone = cust.phone || ''
                customerUpdates.customer_representative = cust.representative || ''
                customerUpdates.customer_position = cust.position || ''
                customerUpdates.customer_mobile = cust.phone || ''
            }

            // Proposal content is merged into the single contractual Appendix 01.
            let proposalAppendixHtml = ''
            if ((q as any).type === 'proposal' && q.proposal_content) {
                const pc = q.proposal_content as Record<string, string>
                const sections: { label: string; content: string }[] = []
                if (pc.introduction) sections.push({ label: 'Mục tiêu & Giới thiệu', content: pc.introduction })
                if (pc.scope_of_work) sections.push({ label: 'Phạm vi công việc (Scope of Work)', content: pc.scope_of_work })
                if (pc.methodology) sections.push({ label: 'Phương pháp & Cách tiếp cận', content: pc.methodology })
                if (pc.deliverables) sections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: pc.deliverables })
                if (pc.team) sections.push({ label: 'Đội ngũ chuyên trách', content: pc.team })
                if (pc.timeline) sections.push({ label: 'Lộ trình triển khai (Timeline)', content: pc.timeline })
                if (pc.warranty) sections.push({ label: 'Bảo hành & Hỗ trợ', content: pc.warranty })
                if (pc.why_us) sections.push({ label: 'Vì sao chọn chúng tôi?', content: pc.why_us })
                if (pc.case_studies) sections.push({ label: 'Case Studies & Portfolio', content: pc.case_studies })
                if (pc.custom_sections) {
                    try {
                        const custom = typeof pc.custom_sections === 'string' ? JSON.parse(pc.custom_sections) : pc.custom_sections
                        if (Array.isArray(custom)) custom.forEach((s: any) => { if (s.title && s.content) sections.push({ label: s.title, content: s.content }) })
                    } catch { /* ignore */ }
                }
                if (sections.length > 0) {
                    proposalAppendixHtml = `<div style="page-break-before: always;"></div><p style="text-align:center; font-weight:bold; font-size:13pt; margin: 20px 0 10px 0;">Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá &amp; Lộ trình triển khai</p><p style="text-align:center; font-style:italic; margin-bottom:20px; font-size:9pt;">(Đính kèm {{contract_type}} số {{contract_number}} ngày {{day}}/{{month}}/{{year}})</p>`
                    sections.forEach((sec, idx) => {
                        const content = sec.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        proposalAppendixHtml += `<div style="margin-bottom:16px;"><p style="font-weight:bold; font-size:10pt; margin: 0 0 6px 0; border-bottom:1px solid #ddd; padding-bottom:4px;">${idx + 1}. ${sec.label}</p><div style="font-size:9.5pt; text-align:justify; line-height:1.6; padding-left:4px;">${content}</div></div>`
                    })
                }
            }

            setVariables(prev => ({
                ...prev,
                ...customerUpdates,
                contract_items_table: contractItemsTable,
                quotation_items_table: contractItemsTable,
                gross_total: grossTotal,
                total_discount: totalDiscount,
                subtotal,
                vat_rate: vatRate,
                vat_amount: vatAmount,
                vat_total: vatAmount,
                total_after_vat: totalAmount,
                total_amount_number: new Intl.NumberFormat('vi-VN').format(totalNum),
                amount_in_words: readNumberToWords(totalNum),
                payment_terms: (() => {
                    const pc = q.proposal_content || {}
                    if (pc.payment_milestones && Array.isArray(pc.payment_milestones) && pc.payment_milestones.length > 0) {
                        return pc.payment_milestones.map((m: any, idx: number) => {
                            const percentage = totalNum > 0 ? Math.round((m.amount / totalNum) * 100) : (m.percentage || 0)
                            const dueStr = m.due_date ? `(Hạn: ${m.due_date.split('T')[0].split('-').reverse().join('/')})` : ''
                            return `- Đợt ${idx + 1}: ${percentage}% giá trị Hợp đồng = ${new Intl.NumberFormat('vi-VN').format(m.amount)} VND — ${m.name} ${dueStr}`
                        }).join('<br/>')
                    }
                    return q.terms || prev.payment_terms || ''
                })(),
                delivery_time: q.proposal_content?.delivery_time || prev.delivery_time || '',
                warranty_clause_html: (() => {
                    const warrantyMonths = q.proposal_content?.warranty_months ? Number(q.proposal_content.warranty_months) : null
                    if (warrantyMonths && warrantyMonths > 0) {
                        const warrantyMonthsText = warrantyMonths === 6 ? 'sáu' : warrantyMonths === 12 ? 'mười hai' : warrantyMonths === 24 ? 'hai mươi tư' : warrantyMonths
                        return `
  <table style="width:100%; border-collapse:collapse; margin-top: 10px;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.6.</td>
      <td style="vertical-align:top; padding:2px 0; font-weight:bold;">Bảo hành và Hỗ trợ kỹ thuật:</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cam kết bảo hành kỹ thuật cho website trong thời gian <strong>${warrantyMonths} (${warrantyMonthsText}) tháng</strong> kể từ ngày hai bên ký kết Biên bản Nghiệm thu và Bàn giao website.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong thời gian bảo hành, Bên B có trách nhiệm sửa chữa miễn phí các lỗi kỹ thuật phát sinh từ quá trình xây dựng và lập trình website do Bên B thực hiện, bao gồm: lỗi hiển thị, lỗi chức năng, lỗi bảo mật cơ bản và các sự cố kỹ thuật khác thuộc phạm vi công việc quy định tại hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Phạm vi bảo hành không bao gồm: các thay đổi nội dung do Bên A tự chỉnh sửa gây lỗi; các yêu cầu thay đổi, bổ sung tính năng mới ngoài phạm vi ban đầu; lỗi phát sinh từ môi trường hosting, tên miền hoặc các dịch vụ bên thứ ba do Bên A tự quản lý.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên A thông báo sự cố qua email hoặc các kênh liên lạc được thống nhất. Bên B cam kết phản hồi và xử lý trong vòng 03 (ba) ngày làm việc kể từ khi nhận được thông báo hợp lệ.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.5.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Sau thời gian bảo hành, nếu Bên A có nhu cầu tiếp tục hỗ trợ kỹ thuật, hai bên sẽ thỏa thuận và ký kết hợp đồng bảo trì riêng theo thỏa thuận phát sinh.</td></tr>
  </table>`
                    }
                    return ''
                })(),
                contract_clause_count: 'mười bốn (14) điều',
                service_description: q.title || prev.service_description || '',
                order_number: q.quotation_number || '',
                discount_row_html: discountRowHtml,
                vat_breakdown_html: vatBreakdownHtml,
                proposal_appendix_html: proposalAppendixHtml,
                clause_1_2_html: '',
                clause_total_value_number: '1.2.',
                clause_appendix_number: '1.3.',
                clause_appendix_number_plus1: '1.4.',
                scope_appendix_ref: 'Phạm vi công việc, yêu cầu kỹ thuật, chức năng chi tiết, sản phẩm bàn giao, tiêu chí nghiệm thu, bảng giá và lộ trình thực hiện được quy định tại <strong>Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá &amp; Lộ trình triển khai</strong>, là bộ phận không tách rời của Hợp đồng này.',
                timeline_appendix_ref: ' Lộ trình chi tiết được quy định tại Phụ lục 01.',
                change_scope_ref: 'Phụ lục 01',
                appendix_list_text: 'Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai',
            }))
        } catch (err) {
            console.error('Error fetching quotation detail:', err)
        } finally {
            setIsFetchingQuotation(false)
        }
    }

    const handleVariableChange = (key: string, value: string) => {
        setVariables(prev => ({ ...prev, [key]: value }))
    }

    // ── Preview ─────────────────────────────────────────────────────────────
    // cleanMode = true  → biến chưa điền hiển thị trống (dành cho gửi khách)
    // cleanMode = false → biến chưa điền hiển thị [tên biến] màu xám (dành cho soạn thảo)
    const previewHtml = useMemo(() => {
        if (!template) return ''
        let html = template.content
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            html = html.replace(regex, value || (cleanMode ? '' : `<span style="color:#ccc;font-style:italic;">[${key.replace(/_/g, ' ')}]</span>`))
        }
        // In clean mode, also strip any remaining {{...}} placeholders not in variables map
        if (cleanMode) {
            html = html.replace(/\{\{[^}]+\}\}/g, '')
        }
        return html
    }, [template, variables, cleanMode])

    // Clean HTML for download (always strips all placeholders, no inline spans)
    const cleanHtmlForExport = useMemo(() => {
        if (!template) return ''
        let html = template.content
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
            html = html.replace(regex, value || '')
        }
        html = html.replace(/\{\{[^}]+\}\}/g, '')
        return html
    }, [template, variables])

    // ── Download ─────────────────────────────────────────────────────────────
    // Normal download: dùng previewHtml (cleanMode hoặc có placeholder)
    const handleDownload = () => {
        const html = cleanMode ? cleanHtmlForExport : previewHtml
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title><style>@media print { @page { size: A4; margin: 15.24mm 15.24mm 16.256mm; } body { margin: 0; } }</style></head><body>${html}</body></html>`
        const blob = new Blob([fullHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template?.name || 'document'}.html`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Export for client: always clean (no placeholders), ready for PDF conversion
    const handleExportForClient = () => {
        const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title><style>@media print { @page { size: A4; margin: 15.24mm 15.24mm 16.256mm; } body { margin: 0; } } body { font-family: Arial, sans-serif; } </style></head><body>${cleanHtmlForExport}</body></html>`
        const blob = new Blob([fullHtml], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${template?.name || 'document'} - Gửi khách.html`
        a.click()
        URL.revokeObjectURL(url)
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${template?.name}</title><style>@media print { @page { size: A4; margin: 15.24mm 15.24mm 16.256mm; } body { margin: 0; } }</style></head><body>${previewHtml}</body></html>`)
            printWindow.document.close()
            printWindow.focus()
            setTimeout(() => printWindow.print(), 300)
        }
    }

    // ── Nạp vào hợp đồng ───────────────────────────────────────────────────
    const handleCreateContract = async () => {
        if (!selectedQuotationId) return
        setIsCreatingContract(true)
        try {
            const res = await fetch(`/api/quotations/${selectedQuotationId}/convert-contract`, {
                method: 'POST',
            })
            const data = await res.json()
            if (res.ok && data.success) {
                toast.success('Hợp đồng đã được tạo thành công!')
                setTimeout(() => router.push(`/contracts/${data.id}`), 1200)
            } else {
                toast.error(data.error || 'Không thể tạo hợp đồng')
            }
        } catch (err) {
            toast.error('Lỗi kết nối, vui lòng thử lại')
        } finally {
            setIsCreatingContract(false)
        }
    }

    // ── Variable labels ─────────────────────────────────────────────────────
    const variableLabels: Record<string, string> = {
        contract_number: 'Số hợp đồng',
        order_number: 'Số đơn đặt hàng / báo giá',
        payment_number: 'Số đề nghị TT',
        report_number: 'Số biên bản',
        day: 'Ngày',
        month: 'Tháng',
        year: 'Năm',
        customer_company: 'Tên công ty (Bên A)',
        customer_representative: 'Người đại diện',
        customer_position: 'Chức vụ',
        customer_address: 'Địa chỉ',
        customer_phone: 'Điện thoại',
        customer_mobile: 'Di động',
        customer_tax_code: 'Mã số thuế',
        customer_email: 'Email',
        customer_bank_account: 'Số tài khoản',
        customer_bank_name: 'Ngân hàng',
        contract_items_table: 'Bảng hàng hoá (HTML)',
        delivery_items_table: 'Bảng giao nhận (HTML)',
        subtotal: 'Cộng tiền hàng',
        vat_rate: 'Thuế suất GTGT',
        vat_amount: 'Tiền thuế',
        total_amount_number: 'Tổng tiền thanh toán',
        amount_in_words: 'Số tiền bằng chữ',
        payment_terms: 'Điều khoản thanh toán',
        delivery_time: 'Thời gian giao hàng',
        end_date: 'Ngày kết thúc dự kiến',
        delivery_address: 'Địa điểm giao hàng',
        delivery_date: 'Ngày giao hàng',
        service_description: 'Mô tả dịch vụ',
        contract_date: 'Ngày ký hợp đồng',
        payment_percentage: 'Tỉ lệ thanh toán',
        payment_amount: 'Số tiền thanh toán',
        order_date: 'Ngày đặt hàng',
    }

    // ── Loading / not found states ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!template) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold">Không tìm thấy mẫu</h1>
                </div>
            </div>
        )
    }

    const dateVars = template.variables.filter(v => ['day', 'month', 'year'].includes(v))
    const customerVars = template.variables.filter(v => v.startsWith('customer_'))
    const docVars = template.variables.filter(v => !v.startsWith('customer_') && !['day', 'month', 'year'].includes(v))
    const isContractTemplate = template.type === 'contract'

    const selectedQuotation = quotations.find(q => q.id === selectedQuotationId)
    const canCreateContract = isContractTemplate && !!selectedQuotationId && selectedQuotation?.status !== 'converted'

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-muted/80">
                        <Link href="/templates">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold flex items-center gap-2">
                            <FileText className="h-6 w-6" />
                            {template.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Điền thông tin để tạo giấy tờ từ mẫu này
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* Clean mode toggle */}
                        <button
                            onClick={() => setCleanMode(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                cleanMode
                                    ? 'border-blue-400 bg-blue-50 text-blue-700'
                                    : 'border-dashed border-muted-foreground/40 text-muted-foreground hover:border-muted-foreground/70'
                            }`}
                            title={cleanMode ? 'Đang xem chế độ gửi khách — biến trống ẩn đi' : 'Bật chế độ gửi khách — biến trống sẽ hiển thị trống'}
                        >
                            {cleanMode ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            {cleanMode ? 'Xem soạn thảo' : 'Chế độ gửi khách'}
                        </button>

                        <Button variant="outline" onClick={handlePrint}>
                            In giấy tờ
                        </Button>
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="h-4 w-4" />
                            Tải HTML
                        </Button>
                        <Button
                            onClick={handleExportForClient}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            title="Xuất file HTML sạch (không có placeholder), mở bằng Chrome → In → Lưu PDF để gửi khách"
                        >
                            <Send className="h-4 w-4" />
                            Xuất PDF gửi khách
                        </Button>
                        {canCreateContract && (
                            <Button
                                onClick={handleCreateContract}
                                disabled={isCreatingContract}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {isCreatingContract ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <FilePlus2 className="h-4 w-4" />
                                )}
                                Nạp vào hợp đồng
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                    {/* Variable Form */}
                    <Card className="lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Thông tin biến</CardTitle>
                            <CardDescription>
                                Chọn khách hàng, báo giá hoặc điền thủ công
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            {/* ── Customer Selection ── */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">Chọn khách hàng</Label>
                                <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tự động điền thông tin Bên A..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>
                                                {c.company_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* ── Quotation Selection ── */}
                            <div className="space-y-2">
                                <Label className="text-xs font-medium flex items-center gap-1.5">
                                    Chọn báo giá
                                    {isFetchingQuotation && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                </Label>
                                <Select value={selectedQuotationId} onValueChange={handleQuotationSelect} disabled={isFetchingQuotation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tự động điền bảng hàng, tổng tiền..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredQuotations.length === 0 ? (
                                            <div className="px-3 py-2 text-sm text-muted-foreground">
                                                {selectedCustomerId ? 'Khách hàng chưa có báo giá' : 'Không có báo giá nào'}
                                            </div>
                                        ) : (
                                            filteredQuotations.map(q => {
                                                const statusInfo = quotationStatusLabel[q.status] || { label: q.status, color: 'bg-gray-100 text-gray-600' }
                                                return (
                                                    <SelectItem key={q.id} value={q.id}>
                                                        <div className="flex items-center gap-2 w-full">
                                                            <span className="font-medium text-xs">{q.quotation_number}</span>
                                                            <span className="text-muted-foreground truncate max-w-[160px]">{q.title}</span>
                                                            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${statusInfo.color}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                )
                                            })
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Selected quotation info banner */}
                                {selectedQuotation && (
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-800 space-y-0.5">
                                        <div className="font-semibold">{selectedQuotation.title}</div>
                                        <div className="flex items-center justify-between text-emerald-700">
                                            <span>{selectedQuotation.quotation_number}</span>
                                            <span className="font-bold">{new Intl.NumberFormat('vi-VN').format(selectedQuotation.total_amount)} đ</span>
                                        </div>
                                        {selectedQuotation.status === 'converted' && (
                                            <div className="text-amber-700 font-medium">⚠ Báo giá đã được chuyển thành hợp đồng</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* ── Doc number & date ── */}
                            {(docVars.length > 0 || dateVars.length > 0) && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Thông tin giấy tờ</p>
                                    <div className="grid gap-2">
                                        {docVars.filter(v => !['contract_items_table', 'delivery_items_table', 'quotation_items_table'].includes(v)).map(variable => (
                                            <div key={variable} className="space-y-1">
                                                <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                    {variableLabels[variable] || variable.replace(/_/g, ' ')}
                                                </Label>
                                                <Input
                                                    id={variable}
                                                    value={variables[variable] || ''}
                                                    onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                    placeholder={variableLabels[variable] || variable.replace(/_/g, ' ')}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        ))}
                                        {dateVars.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {dateVars.map(variable => (
                                                    <div key={variable} className="space-y-1">
                                                        <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                            {variableLabels[variable]}
                                                        </Label>
                                                        <Input
                                                            id={variable}
                                                            value={variables[variable] || ''}
                                                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ── Customer fields ── */}
                            {customerVars.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Thông tin Bên A (khách hàng)</p>
                                        <div className="grid gap-2">
                                            {customerVars.map(variable => (
                                                <div key={variable} className="space-y-1">
                                                    <Label htmlFor={variable} className="text-xs text-muted-foreground">
                                                        {variableLabels[variable] || variable.replace(/customer_/g, '').replace(/_/g, ' ')}
                                                    </Label>
                                                    <Input
                                                        id={variable}
                                                        value={variables[variable] || ''}
                                                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                                                        placeholder={variableLabels[variable] || variable.replace(/_/g, ' ')}
                                                        className="h-8 text-sm"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Real-time Preview */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Xem trước</CardTitle>
                                    <CardDescription>
                                        {cleanMode
                                            ? 'ⓘ Chế độ gửi khách — biến chưa điền đang ẩn'
                                            : 'Nội dung giấy tờ sau khi điền biến'}
                                    </CardDescription>
                                </div>
                                {cleanMode && (
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                        Chế độ gửi khách
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <iframe
                                srcDoc={`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:20px;font-family:Arial,sans-serif;font-size:10pt;}</style></head><body>${previewHtml}</body></html>`}
                                className="w-full border rounded-lg bg-white"
                                style={{ minHeight: '600px', maxHeight: 'calc(100vh - 240px)', height: '800px' }}
                                title="Xem trước giấy tờ"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Actions footer */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                {cleanMode
                                    ? 'ⓘ Chế độ gửi khách bật — các trường chưa điền đang ẩn. Nhấn “Xuất PDF gửi khách” để tải file sạch.'
                                    : canCreateContract
                                        ? 'Bạn có thể tải xuống, in hoặc nạp báo giá này vào hợp đồng chính thức'
                                        : 'Sau khi hoàn tất, bạn có thể in trực tiếp hoặc tải xuống file HTML'}
                            </p>
                            <div className="flex gap-2 shrink-0">
                                <Button variant="outline" onClick={handlePrint}>
                                    In giấy tờ
                                </Button>
                                <Button variant="outline" onClick={handleDownload}>
                                    <Download className="h-4 w-4" />
                                    Tải HTML
                                </Button>
                                <Button
                                    onClick={handleExportForClient}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Send className="h-4 w-4" />
                                    Xuất PDF gửi khách
                                </Button>
                                {canCreateContract && (
                                    <Button
                                        onClick={handleCreateContract}
                                        disabled={isCreatingContract}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    >
                                        {isCreatingContract ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Đang tạo hợp đồng...
                                            </>
                                        ) : (
                                            <>
                                                <FilePlus2 className="h-4 w-4" />
                                                Nạp vào hợp đồng
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
