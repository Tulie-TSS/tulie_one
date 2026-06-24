'use server'
import { createClient } from '../server'
import { createAdminClient } from '../admin'
import { DocumentTemplate, DocumentBundle, GeneratedDocument } from '@/types'
import { readNumberToWords } from '@/lib/utils/format'

// Parse date string to local Date, avoiding UTC timezone shift
// "2026-03-16T17:00:00+00:00" → local March 16 (not UTC which may differ)
function parseLocalDateString(dateStr: string): Date {
    const datePart = dateStr.substring(0, 10) // "2026-03-16"
    const [y, m, d] = datePart.split('-').map(Number)
    return new Date(y, m - 1, d)
}

// Format local Date as dd/MM/yyyy to ensure leading zeros for days/months under 10
function formatLocalDate(date: Date | null | undefined): string {
    if (!date) return ''
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatLocalDateString(dateStr: string | null | undefined): string {
    if (!dateStr) return ''
    return formatLocalDate(parseLocalDateString(dateStr))
}

import { contractSoftwareTemplate, contractDesignTemplate } from './contract-template'
import { paymentTemplate } from './payment-template'
import { orderTemplate } from './order-template'
import { deliveryMinutesTemplate } from './delivery-minutes-template'
import { quotationTemplate } from './quotation-template'
import { freelanceTemplate } from './freelance-template'
import { freelanceDeliveryTemplate } from './freelance-delivery-template'

/**
 * Standard templates with common variables for HTML fallback and variable definition
 * Variables map to {{variable_name}} placeholders in HTML templates
 */
const defaultTemplates: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'Báo giá (Mẫu chuẩn)',
        type: 'quotation',
        content: quotationTemplate,
        variables: [
            'quotation_number', 'quotation_date', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'quotation_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address'
        ]
    },
    {
        name: 'Hợp đồng kinh tế (Mẫu chuẩn)',
        type: 'contract',
        content: contractSoftwareTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'end_date', 'delivery_address',
            'service_description', 'product_service_declaration',
            'contract_title_upper', 'contract_title_body'
        ]
    },
    {
        name: 'Hợp đồng thiết kế & in ấn (Mẫu chuẩn)',
        type: 'contract',
        content: contractDesignTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'end_date', 'delivery_address',
            'service_description', 'product_service_declaration',
            'contract_title_upper', 'contract_title_body',
            'design_review_days', 'design_review_rounds',
            'video_review_days', 'video_review_rounds',
            'print_review_days'
        ]
    },
    {
        name: 'Đơn đặt hàng (Mẫu chuẩn)',
        type: 'order',
        content: orderTemplate,
        variables: [
            'order_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address'
        ]
    },
    {
        name: 'Đề nghị thanh toán (Mẫu chuẩn)',
        type: 'payment_request',
        content: paymentTemplate,
        variables: [
            'payment_number', 'day', 'month', 'year',
            'customer_company', 'contract_number', 'contract_date',
            'service_description', 'delivery_date',
            'payment_percentage', 'payment_amount', 'amount_in_words'
        ]
    },
    {
        name: 'Biên bản giao nhận (Mẫu chuẩn)',
        type: 'delivery_minutes',
        content: deliveryMinutesTemplate,
        variables: [
            'report_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_number', 'order_number', 'order_date',
            'delivery_items_table'
        ]
    },
    {
        name: 'Hợp đồng CTV (Mẫu chuẩn)',
        type: 'freelance_contract',
        content: freelanceTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'freelancer_name', 'freelancer_cccd', 'cccd_date', 'cccd_place', 'freelancer_dob',
            'freelancer_address', 'freelancer_contact_address', 'freelancer_phone', 'freelancer_email',
            'freelancer_bank_account', 'freelancer_bank_account_name', 'freelancer_bank_name',
            'project_name', 'start_date', 'end_date',
            'total_amount', 'deposit_amount', 'deposit_percent', 'remaining_amount',
            'termination_penalty_percent', 'notice_days',
            'amount_in_words', 'contract_items_table_no_vat', 'total_amount_number',
            'contract_title_upper', 'contract_title_body'
        ]
    }
]

// Export built-in default templates (always available, no DB needed)
export async function getDefaultTemplates(): Promise<DocumentTemplate[]> {
    return defaultTemplates.map((t, i) => ({
        ...t,
        id: `default-${t.type}-${i}`,
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    })) as DocumentTemplate[]
}

// Get all templates — DB-first, built-in fallback when DB is empty or missing types
export async function getDocumentTemplates() {
    try {
        const supabase = createAdminClient()
        // Order by is_default ascending (so custom templates with false come first) and latest created first
        let query = supabase.from('document_templates').select('*')
        const { data, error } = await query
            .order('is_default', { ascending: true })
            .order('created_at', { ascending: false })


        let resultTemplates = data ? (data as DocumentTemplate[]) : []

        if (error || resultTemplates.length === 0) {
            console.warn('No templates in DB, using built-in defaults.')
        }

        // Merge missing templates from defaultTemplates by checking template name
        const existingNames = new Set(resultTemplates.map(t => t.name))
        defaultTemplates.forEach((def, i) => {
            if (!existingNames.has(def.name)) {
                resultTemplates.push({
                    ...def,
                    id: `default-${def.type}-${i}`,
                    is_default: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as DocumentTemplate)
            }
        })

        return resultTemplates
    } catch {
        return defaultTemplates.map((t, i) => ({
            ...t,
            id: `default-${t.type}-${i}`,
            is_default: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })) as DocumentTemplate[]
    }
}


// Get template by ID — supports both UUID (DB) and legacy `default-N` format
export async function getTemplateById(id: string): Promise<DocumentTemplate | null> {
    try {
        // Legacy built-in ID fallback (pre-DB migration) and new type-based IDs
        if (id.startsWith('default-')) {
            const idVal = id.replace('default-', '')
            // Check if it has an index suffix (e.g. default-contract-1 or default-1)
            const parts = idVal.split('-')
            const lastPart = parts[parts.length - 1]
            const index = parseInt(lastPart, 10)
            
            let template = !isNaN(index) && index >= 0 && index < defaultTemplates.length
                ? defaultTemplates[index]
                : defaultTemplates.find(t => t.type === idVal)
                
            if (template) {
                return {
                    ...template,
                    id,
                    is_default: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                } as DocumentTemplate
            }
            return null
        }

        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error fetching template:', error)
            return null
        }

        return data as DocumentTemplate
    } catch (err) {
        console.error('Error in getTemplateById:', err)
        return null
    }
}

// Create template
export async function createDocumentTemplate(template: Omit<DocumentTemplate, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('document_templates')
        .insert([template])
        .select()
        .single()

    if (error) throw error
    return data as DocumentTemplate
}

// Update template — direct DB edit
export async function updateDocumentTemplate(id: string, template: Partial<DocumentTemplate>) {
    // Clean updated_at
    const updatePayload = { ...template, updated_at: new Date().toISOString() }

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('document_templates')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as DocumentTemplate
}

// Duplicate template — creates a copy with "(Bản sao)" suffix
export async function duplicateDocumentTemplate(id: string): Promise<DocumentTemplate> {
    const original = await getTemplateById(id)
    if (!original) throw new Error('Template not found')

    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('document_templates')
        .insert([{
            name: `${original.name} (Bản sao)`,
            type: original.type,
            content: original.content,
            variables: original.variables,
        }])
        .select()
        .single()

    if (error) throw error
    return data as DocumentTemplate
}

// Delete template
export async function deleteDocumentTemplate(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// Fill template with variables
export async function fillTemplate(template: string, variables: Record<string, string>): Promise<string> {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g')
        result = result.replace(regex, value || '')
    }
    // Clean up any remaining unfilled {{...}} placeholders so they appear blank
    result = result.replace(/\{\{[a-zA-Z_]+\}\}/g, '')
    return result
}

/**
 * For freelancer contracts that don't have their own quotation/items,
 * look up the B2B client contract on the same project and inherit its
 * quotation and items so the items tables render correctly.
 */
async function inheritB2BItemsForFreelancer(supabase: any, contract: any): Promise<any> {
    if (!contract?.project_id) return contract

    try {
        const { data: clientContracts } = await supabase
            .from('contracts')
            .select('*, quotation:quotations(*, items:quotation_items(*))')
            .eq('project_id', contract.project_id)
            .neq('category', 'freelancer')
            .in('type', ['contract', 'order'])
            .limit(1)

        const clientContract = clientContracts?.[0]
        if (!clientContract) return contract

        // Inherit quotation and items from the client B2B contract
        return {
            ...contract,
            quotation: contract.quotation || clientContract.quotation,
            items: (clientContract.quotation?.items || []),
            // Keep the freelancer's own total_amount if set; otherwise fall back to client's
            total_amount: contract.total_amount || clientContract.total_amount,
        }
    } catch (err) {
        console.error('inheritB2BItemsForFreelancer error:', err)
        return contract
    }
}

// Generate document from template and customer data (HTML version)
export async function generateDocument(
    templateId: string,
    customerId: string,
    contractId?: string,
    additionalVariables?: Record<string, string>,
    prefetchedData?: {
        template?: DocumentTemplate | null
        customer?: any
        contract?: any
    }
) {
    try {
        const supabase = createAdminClient()
        let hasDiscount = true
        let hasVat = true
        let totalColumns = 11

        // Get template
        const template = prefetchedData?.template !== undefined 
            ? prefetchedData.template 
            : await getTemplateById(templateId)
        if (!template) throw new Error('Template not found')

        // Get customer data (if customerId exists)
        let customer: any = prefetchedData?.customer !== undefined
            ? prefetchedData.customer
            : null
        if (!customer && customerId) {
            const { data, error: custError } = await supabase
                .from('customers')
                .select('*')
                .eq('id', customerId)
                .single()
            
            if (!custError && data) {
                customer = data
            }
        }

        // Get contract and its source quotation data
        let contract = prefetchedData?.contract !== undefined
            ? prefetchedData.contract
            : null
        
        if (contract && !contract.items) {
            contract = {
                ...contract,
                items: contract.quotation?.items || []
            }
        }

        if (!contract && contractId) {
            const { data } = await supabase
                .from('contracts')
                .select('*, milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
                .eq('id', contractId)
                .single()

            if (data) {
                contract = {
                    ...data,
                    items: data.quotation?.items || []
                }

                // Auto-save snapshot if contract doesn't have one yet
                if (!data.customer_snapshot && customer) {
                    const snapshot = {
                        company_name: customer.company_name,
                        tax_code: customer.tax_code,
                        email: customer.email,
                        phone: customer.phone,
                        address: customer.address,
                        invoice_address: customer.invoice_address,
                        representative: customer.representative,
                        position: customer.position,
                    }
                    await supabase
                        .from('contracts')
                        .update({ customer_snapshot: snapshot })
                        .eq('id', contractId)
                    contract.customer_snapshot = snapshot
                }
            }
        }

        // For freelancer contracts: inherit quotation/items from the B2B client contract
        // of the same project, so items tables render correctly.
        if (contract?.category === 'freelancer' && contract?.project_id && (!contract.items || contract.items.length === 0)) {
            contract = await inheritB2BItemsForFreelancer(supabase, contract)
        }

        // Use signed_date if available, otherwise fallback to now
        const signedDate = contract?.signed_date ? parseLocalDateString(contract.signed_date) : null
        const docDate = signedDate || new Date()
        const abbr = customer?.abbreviation || ''
        const dateStr = signedDate
            ? `${docDate.getFullYear()}${String(docDate.getMonth() + 1).padStart(2, '0')}${String(docDate.getDate()).padStart(2, '0')}`
            : ''

        // Use snapshot from contract if available, otherwise live customer data
        const custData = contract?.customer_snapshot || customer || {}

        // Check if contract/document is digital/website/design
        const isDigital = (() => {
            const deliveryMethod = custData?.delivery_method
            if (deliveryMethod === 'digital') return true
            if (deliveryMethod === 'physical') return false

            // Default fallback for older contracts with no snapshot
            const productName = (contract?.product_name_in_contract || contract?.quotation?.product_name_in_contract || additionalVariables?.product_name_in_contract || '').toLowerCase()
            const title = (contract?.title || '').toLowerCase()
            const description = (contract?.description || '').toLowerCase()
            const qTitle = (contract?.quotation?.title || '').toLowerCase()
            
            const digitalKeywords = ['website', 'web', 'phần mềm', 'phan mem', 'app', 'giao diện', 'giao dien', 'logo', 'thiết kế', 'thiet ke', 'branding']
            const hasKeyword = (text: string) => digitalKeywords.some(kw => text.includes(kw))
            
            return hasKeyword(productName) || hasKeyword(title) || hasKeyword(description) || hasKeyword(qTitle)
        })()

        // Extract freelancer initials if it's a freelance contract
        const isFreelance = template.type === 'freelance_contract' || contract?.category === 'freelancer'
        let cleanInitials = ''
        if (isFreelance) {
            const freelancerName = contract?.freelancer_metadata?.name || ''
            if (freelancerName) {
                const words = freelancerName.trim().split(/\s+/)
                const initials = words.map((w: string) => w[0]).join('').toUpperCase()
                // Remove Vietnamese accents and convert to ASCII
                cleanInitials = initials.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D")
            }
        }

        // Build document numbers based on format: yyyymmdd/TYPE-TL-ABBR
        const contractDocNumber = isFreelance
            ? (dateStr && cleanInitials ? `${dateStr}/HĐCTV-TL-${cleanInitials}` : contract?.contract_number || '')
            : (dateStr && abbr ? `${dateStr}/HDKT-TL-${abbr.toUpperCase()}` : contract?.contract_number || '')
            
        const paymentDocNumber = (dateStr && (abbr || cleanInitials))
            ? `${dateStr}/DNTT-TL-${(abbr || cleanInitials).toUpperCase()}`
            : ''
        const deliveryDocNumber = (dateStr && (abbr || cleanInitials))
            ? `${dateStr}/BGNT-TL-${(abbr || cleanInitials).toUpperCase()}`
            : ''

        // Build variables map
        const variables: Record<string, string> = {
            // Customer variables (from snapshot or live)
            customer_company: custData.company_name || customer?.company_name || '',
            customer_address: custData.address || customer?.address || '',
            customer_tax_code: custData.tax_code || customer?.tax_code || '',
            customer_email: custData.email || customer?.email || '',
            customer_phone: custData.phone || customer?.phone || '',
            customer_representative_title: custData.representative_title || customer?.representative_title || '',
            customer_representative: custData.representative || customer?.representative || '',
            customer_position: custData.position || customer?.position || '',
            customer_invoice_address: custData.invoice_address || custData.address || customer?.address || '',
            customer_mobile: '',
            customer_bank_account: '',
            customer_bank_name: '',

            // Provider variables
            provider_company: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
            provider_address: 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam',
            provider_tax_code: '0110163102',
            provider_representative: '',
            provider_position: '',
            bank_name: 'Techcombank',
            bank_account: '86683979',
            account_holder: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',

            // Date variables — use signed_date if available
            day: docDate.getDate().toString().padStart(2, '0'),
            month: (docDate.getMonth() + 1).toString().padStart(2, '0'),
            year: docDate.getFullYear().toString(),
            contract_date: signedDate ? formatLocalDate(signedDate) : '',
            date_day: docDate.getDate().toString().padStart(2, '0'),
            date_month: (docDate.getMonth() + 1).toString().padStart(2, '0'),
            date_year: docDate.getFullYear().toString(),
            quotation_date: formatLocalDate(new Date()),
            location: 'Hà Nội',

            // Document numbers — using new format
            contract_number: contractDocNumber,
            payment_number: paymentDocNumber,
            report_number: deliveryDocNumber,
            quotation_number: contract?.quotation?.quotation_number || '',

            // Defaults that may be overridden
            subtotal: '',
            vat_rate: '',
            vat_amount: '',
            total_amount_number: '',
            amount_in_words: '',
            payment_terms: '',
            delivery_time: '',
            end_date: '',
            delivery_address: '',
            delivery_date: '',
            service_description: '',
            payment_percentage: '',
            payment_amount: '',
            contract_title_upper: 'HỢP ĐỒNG KINH TẾ',
            contract_title_body: 'hợp đồng kinh tế',
            design_review_days: '03',
            design_review_rounds: '03',
            video_review_days: '03',
            video_review_rounds: '03',
            print_review_days: '03',
            // Default appendix text — overridden below based on hasProposalAppendix
            appendix_list_text: 'Phụ lục 01',

            ...additionalVariables
        }

        // Handle amount_in_words
        if (additionalVariables?.payment_amount && !variables.amount_in_words) {
            const amountValue = parseFloat(additionalVariables.payment_amount.replace(/[^0-9]/g, ''))
            if (!isNaN(amountValue)) variables.amount_in_words = readNumberToWords(amountValue)
        }

        // Add contract variables
        if (contract) {
            variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)
            if (!variables.amount_in_words) variables.amount_in_words = readNumberToWords(contract.total_amount || 0)
            variables.start_date = contract.start_date ? formatLocalDateString(contract.start_date) : ''
            variables.service_description = contract.description || contract.quotation?.title || contract.title || ''
            
            const rawTitle = (contract.title || '').trim()
            if (rawTitle) {
                variables.contract_title_body = rawTitle
                variables.contract_title_upper = rawTitle.toUpperCase()
            }

            // Auto-fill delivery_time from quotation proposal_content if available, else contract end date
            const quoteProposal = (contract.quotation?.proposal_content as Record<string, any>) || {}
            if (quoteProposal.delivery_time) {
                variables.delivery_time = quoteProposal.delivery_time
            }
            variables.end_date = contract.end_date ? formatLocalDateString(contract.end_date) : 'sẽ được các bên xác nhận tại Phụ lục 01'

            // Use delivery_address from snapshot if available, otherwise fallback to default based on type
            variables.delivery_address = custData?.delivery_address || 
                (isDigital 
                    ? 'Bản mềm qua Internet (Email/Cloud/Drive)' 
                    : (custData?.address || customer?.address || ''))

            // Determine VAT status and Product Name early for use in items table and declaration
            const proposalContent = (contract?.quotation?.proposal_content as Record<string, string>) || {}
            const isExempt = contract?.vat_exempt_status === 'exempt' || 
                             contract?.quotation?.vat_exempt_status === 'exempt' || 
                             proposalContent.vat_exempt_status === 'exempt'
            const vatStatus = isExempt ? 'exempt' : '0_percent'
            const productName = contract?.product_name_in_contract?.trim() || contract?.quotation?.product_name_in_contract?.trim() || proposalContent.product_name_in_contract?.trim() || ''

            // Build items table from quotation items
            let items = contract.items || []
            if (items.length > 0) {
                // If contract total_amount is less than the calculated gross/net sum of all items,
                // it implies that optional items were not selected. In that case, we exclude them.
                {
                    const overallDiscountAmount = contract.quotation?.discount_amount ?? 0
                    let calcTotalAfterVat = 0
                    items.forEach((item: any) => {
                        const qty = item.quantity || 1
                        const unitPrice = item.unit_price || 0
                        const itemGross = qty * unitPrice
                        const discountPct = item.discount || 0
                        const discountAmount = Math.round(itemGross * discountPct / 100)
                        const afterDiscount = itemGross - discountAmount
                        const itemVatRate = vatStatus === 'exempt' ? 0 : (item.vat_percent !== undefined && item.vat_percent !== null 
                            ? item.vat_percent 
                            : (contract.quotation?.vat_percent || 0))
                        const itemVat = Math.round(afterDiscount * itemVatRate / 100)
                        const afterVat = afterDiscount + itemVat
                        calcTotalAfterVat += afterVat
                    })
                    const totalWithAllItems = calcTotalAfterVat - overallDiscountAmount

                    if (contract.total_amount && contract.total_amount < totalWithAllItems - 100) {
                        items = items.filter((item: any) => !item.is_optional)
                    }
                }

                // Check dynamically which columns to display
                hasDiscount = items.some((item: any) => (item.discount || 0) > 0)
                hasVat = vatStatus !== 'exempt' && items.some((item: any) => {
                    const itemVatRate = item.vat_percent !== undefined && item.vat_percent !== null 
                        ? item.vat_percent 
                        : (contract.quotation?.vat_percent || 0)
                    return itemVatRate > 0
                })

                totalColumns = 11
                if (!hasDiscount) totalColumns -= 2
                if (!hasVat) totalColumns -= 2

                let grossTotal = 0
                let totalDiscountAmt = 0
                let totalVat = 0
                let totalAfterVat = 0
                let itemsRowsHtml = ''
                let itemsRowsNoVatHtml = ''

                // Group items by section_name
                const sections: Record<string, any[]> = {}
                items.forEach((item: any) => {
                    const sectionName = item.section_name || ''
                    if (!sections[sectionName]) sections[sectionName] = []
                    sections[sectionName].push(item)
                })

                const sectionEntries = Object.entries(sections).sort((a, b) => {
                    if (a[0] === '') return 1
                    if (b[0] === '') return -1
                    return (a[1][0]?.sort_order || 0) - (b[1][0]?.sort_order || 0)
                })

                sectionEntries.forEach(([sectionName, sectionItems], sIdx) => {
                    // Section header row
                    if (sectionName) {
                        itemsRowsHtml += `<tr style="background:#f0f0f0;">
                            <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns}"><strong>${sectionName}</strong></td>
                        </tr>`
                        itemsRowsNoVatHtml += `<tr style="background:#f0f0f0;">
                            <td style="border:1px solid #000; padding:6px 4px;" colspan="6"><strong>${sectionName}</strong></td>
                        </tr>`
                    }

                    sectionItems.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                    sectionItems.forEach((item: any, iIdx: number) => {
                        const qty = item.quantity || 1
                        const unitPrice = item.unit_price || 0
                        const itemGross = qty * unitPrice
                        const discountPct = item.discount || 0 // discount is a percentage (0-100)
                        const discountAmount = Math.round(itemGross * discountPct / 100)
                        const afterDiscount = itemGross - discountAmount
                        const itemVatRate = vatStatus === 'exempt' ? 0 : (item.vat_percent !== undefined && item.vat_percent !== null 
                            ? item.vat_percent 
                            : (contract.quotation?.vat_percent || 0))
                        const itemVat = Math.round(afterDiscount * itemVatRate / 100)
                        const afterVat = afterDiscount + itemVat
                        
                        grossTotal += itemGross
                        totalDiscountAmt += discountAmount
                        totalVat += itemVat
                        totalAfterVat += afterVat

                        // Description: each line becomes its own block with spacing
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
                            <td style="border:1px solid #000; padding:4px; text-align:center; vertical-align:top; white-space:nowrap;">${vatStatus === 'exempt' ? 'KCT' : (itemVatRate > 0 ? itemVatRate + '%' : '0%')}</td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${itemVat > 0 ? new Intl.NumberFormat('vi-VN').format(itemVat) : '0'}</td>`
                        }

                        rowHtml += `
                            <td style="border:1px solid #000; padding:4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(afterVat)}</td>
                        </tr>`

                        itemsRowsHtml += rowHtml
                        
                        itemsRowsNoVatHtml += `<tr>
                            <td style="border:1px solid #000; padding:6px 4px; text-align:center; vertical-align:top; white-space:nowrap;">${itemNum}</td>
                            <td style="border:1px solid #000; padding:6px 4px; vertical-align:top;"><strong>${item.product_name}</strong>${descHtml}</td>
                            <td style="border:1px solid #000; padding:6px 4px; text-align:center; vertical-align:top; white-space:nowrap;">${item.unit || 'Gói'}</td>
                            <td style="border:1px solid #000; padding:6px 4px; text-align:center; vertical-align:top; white-space:nowrap;">${qty}</td>
                            <td style="border:1px solid #000; padding:6px 4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(unitPrice)}</td>
                            <td style="border:1px solid #000; padding:6px 4px; text-align:right; vertical-align:top; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(itemGross)}</td>
                        </tr>`
                    })
                })
                
                // Add legend for KCT if exempt
                if (vatStatus === 'exempt') {
                    itemsRowsHtml += `<tr>
                        <td style="border:1px solid #000; padding:4px; font-size:7.5pt; font-style:italic;" colspan="${totalColumns}">* Ghi chú: KCT = Không chịu thuế giá trị gia tăng theo quy định của pháp luật.</td>
                    </tr>`
                }

                // Calculate VAT breakdown rows using the same dynamic column count
                // as the item rows. This prevents summary rows from shifting when
                // discount columns are hidden but VAT columns remain visible.
                let vatBreakdownHtml = ''
                if (vatStatus === 'exempt') {
                    vatBreakdownHtml = `<tr style="background:#f5f5f5;">
                        <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Thuế suất GTGT (VAT):</strong></td>
                        <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">Không chịu thuế</td>
                    </tr>`
                } else {
                    const vatGroupsMap: Record<number, number> = {}
                    items.forEach((item: any) => {
                        const qty = item.quantity || 1
                        const unitPrice = item.unit_price || 0
                        const itemGross = qty * unitPrice
                        const discountPct = item.discount || 0
                        const discountAmount = Math.round(itemGross * discountPct / 100)
                        const afterDiscount = itemGross - discountAmount
                        const itemVatRate = item.vat_percent 
                            ? item.vat_percent 
                            : (contract.quotation?.vat_percent || 0)
                        const itemVat = Math.round(afterDiscount * itemVatRate / 100)
                        
                        if (itemVat > 0 || itemVatRate === 0) {
                            vatGroupsMap[itemVatRate] = (vatGroupsMap[itemVatRate] || 0) + itemVat
                        }
                    })

                    Object.entries(vatGroupsMap).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([rate, amt]) => {
                        vatBreakdownHtml += `<tr style="background:#f5f5f5;">
                            <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Tổng thuế suất GTGT (VAT) ${rate}%:</strong></td>
                            <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(amt as number)}</td>
                        </tr>`
                    })
                }
                variables.vat_breakdown_html = vatBreakdownHtml

                variables.contract_items_table = itemsRowsHtml
                variables.contract_items_table_no_vat = itemsRowsNoVatHtml
                variables.quotation_items_table = itemsRowsHtml
                variables.appendix_price_table = `<table style="width:100%; border-collapse:collapse; margin:0 0 8px 0; font-size:9pt;">
                    <thead>
                        <tr style="background:#e8e8e8;">
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center; width:6%;">STT</th>
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center;">Hạng mục / Sản phẩm bàn giao</th>
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center; width:9%;">ĐVT</th>
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center; width:8%;">SL</th>
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center; width:16%;">Đơn giá (VNĐ)</th>
                            <th style="border:1px solid #000; padding:5px 3px; text-align:center; width:18%;">Thành tiền (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRowsNoVatHtml}
                        <tr style="background:#e8e8e8;">
                            <td colspan="5" style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold;">TỔNG GIÁ TRỊ THANH TOÁN</td>
                            <td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold; white-space:nowrap;">${new Intl.NumberFormat('vi-VN').format(contract.total_amount || totalAfterVat)} VNĐ</td>
                        </tr>
                        <tr>
                            <td colspan="6" style="border:1px solid #000; padding:5px; font-style:italic;">Bằng chữ: ${readNumberToWords(contract.total_amount || totalAfterVat)}.</td>
                        </tr>
                    </tbody>
                </table>`

                // Build delivery items table (simplified: STT, Name, Unit, Qty, Notes)
                let deliveryRowsHtml = ''
                let deliveryIdx = 0
                sectionEntries.forEach(([sectionName, sectionItems]) => {
                    sectionItems.forEach((item: any) => {
                        deliveryIdx++
                        deliveryRowsHtml += `<tr>
                            <td style="border:1px solid #000; padding:5px; text-align:center;">${deliveryIdx}</td>
                            <td style="border:1px solid #000; padding:5px;" colspan="3">${item.product_name}</td>
                            <td style="border:1px solid #000; padding:5px; text-align:center;">${item.unit || 'Gói'}</td>
                            <td style="border:1px solid #000; padding:5px; text-align:center;">${item.quantity || 1}</td>
                            <td style="border:1px solid #000; padding:5px;" colspan="2"></td>
                        </tr>`
                    })
                })
                variables.delivery_items_table = deliveryRowsHtml

                // Summary totals
                const subtotalAfterDiscount = grossTotal - totalDiscountAmt
                const overallDiscountAmount = contract.quotation?.discount_amount ?? 0
                const overallDiscountPercent = contract.quotation?.discount_percent ?? 0
                
                variables.gross_total = new Intl.NumberFormat('vi-VN').format(grossTotal)
                variables.total_discount = new Intl.NumberFormat('vi-VN').format(totalDiscountAmt)
                variables.subtotal = new Intl.NumberFormat('vi-VN').format(subtotalAfterDiscount)
                variables.vat_total = new Intl.NumberFormat('vi-VN').format(totalVat)
                variables.vat_amount = variables.vat_total // Set both for template compatibility
                variables.total_after_vat = new Intl.NumberFormat('vi-VN').format(totalAfterVat)
                
                // Final total = totalAfterVat - overall discount (if any)
                const finalTotal = contract.total_amount || (totalAfterVat - overallDiscountAmount)
                variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(finalTotal)

                // Keep legacy vars for backward compat
                variables.vat_rate = (contract.quotation?.vat_percent || 0).toString()

                // Optional overall discount row (separate from per-item discounts)
                if (overallDiscountAmount > 0) {
                    const pctString = overallDiscountPercent > 0 ? ` (${overallDiscountPercent}%)` : ''
                    variables.discount_row_html = `
                    <tr>
                      <td style="border:1px solid #000; padding:4px;" colspan="${totalColumns - 1}"><strong>Chiết khấu tổng${pctString}</strong></td>
                      <td style="border:1px solid #000; padding:4px; text-align:right; font-weight:bold;">-${new Intl.NumberFormat('vi-VN').format(overallDiscountAmount)}</td>
                    </tr>`
                } else {
                    variables.discount_row_html = ''
                }
            } else {
                variables.contract_items_table = ''
                variables.contract_items_table_no_vat = ''
                variables.quotation_items_table = ''
                variables.appendix_price_table = `<table style="width:100%; border-collapse:collapse; margin:0 0 8px 0; font-size:9pt;"><tr><td style="border:1px solid #000; padding:6px;">Chưa có hạng mục báo giá chi tiết.</td></tr><tr><td style="border:1px solid #000; padding:6px; text-align:right; font-weight:bold;">TỔNG GIÁ TRỊ THANH TOÁN: ${new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)} VNĐ</td></tr></table>`
                variables.delivery_items_table = ''
            }

            // Payment terms from milestones
            if (contract.milestones && contract.milestones.length > 0) {
                const paymentMilestones = contract.milestones.filter((m: any) => m.amount > 0)
                if (paymentMilestones.length > 0) {
                    const totalAmount = contract.total_amount || 0
                    const paymentTermsHtml = paymentMilestones.map((m: any, idx: number) => {
                        const percentage = totalAmount > 0 ? Math.round((m.amount / totalAmount) * 100) : 0
                        const dueStr = m.due_date ? `(Hạn: ${formatLocalDateString(m.due_date)})` : ''
                        return `- Đợt ${idx + 1}: ${percentage}% giá trị Hợp đồng = ${new Intl.NumberFormat('vi-VN').format(m.amount)} VND — ${m.name} ${dueStr}`
                    }).join('<br/>')
                    
                    variables.payment_terms = paymentTermsHtml

                    // For payment request: use first pending milestone or total
                    if (!additionalVariables?.payment_amount) {
                        let pendingMilestone = paymentMilestones.find((m: any) => m.status === 'pending') || paymentMilestones[0]
                        if (additionalVariables?.milestone_index !== undefined) {
                            const rawIdx = parseInt(additionalVariables.milestone_index as string, 10)
                            if (!isNaN(rawIdx) && contract.milestones[rawIdx]) {
                                pendingMilestone = contract.milestones[rawIdx]
                            }
                        }

                        if (pendingMilestone) {
                            const pct = totalAmount > 0 ? Math.round((pendingMilestone.amount / totalAmount) * 100) : 0
                            variables.payment_amount = new Intl.NumberFormat('vi-VN').format(pendingMilestone.amount) + ' VND'
                            variables.payment_percentage = `${pct}%`
                            
                            // Only overwrite amount_in_words if this is a payment request
                            if (template.type === 'payment_request') {
                                if (!variables.amount_in_words || variables.amount_in_words === readNumberToWords(totalAmount)) {
                                    variables.amount_in_words = readNumberToWords(pendingMilestone.amount)
                                }
                            }

                            // Dynamic variables for generic milestone info
                            const mName = pendingMilestone.name || 'Thanh toán'
                            const mNameLower = mName.toLowerCase()
                            const isDeposit = mNameLower.includes('cọc') || mNameLower.includes('tạm ứng') || mNameLower.includes('lần 1') || mNameLower.includes('đợt 1')
                            
                            let milestoneReason: string
                            if (isDeposit) {
                                milestoneReason = `Theo điều khoản thanh toán tại Điều 2 của Hợp đồng, Bên sử dụng dịch vụ thanh toán đặt cọc cho Bên cung cấp dịch vụ để triển khai dự án.`
                            } else {
                                const deliveryDate = pendingMilestone.due_date 
                                    ? formatLocalDateString(pendingMilestone.due_date) 
                                    : ''
                                milestoneReason = deliveryDate
                                    ? `Căn cứ Biên bản bàn giao và nghiệm thu ngày ${deliveryDate}, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                                    : `Căn cứ Biên bản bàn giao và nghiệm thu, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                            }

                            if (!variables.milestone_name) variables.milestone_name = mName
                            if (!variables.milestone_reason) variables.milestone_reason = milestoneReason
                            if (!variables.milestone_due_date && pendingMilestone.due_date) {
                                variables.milestone_due_date = formatLocalDateString(pendingMilestone.due_date)
                            }
                        }
                    }
                }
            }
        }

        // Handle freelance_contract specific variables
        if (template.type === 'freelance_contract' || (contract as any)?.category === 'freelancer') {
            const fMeta = (contract as any)?.freelancer_metadata as any || {}
            variables.freelancer_name = fMeta.name || custData.representative || custData.company_name || ''
            variables.freelancer_cccd = fMeta.cccd || ''
            variables.cccd_date = fMeta.cccd_date || ''
            variables.cccd_place = fMeta.cccd_place || ''
            variables.freelancer_dob = fMeta.dob || ''
            variables.freelancer_address = fMeta.address || custData.address || ''
            variables.freelancer_contact_address = fMeta.contact_address || variables.freelancer_address
            variables.freelancer_phone = fMeta.phone || custData.phone || ''
            variables.freelancer_email = fMeta.email || custData.email || ''
            variables.freelancer_bank_account = fMeta.bank_account || ''
            variables.freelancer_bank_account_name = fMeta.bank_account_name || ''
            variables.freelancer_bank_name = fMeta.bank_name || ''
            variables.project_name = fMeta.project_name || contract?.title || contract?.quotation?.title || ''
            variables.total_amount = variables.total_amount_number
            
            // Percentage and amounts for milestones
            const depositPct = fMeta.deposit_percent || 20
            variables.deposit_percent = depositPct.toString()
            const totalVal = contract?.total_amount || 0
            
            // Tax calculation (10% PIT if total >= 2,000,000)
            let taxAmt = 0
            if (totalVal >= 2000000) {
                taxAmt = Math.round(totalVal * 0.1)
            }
            const netAmt = totalVal - taxAmt
            variables.tax_amount = new Intl.NumberFormat('vi-VN').format(taxAmt)
            variables.net_amount = new Intl.NumberFormat('vi-VN').format(netAmt)
            variables.net_amount_in_words = readNumberToWords(netAmt)

            variables.deposit_amount = new Intl.NumberFormat('vi-VN').format(Math.round(totalVal * depositPct / 100))
            variables.remaining_amount = new Intl.NumberFormat('vi-VN').format(totalVal - Math.round(totalVal * depositPct / 100))
            
            variables.termination_penalty_percent = fMeta.termination_penalty_percent || '50'
            variables.notice_days = fMeta.notice_days || '15'
            
            if (fMeta.start_date) variables.start_date = fMeta.start_date
            if (fMeta.end_date) variables.end_date = fMeta.end_date
        }
        // Generate product_service_declaration (always use local const for safety)
        const proposalContentOuter = (contract?.quotation?.proposal_content as Record<string, string>) || {}
        const isExemptOuter = contract?.vat_exempt_status === 'exempt' || 
                              contract?.quotation?.vat_exempt_status === 'exempt' || 
                              proposalContentOuter.vat_exempt_status === 'exempt'
        const vatStatusOuter = isFreelance ? '' : (isExemptOuter ? 'exempt' : '0_percent')
        const productNameOuter = contract?.product_name_in_contract?.trim() || contract?.quotation?.product_name_in_contract?.trim() || proposalContentOuter.product_name_in_contract?.trim() || ''
        let productServiceDeclaration = ''

        if (productNameOuter || vatStatusOuter) {
            if (productNameOuter) {
                productServiceDeclaration += ` ${productNameOuter}`
            }
            if (vatStatusOuter === 'exempt') {
                productServiceDeclaration += ` (thuộc đối tượng không chịu thuế giá trị gia tăng (GTGT/VAT) theo quy định của pháp luật Việt Nam (theo Thông tư 219/2013/TT-BTC))`
            } else if (vatStatusOuter === '0_percent') {
                productServiceDeclaration += ` (thuộc đối tượng chịu thuế suất GTGT 0%)`
            }
        }
        variables.product_service_declaration = productServiceDeclaration

        // ===== WARRANTY CLAUSE =====
        // Rendered as sub-clauses 3.6–3.10 appended to Điều 3 (timeline & delivery)
        // Only injected when warranty_months is set
        const warrantyMonths = (contract as any)?.warranty_months
        if (warrantyMonths && warrantyMonths > 0) {
            // Determine warranty start date: use delivery milestone or contract end_date
            const deliveryMilestone = contract.milestones?.find((m: any) => m.type === 'delivery')
            const warrantyStartDateRaw = deliveryMilestone?.due_date || contract.end_date
            const warrantyStartDate = warrantyStartDateRaw 
                ? formatLocalDateString(warrantyStartDateRaw)
                : '(ngày ký biên bản nghiệm thu và bàn giao website)'

            // Calculate warranty end date
            let warrantyEndDateStr = ''
            if (warrantyStartDateRaw) {
                const startD = parseLocalDateString(warrantyStartDateRaw)
                const endD = new Date(startD)
                endD.setMonth(endD.getMonth() + warrantyMonths)
                // Subtract one day to get "hết ngày"
                endD.setDate(endD.getDate() - 1)
                warrantyEndDateStr = formatLocalDate(endD)
            }

            const warrantyMonthsText = warrantyMonths === 6 ? 'sáu' : warrantyMonths === 12 ? 'mười hai' : warrantyMonths === 24 ? 'hai mươi tư' : warrantyMonths
            const warrantyEndDateNote = warrantyEndDateStr
                ? ` (Dự kiến mốc thời gian bảo hành áp dụng từ ngày ${warrantyStartDate} đến hết ngày ${warrantyEndDateStr}).`
                : ''

            variables.warranty_clause_html = `
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">3.6.</td>
      <td style="vertical-align:top; padding:2px 0;">Bảo hành và Hỗ trợ kỹ thuật:</td>
    </tr>
  </table>
  <table style="width:100%; border-collapse:collapse;">
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.1.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên B cam kết bảo hành kỹ thuật cho website trong thời gian <strong>${warrantyMonths} (${warrantyMonthsText}) tháng</strong> kể từ ngày hai bên ký kết Biên bản Nghiệm thu và Bàn giao website.${warrantyEndDateNote}</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.2.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Trong thời gian bảo hành, Bên B có trách nhiệm sửa chữa miễn phí các lỗi kỹ thuật phát sinh từ quá trình xây dựng và lập trình website do Bên B thực hiện, bao gồm: lỗi hiển thị, lỗi chức năng, lỗi bảo mật cơ bản và các sự cố kỹ thuật khác thuộc phạm vi công việc quy định tại hợp đồng này.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.3.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Phạm vi bảo hành không bao gồm: các thay đổi nội dung do Bên A tự chỉnh sửa gây lỗi; các yêu cầu thay đổi, bổ sung tính năng mới ngoài phạm vi ban đầu; lỗi phát sinh từ môi trường hosting, tên miền hoặc các dịch vụ bên thứ ba do Bên A tự quản lý.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.4.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Bên A thông báo sự cố qua email hoặc các kênh liên lạc được thống nhất. Bên B cam kết phản hồi và xử lý trong vòng 03 (ba) ngày làm việc kể từ khi nhận được thông báo hợp lệ.</td></tr>
    <tr><td style="width:50px; vertical-align:top; padding:2px 0;">3.6.5.</td><td style="vertical-align:top; padding:2px 0; text-align:justify;">Sau thời gian bảo hành, nếu Bên A có nhu cầu tiếp tục hỗ trợ kỹ thuật, hai bên sẽ thỏa thuận và ký kết hợp đồng bảo trì riêng theo thỏa thuận phát sinh.</td></tr>
  </table>`

            variables.contract_clause_count = 'mười bốn (14) điều'
        } else {
            variables.warranty_clause_html = ''
            variables.contract_clause_count = 'mười bốn (14) điều'
        }

        // One unified appendix is the single source of truth for price, scope and delivery.
        const hasProposalAppendix = Boolean(contract)
        variables.clause_1_2_html = ''
        variables.clause_total_value_number = '1.2.'
        variables.clause_appendix_number = '1.3.'
        variables.clause_appendix_number_plus1 = '1.4.'
        variables.scope_appendix_ref = 'Phạm vi công việc, yêu cầu kỹ thuật, chức năng chi tiết, sản phẩm bàn giao, tiêu chí nghiệm thu, bảng giá và lộ trình thực hiện được quy định tại <strong>Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá &amp; Lộ trình triển khai</strong>, là bộ phận không tách rời của Hợp đồng này.'
        variables.timeline_appendix_ref = ' Lộ trình chi tiết được quy định tại Phụ lục 01, bao gồm ngày hoàn thành dự kiến, ngày nghiệm thu/bàn giao dự kiến và cơ chế gia hạn bằng văn bản.'
        variables.change_scope_ref = 'Phụ lục 01'
        variables.appendix_list_text = 'Phụ lục 01 – Phạm vi công việc, Sản phẩm bàn giao, Bảng giá & Lộ trình triển khai'

        // Build proposal appendix HTML from quotation.proposal_content
        if (hasProposalAppendix) {
            const proposalSections: { label: string; content: string }[] = []
            const proposalContent = (contract?.quotation?.proposal_content as Record<string, string>) || {}
            if (Array.isArray((proposalContent as any).sections)) {
                ;(proposalContent as any).sections.forEach((section: any) => {
                    if (section?.label && section?.content) proposalSections.push({ label: section.label, content: section.content })
                })
            } else {
                if (proposalContent.introduction) proposalSections.push({ label: 'Mục tiêu & Giới thiệu', content: proposalContent.introduction })
                if (proposalContent.scope_of_work) proposalSections.push({ label: 'Phạm vi công việc (Scope of Work)', content: proposalContent.scope_of_work })
                if (proposalContent.methodology) proposalSections.push({ label: 'Phương pháp & Cách tiếp cận', content: proposalContent.methodology })
                if (proposalContent.deliverables) proposalSections.push({ label: 'Sản phẩm bàn giao (Deliverables)', content: proposalContent.deliverables })
                if (proposalContent.team) proposalSections.push({ label: 'Đội ngũ chuyên trách', content: proposalContent.team })
                if (proposalContent.timeline) proposalSections.push({ label: 'Lộ trình triển khai (Timeline)', content: proposalContent.timeline })
                if (proposalContent.warranty) proposalSections.push({ label: 'Bảo hành & Hỗ trợ', content: proposalContent.warranty })
                if (proposalContent.why_us) proposalSections.push({ label: 'Vì sao chọn chúng tôi?', content: proposalContent.why_us })
                if (proposalContent.case_studies) proposalSections.push({ label: 'Case Studies & Portfolio', content: proposalContent.case_studies })
            }

            // Custom sections
            if (proposalContent.custom_sections) {
                try {
                    const custom = typeof proposalContent.custom_sections === 'string'
                        ? JSON.parse(proposalContent.custom_sections)
                        : proposalContent.custom_sections
                    if (Array.isArray(custom)) {
                        custom.forEach((s: any) => {
                            if (s.title && s.content) proposalSections.push({ label: s.title, content: s.content })
                        })
                    }
                } catch { /* skip */ }
            }

            {
                let proposalHtml = `
                    <p style="font-weight:bold; font-size:10pt; margin: 18px 0 6px 0;">II. PHẠM VI CÔNG VIỆC, SẢN PHẨM BÀN GIAO, TIÊU CHÍ NGHIỆM THU VÀ LỘ TRÌNH</p>
                `

                proposalSections.forEach((section, idx) => {
                    const sectionContent = section.content
                        .replace(/\n/g, '<br>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    proposalHtml += `
                        <div style="margin-bottom:16px;">
                            <p style="font-weight:bold; font-size:10pt; margin: 0 0 6px 0; border-bottom:1px solid #ddd; padding-bottom:4px;">${idx + 1}. ${section.label}</p>
                            <div style="font-size:9.5pt; text-align:justify; line-height:1.6; padding-left:4px;">${sectionContent}</div>
                        </div>
                    `
                })

                variables.proposal_appendix_content_html = proposalHtml
                variables.proposal_appendix_html = ''
            }
        } else {
            variables.proposal_appendix_content_html = ''
            variables.proposal_appendix_html = ''
        }

        let templateContent = template.content
        // Upgrade legacy database templates: merge proposal content into the existing
        // Appendix 01 instead of rendering another Appendix 01 after it.
        if (template.type === 'contract') {
            templateContent = templateContent
                .replace('{{proposal_appendix_html}}', '')
                .replace(
                    /<p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">II\. CAM KẾT<\/p>/,
                    '{{proposal_appendix_content_html}}<p style="font-weight:bold; margin-top:15px; margin-bottom:5px;">III. CAM KẾT</p>'
                )

            // Keep legacy database templates aligned: put the final payment total
            // after the VAT definition, not inside the contract-value paragraph.
            templateContent = templateContent.replace(/<br><br>\s*<strong>Tổng giá trị thanh toán:<\/strong>[\s\S]*?Khoản 2\.2 dưới đây\./, '')
            if (!templateContent.includes('>2.2.3.</td>')) {
                templateContent = templateContent.replace(
                    /(<tr>\s*<td[^>]*>2\.3\.<\/td>)/,
                    `<tr>
      <td style="width:50px; vertical-align:top; padding:2px 0;">2.2.3.</td>
      <td style="vertical-align:top; padding:2px 0; text-align:justify;">
        <strong>Tổng giá trị thanh toán:</strong><br>
        Tổng giá trị thanh toán Bên A phải thanh toán cho Bên B theo Hợp đồng là: <strong>{{total_amount_number}} VNĐ</strong><br>
        (Bằng chữ: <em>{{amount_in_words}}</em>). Giá trị này chưa bao gồm thuế GTGT nếu pháp luật hoặc cơ quan thuế có thẩm quyền xác định dịch vụ theo Hợp đồng phải chịu thuế GTGT; phần thuế phát sinh được xử lý theo Khoản 2.2 nêu trên.
      </td>
    </tr>
    $1`
                )
            }
        }
        if (isFreelance && template.type === 'delivery_minutes') {
            templateContent = freelanceDeliveryTemplate
        }

        if (!hasDiscount) {
            templateContent = templateContent
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?CK\(%\)[\s\S]*?<\/th>/gi, '')
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?(Giảm giá|Discount)[\s\S]*?<\/th>/gi, '')
        }

        const overallDiscountAmount = contract?.quotation?.discount_amount || 0
        const hasAnyDiscount = contract
            ? ((contract.items && contract.items.length > 0 && contract.items.some((item: any) => (item.discount || 0) > 0)) || overallDiscountAmount > 0)
            : false

        if (!hasAnyDiscount) {
            templateContent = templateContent
                .replace(/<tr[^>]*>\s*<td[^>]*>\s*<strong>Tạm tính<\/strong>[\s\S]*?<\/tr>/gi, '')
                .replace(/<tr[^>]*>\s*<td[^>]*>\s*<strong>Tổng chiết khấu<\/strong>[\s\S]*?<\/tr>/gi, '')
        }
        if (!hasVat) {
            templateContent = templateContent
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?VAT\(%\)[\s\S]*?<\/th>/gi, '')
                .replace(/<th[^>]*>(?:(?!<th|<\/th>)[\s\S])*?(Tiền VAT|Tax)[\s\S]*?<\/th>/gi, '')
        }

        if (totalColumns !== 11) {
            // Do this in one pass. Chaining replacements is unsafe: for example,
            // the expected 10 → 8 conversion was subsequently matched again by
            // the 8 → 6 conversion, shifting the total/VAT values one column left.
            templateContent = templateContent.replace(/colspan="(10|11|8)"/g, (_match, colspan: string) => {
                const replacements: Record<string, number> = {
                    '10': totalColumns - 1,
                    '11': totalColumns,
                    '8': totalColumns - 3,
                }
                return `colspan="${replacements[colspan]}"`
            })
        }

        // Upgrade the former design/printing template stored in the database.
        // Its fixed list of service types made contracts mention work that was not
        // actually purchased. The agreed scope belongs in Appendix 01 instead.
        if (template.type === 'contract' && templateContent.includes('Dịch vụ quay phim, chụp ảnh, dựng video')) {
            templateContent = templateContent.replace(
                /Bên B cung cấp cho Bên A các dịch vụ sau đây \(tùy từng hợp đồng cụ thể, hai bên lựa chọn và ghi rõ trong Phụ lục đính kèm\):[\s\S]*?<\/td>\s*<\/tr>/,
                'Bên B cung cấp cho Bên A các sản phẩm, dịch vụ theo thỏa thuận của hai bên. Danh mục hạng mục, yêu cầu kỹ thuật, số lượng, tiêu chuẩn chất lượng, tiến độ thực hiện và sản phẩm bàn giao được quy định chi tiết tại <strong>Phụ lục 01</strong> đính kèm Hợp đồng này.</td>\n    </tr>'
            )
        }

        // Keep existing design/printing templates in sync with the contract name
        // used in the document heading and avoid exposing the old fixed service name.
        if (template.type === 'contract') {
            templateContent = templateContent.replace(
                'Kèm theo Hợp đồng dịch vụ thiết kế, sản xuất nội dung và in ấn số',
                'Kèm theo {{contract_title_body}} số'
            )
        }

        // Dynamically upgrade old templates that don't have {{contract_title_upper}} and {{contract_title_body}}
        if (template.type === 'contract') {
            if (templateContent.includes('HỢP ĐỒNG DỊCH VỤ THIẾT KẾ VÀ PHÁT TRIỂN WEBSITE')) {
                templateContent = templateContent.replace('HỢP ĐỒNG DỊCH VỤ THIẾT KẾ VÀ PHÁT TRIỂN WEBSITE', '{{contract_title_upper}}')
            }
            if (templateContent.includes('Hợp đồng dịch vụ thiết kế và phát triển website')) {
                templateContent = templateContent.replace('Hợp đồng dịch vụ thiết kế và phát triển website', '{{contract_title_body}}')
            }
        }
        if (template.type === 'freelance_contract') {
            if (templateContent.includes('HỢP ĐỒNG DỊCH VỤ') && templateContent.includes('(KHOÁN VIỆC LẬP TRÌNH)')) {
                templateContent = templateContent
                    .replace('HỢP ĐỒNG DỊCH VỤ', '{{contract_title_upper}}')
                    .replace(/\(KHOÁN VIỆC LẬP TRÌNH\)/g, '')
                    .replace(/<p style="text-align:center; font-size:11pt; margin: 0 0 20px 0;">\s*<\/p>/g, '')
            }
            if (templateContent.includes('Hợp đồng dịch vụ lập trình website')) {
                templateContent = templateContent.replace('Hợp đồng dịch vụ lập trình website', '{{contract_title_body}}')
            }
        }

        // Dynamically upgrade old templates that don't have {{warranty_clause_html}}
        if (template.type === 'contract' && !templateContent.includes('{{warranty_clause_html}}')) {
            const marker = '<!-- ========== ĐIỀU 4 ========== -->'
            if (templateContent.includes(marker)) {
                templateContent = templateContent.replace(marker, `\n  {{warranty_clause_html}}\n\n  ${marker}`)
            } else {
                const altMarker = 'Điều 4:'
                const idx = templateContent.indexOf(altMarker)
                if (idx !== -1) {
                    const tableStartIdx = templateContent.lastIndexOf('<table', idx)
                    if (tableStartIdx !== -1) {
                        templateContent = templateContent.slice(0, tableStartIdx) + `\n  {{warranty_clause_html}}\n\n  ` + templateContent.slice(tableStartIdx)
                    }
                }
            }
        }
        
        // Dynamically upgrade old templates that don't have {{contract_clause_count}}
        if (template.type === 'contract' && templateContent.includes('tám (08) điều') && !templateContent.includes('{{contract_clause_count}}')) {
            templateContent = templateContent.replace('tám (08) điều', '{{contract_clause_count}}')
        }

        // Handle digital delivery adjustments in template content
        if (isDigital) {
            templateContent = templateContent
                .replace('Địa chỉ giao hàng:', 'Hình thức bàn giao:')
                .replace('Địa điểm giao hàng:', 'Hình thức bàn giao:')
            
            if (template.type === 'delivery_minutes') {
                templateContent = templateContent
                    .replace('BIÊN BẢN GIAO NHẬN SẢN PHẨM/DỊCH VỤ', 'BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO SẢN PHẨM/DỊCH VỤ')
                    .replace('BIÊN BẢN GIAO NHẬN', 'BIÊN BẢN NGHIỆM THU VÀ BÀN GIAO')
                    .replace('Bên nhận hàng (Bên A)', 'Bên nhận bàn giao (Bên A)')
                    .replace('Bên giao hàng (Bên B)', 'Bên bàn giao (Bên B)')
                    .replace('Hai bên cùng thống nhất số lượng giao hàng như sau:', 'Hai bên cùng thống nhất nghiệm thu và bàn giao sản phẩm/dịch vụ như sau:')
                    .replace('Bên A xác nhận Bên B đã giao cho Bên A đúng chủng loại và số lượng như trên.', 'Bên A xác nhận Bên B đã nghiệm thu và bàn giao sản phẩm/dịch vụ đầy đủ, đảm bảo yêu cầu chất lượng và đúng chủng loại như trên.')
                    .replace('Biên bản Giao nhận được lập', 'Biên bản Nghiệm thu và Bàn giao được lập')
                    .replace('Biên bản Giao nhận này', 'Biên bản Nghiệm thu và Bàn giao này')
            }
        }

        const filledContent = await fillTemplate(templateContent, variables)

        return {
            content: filledContent,
            variables
        }
    } catch (error) {
        console.error('Error generating document:', error)
        throw error
    }
}

/**
 * Define which documents each contract type needs
 */
function getDocTypesForContract(contractType: string, category?: string): string[] {
    if (category === 'freelancer') {
        return ['freelance_contract', 'delivery_minutes']
    }
    if (contractType === 'order') {
        return ['order', 'payment_request', 'delivery_minutes']
    }
    // Default: contract (HĐ kinh tế)
    return ['contract', 'payment_request', 'delivery_minutes']
}

/**
 * Get all contract documents from DB
 */
export async function getContractDocuments(contractId: string) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('contract_documents')
        .select('*')
        .eq('contract_id', contractId)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching contract documents:', error)
        return []
    }
    return data || []
}

function getNextVersionDocNumber(
    baseDocNum: string,
    existingDocs: { doc_number: string | null; status: string }[]
): { nextDocNum: string; isNewVersion: boolean } {
    if (existingDocs.length === 0) {
        return { nextDocNum: baseDocNum, isNewVersion: false }
    }

    // Check if there is already an existing draft document
    const draftDoc = existingDocs.find(d => d.status === 'draft')
    const signedDocs = existingDocs.filter(d => d.status === 'signed')
    if (draftDoc) {
        // Check if the draft's doc_number conflicts with any signed document in the group
        const hasConflict = signedDocs.some(sd => sd.doc_number && sd.doc_number === draftDoc.doc_number)
        if (!hasConflict) {
            // If no conflict, keep its existing doc_number
            return { nextDocNum: draftDoc.doc_number || baseDocNum, isNewVersion: false }
        }
    }

    // No draft exists, but there are signed documents. We must create a new draft version.
    let maxVersion = 1
    // Remove any existing -vN suffix from the baseDocNum just in case
    const cleanBase = baseDocNum.replace(/[-_]v\d+$/i, '')

    for (const d of existingDocs) {
        const num = d.doc_number || ''
        const match = num.match(/[-_]v(\d+)$/i)
        if (match) {
            const ver = parseInt(match[1], 10)
            if (ver > maxVersion) {
                maxVersion = ver
            }
        }
    }

    const nextVer = maxVersion + 1
    return { nextDocNum: `${cleanBase}-v${nextVer}`, isNewVersion: true }
}

/**
 * Auto-generate all documents for a contract.
 * Bundle composition depends on contract type:
 * - contract → [HĐ, N×ĐNTT, BBGN]  
 * - order → [ĐĐH, N×ĐNTT, BBGN]
 * 
 * Each payment milestone gets its own ĐNTT document.
 * Only regenerates draft documents (signed docs are preserved).
 */
export async function generateDocumentBundle(contractId: string) {
    const supabase = createAdminClient()

    // 1. Get contract with milestones and quotation items
    const { data: rawContract, error: cErr } = await supabase
        .from('contracts')
        .select('*, milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
        .eq('id', contractId)
        .single()

    if (cErr || !rawContract) {
        console.error('generateDocumentBundle: contract not found', cErr)
        return
    }

    // For freelancer contracts: inherit quotation/items from B2B client contract of the same project
    let contract: any = {
        ...rawContract,
        items: rawContract.quotation?.items || []
    }
    if (contract.category === 'freelancer' && contract.project_id && contract.items.length === 0) {
        contract = await inheritB2BItemsForFreelancer(supabase, contract)
    }

    // Fetch customer once to optimize database query performance
    let customer: any = null
    if (contract.customer_id) {
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('id', contract.customer_id)
            .single()
        customer = data
    }

    // 2. Get all existing documents (both draft and signed) to reconcile
    const { data: existingDocs } = await supabase
        .from('contract_documents')
        .select('id, type, milestone_id, is_visible_on_portal, status, doc_number')
        .eq('contract_id', contractId)
    
    // Group existing docs by "type:milestone_id"
    const existingGrouped = new Map<string, any[]>()
    if (existingDocs) {
        for (const d of existingDocs) {
            const key = `${d.type}:${d.milestone_id || 'null'}`
            if (!existingGrouped.has(key)) {
                existingGrouped.set(key, [])
            }
            existingGrouped.get(key)!.push(d)
        }
    }

    // 3. Determine which doc types this contract needs
    const docTypes = getDocTypesForContract(contract.type || 'contract', contract.category)

    // 4. Find templates and generate documents in parallel
    const templates = await getDocumentTemplates()
    const generationPromises: Promise<any>[] = []

    for (const docType of docTypes) {
        let template = templates.find(t => t.type === docType)
        if (docType === 'contract') {
            const targetName = contract.contract_template === 'design'
                ? 'Hợp đồng thiết kế & in ấn (Mẫu chuẩn)'
                : 'Hợp đồng kinh tế (Mẫu chuẩn)'
            const specificTemplate = templates.find(t => t.name === targetName)
            if (specificTemplate) {
                template = specificTemplate
            }
        }
        if (!template) {
            console.warn(`No template found for doc type: ${docType}`)
            continue
        }

        if (docType === 'payment_request') {
            const paymentMilestones = (contract.milestones || []).filter((m: any) => m.amount > 0)
            
            if (paymentMilestones.length === 0) {
                generationPromises.push((async () => {
                    try {
                        const result = await generateDocument(
                            template.id, 
                            contract.customer_id, 
                            contractId,
                            undefined,
                            { template, customer, contract }
                        )
                        return {
                            contract_id: contractId,
                            type: docType,
                            milestone_id: null,
                            doc_number: result.variables?.payment_number || '',
                            content: result.content,
                            status: 'draft'
                        }
                    } catch (e) {
                        console.error(`Error generating generic ${docType}:`, e)
                        return null
                    }
                })())
            } else {
                const totalAmount = contract.total_amount || 0
                paymentMilestones.forEach((milestone: any, i: number) => {
                    generationPromises.push((async () => {
                        try {
                            const pct = totalAmount > 0 ? Math.round((milestone.amount / totalAmount) * 100) : 0
                            const mName = milestone.name || `Đợt ${i + 1}`
                            const mNameLower = mName.toLowerCase()
                            const isDeposit = mNameLower.includes('cọc') || mNameLower.includes('đặt cọc') || mNameLower.includes('tạm ứng')
                            
                            let milestoneReason = ''
                            if (isDeposit) {
                                milestoneReason = `Theo điều khoản thanh toán tại Điều 2 của Hợp đồng, Bên sử dụng dịch vụ thanh toán đặt cọc cho Bên cung cấp dịch vụ để triển khai dự án.`
                            } else {
                                const deliveryDate = milestone.due_date 
                                    ? formatLocalDateString(milestone.due_date) 
                                    : ''
                                milestoneReason = deliveryDate
                                    ? `Căn cứ Biên bản bàn giao và nghiệm thu ngày ${deliveryDate}, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                                    : `Căn cứ Biên bản bàn giao và nghiệm thu, hai bên xác nhận Bên cung cấp dịch vụ đã hoàn thành đầy đủ phạm vi công việc quy định tại Hợp đồng.`
                            }

                            const milestoneVars: Record<string, string> = {
                                payment_amount: new Intl.NumberFormat('vi-VN').format(milestone.amount) + ' VND',
                                payment_percentage: `${pct}%`,
                                amount_in_words: readNumberToWords(milestone.amount),
                                milestone_name: mName,
                                milestone_reason: milestoneReason,
                                milestone_due_date: milestone.due_date 
                                    ? parseLocalDateString(milestone.due_date).toLocaleDateString('vi-VN')
                                    : '',
                            }

                            const result = await generateDocument(
                                template.id, 
                                contract.customer_id, 
                                contractId, 
                                milestoneVars,
                                { template, customer, contract }
                            )
                            const docNum = result.variables?.payment_number 
                                ? `${result.variables.payment_number}-${i + 1}` 
                                : ''
                            
                            return {
                                contract_id: contractId,
                                type: docType,
                                milestone_id: milestone.id,
                                doc_number: docNum,
                                content: result.content,
                                status: 'draft'
                            }
                        } catch (e) {
                            console.error(`Error generating ĐNTT for milestone ${milestone.id}:`, e)
                            return null
                        }
                    })())
                })
            }
        } else {
            generationPromises.push((async () => {
                try {
                    const result = await generateDocument(
                        template.id, 
                        contract.customer_id, 
                        contractId,
                        undefined,
                        { template, customer, contract }
                    )
                    const docNum = (docType === 'contract' || docType === 'freelance_contract') ? result.variables?.contract_number
                        : docType === 'order' ? result.variables?.contract_number
                        : result.variables?.report_number || ''
                    
                    return {
                        contract_id: contractId,
                        type: docType,
                        milestone_id: null,
                        doc_number: docNum,
                        content: result.content,
                        status: 'draft'
                    }
                } catch (e) {
                    console.error(`Error generating ${docType}:`, e)
                    return null
                }
            })())
        }
    }

    const docs = (await Promise.all(generationPromises)).filter(d => d !== null)


    if (docs.length > 0) {
        const targetKeys = new Set<string>()
        const upsertPromises: Promise<any>[] = []

        for (const doc of docs) {
            const key = `${doc.type}:${doc.milestone_id || 'null'}`
            targetKeys.add(key)
            
            const group = existingGrouped.get(key) || []
            const draftDoc = group.find((d: any) => d.status === 'draft')
            
            const { nextDocNum } = getNextVersionDocNumber(doc.doc_number, group)
            doc.doc_number = nextDocNum
            
            if (draftDoc) {
                upsertPromises.push((async () => {
                    const { error: updateErr } = await supabase
                        .from('contract_documents')
                        .update({
                            content: doc.content,
                            doc_number: doc.doc_number
                        })
                        .eq('id', draftDoc.id)
                    if (updateErr) {
                        console.error(`Error updating draft ${doc.type}:`, updateErr.message)
                    }
                })())
            } else {
                upsertPromises.push((async () => {
                    const { error: insertErr } = await supabase
                        .from('contract_documents')
                        .insert(doc)

                    if (insertErr) {
                        console.error(`Error inserting ${doc.type}:`, insertErr.message)
                        if (insertErr.code === '23503' && doc.milestone_id) {
                            await supabase
                                .from('contract_documents')
                                .insert({ ...doc, milestone_id: null })
                        }
                    }
                })())
            }
        }
        
        await Promise.all(upsertPromises)


        // 6. Cleanup obsolete draft documents 
        // Example: The user removed a payment milestone, so its corresponding ĐNTT draft should be removed.
        if (existingDocs) {
            for (const d of existingDocs) {
                if (d.status === 'draft') {
                    const key = `${d.type}:${d.milestone_id || 'null'}`
                    if (!targetKeys.has(key)) {
                        await supabase
                            .from('contract_documents')
                            .delete()
                            .eq('id', d.id)
                    }
                }
            }
        }
    }

    return docs
}

/**
 * Fetches all necessary data to populate a PDF template (React-PDF)
 */
export async function getDocumentData(
    type: 'contract' | 'order' | 'payment_request' | 'delivery_minutes' | 'quotation',
    customerId: string,
    relationId?: string,
    additionalMetadata?: Record<string, any>
) {
    const supabase = createAdminClient()

    // 1. Get Customer
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

    // 2. Get Related Entity (Contract or Quotation or Invoice)
    let relationData: any = null
    let items: any[] = []

    if (relationId) {
        if (type === 'contract' || type === 'order' || type === 'delivery_minutes' || type === 'payment_request') {
            const { data } = await supabase
                .from('contracts')
                .select('*, quotation:quotations(*, items:quotation_items(*))')
                .eq('id', relationId)
                .single()
            relationData = data
            
            let rawItems = data?.quotation?.items || []
            if (rawItems.length > 0 && data) {
                const proposalContent = (data?.quotation?.proposal_content as Record<string, string>) || {}
                const isExempt = data?.vat_exempt_status === 'exempt' || 
                                 data?.quotation?.vat_exempt_status === 'exempt' || 
                                 proposalContent.vat_exempt_status === 'exempt'
                const vatStatus = isExempt ? 'exempt' : '0_percent'
                const overallDiscountAmount = data.quotation?.discount_amount ?? 0

                let calcTotalAfterVat = 0
                rawItems.forEach((item: any) => {
                    const qty = item.quantity || 1
                    const unitPrice = item.unit_price || 0
                    const itemGross = qty * unitPrice
                    const discountPct = item.discount || 0
                    const discountAmount = Math.round(itemGross * discountPct / 100)
                    const afterDiscount = itemGross - discountAmount
                    const itemVatRate = vatStatus === 'exempt' ? 0 : (item.vat_percent !== undefined && item.vat_percent !== null 
                        ? item.vat_percent 
                        : (data.quotation?.vat_percent || 0))
                    const itemVat = Math.round(afterDiscount * itemVatRate / 100)
                    const afterVat = afterDiscount + itemVat
                    calcTotalAfterVat += afterVat
                })
                const totalWithAllItems = calcTotalAfterVat - overallDiscountAmount

                if (data.total_amount && data.total_amount < totalWithAllItems - 100) {
                    rawItems = rawItems.filter((item: any) => !item.is_optional)
                }
            }
            items = rawItems
        } else if (type === 'quotation') {
            const { data } = await supabase
                .from('quotations')
                .select('*, items:quotation_items(*)')
                .eq('id', relationId)
                .single()
            relationData = data
            items = data?.items || []
        }
    }

    const now = new Date()

    return {
        type,
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        customer,
        items,
        contract_number: relationData?.contract_number || relationData?.quotation_number,
        quotation_number: relationData?.quotation_number,
        total_amount: relationData?.total_amount || 0,
        amount_in_words: relationData?.total_amount ? readNumberToWords(relationData.total_amount) : '',
        start_date: relationData?.start_date ? formatLocalDateString(relationData.start_date) : '',
        contract_date: relationData?.created_at ? formatLocalDateString(relationData.created_at) : formatLocalDate(now),
        valid_until: relationData?.valid_until ? formatLocalDateString(relationData.valid_until) : '30 ngày kể từ ngày báo giá',
        ...additionalMetadata
    }
}

// Create Document Bundle
export async function createDocumentBundle(bundle: Omit<DocumentBundle, 'id' | 'created_at' | 'updated_at'>) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('document_bundles')
        .insert([bundle])
        .select()
        .single()

    if (error) throw error
    return data as DocumentBundle
}

export async function getDocumentBundles() {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('document_bundles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return (data || []) as DocumentBundle[]
    } catch (err) {
        console.error('Error fetching bundles:', err)
        return []
    }
}

export async function deleteDocumentBundle(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('document_bundles')
        .delete()
        .eq('id', id)
    if (error) throw error
}

export async function updateDocumentBundle(id: string, bundle: Partial<DocumentBundle>) {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('document_bundles')
        .update(bundle)
        .eq('id', id)
        .select()
        .single()
    if (error) throw error
    return data as DocumentBundle
}

export async function saveGeneratedDocument(doc: Partial<GeneratedDocument>) {
    try {
        const supabase = createAdminClient()
        let query;

        if (doc.id) {
            query = supabase.from('generated_documents').update(doc).eq('id', doc.id)
        } else {
            query = supabase.from('generated_documents').insert([doc])
        }

        const { data, error } = await query.select().single()
        if (error) throw error
        return data as GeneratedDocument
    } catch (err) {
        console.error('Error saving generated doc:', err)
        throw err
    }
}

export async function getGeneratedDocumentById(id: string) {
    try {
        const supabase = createAdminClient()
        const { data, error } = await supabase
            .from('generated_documents')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as GeneratedDocument
    } catch (err) {
        console.error('Error fetching generated doc:', err)
        return null
    }
}

// Generate secure share token using global crypto (Node/Browser compatible)
export async function generateShareToken() {
    return (globalThis.crypto as any).randomUUID().replace(/-/g, '')
}
