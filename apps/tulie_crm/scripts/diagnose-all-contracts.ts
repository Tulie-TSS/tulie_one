import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function parseLocalDateString(dateStr: string): Date {
    const datePart = dateStr.substring(0, 10)
    const [y, m, d] = datePart.split('-').map(Number)
    return new Date(y, m - 1, d)
}

const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function readThreeDigits(n: number, readZero: boolean): string {
    const a = Math.floor(n / 100);
    const b = Math.floor((n % 100) / 10);
    const c = n % 10;

    let result = '';

    if (a > 0 || readZero) {
        result += DIGITS[a] + ' trăm';
    }

    if (b === 0) {
        if (a > 0 && c > 0) result += ' linh';
    } else if (b === 1) {
        result += ' mười';
    } else {
        result += ' ' + DIGITS[b] + ' mươi';
    }

    if (c > 0) {
        if (b > 1 && c === 1) result += ' mốt';
        else if (b > 0 && c === 4) result += ' bốn';
        else if (b > 0 && c === 5) result += ' lăm';
        else result += ' ' + DIGITS[c];
    }

    return result.trim();
}

function readNumberToWords(n: number): string {
    if (n === 0) return 'Không đồng';
    let number = Math.abs(n);
    let result = '';
    let unitIndex = 0;
    if (number === 0) return 'Không đồng';
    while (number > 0) {
        const chunk = number % 1000;
        if (chunk > 0) {
            const chunkText = readThreeDigits(chunk, n >= Math.pow(1000, unitIndex + 1));
            result = chunkText + ' ' + UNITS[unitIndex] + ' ' + result;
        }
        number = Math.floor(number / 1000);
        unitIndex++;
    }
    result = result.replace(/\s+/g, ' ').trim();
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result + ' đồng./.';
}

async function diagnose() {
    console.log('--- START GLOBAL CONTRACT DIAGNOSIS ---')

    // Fetch all contracts with milestones and quotation
    const { data: contracts, error: cErr } = await supabase
        .from('contracts')
        .select('*, milestones:contract_milestones(*), quotation:quotations(*, items:quotation_items(*))')
        .order('created_at', { ascending: false })

    if (cErr || !contracts) {
        console.error('Failed to fetch contracts:', cErr)
        return
    }

    console.log(`Found ${contracts.length} contracts in database. Scanning...`)

    let errorCount = 0

    for (const contract of contracts) {
        try {
            const customerId = contract.customer_id
            let customer: any = null
            if (customerId) {
                const { data } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('id', customerId)
                    .single()
                customer = data
            }

            const signedDate = contract.signed_date ? parseLocalDateString(contract.signed_date) : null
            const docDate = signedDate || new Date()
            const abbr = customer?.abbreviation || ''
            const dateStr = signedDate
                ? `${docDate.getFullYear()}${String(docDate.getMonth() + 1).padStart(2, '0')}${String(docDate.getDate()).padStart(2, '0')}`
                : ''

            const custData = contract.customer_snapshot || customer || {}
            const isFreelance = contract.category === 'freelancer'
            let cleanInitials = ''
            if (isFreelance) {
                const freelancerName = contract.freelancer_metadata?.name || ''
                if (freelancerName) {
                    const words = freelancerName.trim().split(/\s+/)
                    const initials = words.map((w: string) => w[0]).join('').toUpperCase()
                    cleanInitials = initials.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/Đ/g, "D")
                }
            }

            const contractDocNumber = isFreelance
                ? (dateStr && cleanInitials ? `${dateStr}/HĐCTV-TL-${cleanInitials}` : contract.contract_number || '')
                : (dateStr && abbr ? `${dateStr}/HDKT-TL-${abbr.toUpperCase()}` : contract.contract_number || '')
                
            const paymentDocNumber = (dateStr && (abbr || cleanInitials))
                ? `${dateStr}/DNTT-TL-${(abbr || cleanInitials).toUpperCase()}`
                : ''
            const deliveryDocNumber = (dateStr && (abbr || cleanInitials))
                ? `${dateStr}/BGNT-TL-${(abbr || cleanInitials).toUpperCase()}`
                : ''

            const variables: Record<string, string> = {
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
                provider_company: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
                provider_address: 'Tầng 4, Tòa nhà SHG, Số 8 Quang Trung, Phường Hà Đông, Thành phố Hà Nội, Việt Nam',
                provider_tax_code: '0110163102',
                provider_representative: '',
                provider_position: '',
                bank_name: 'Techcombank',
                bank_account: '86683979',
                account_holder: 'CÔNG TY TNHH DỊCH VỤ VÀ GIẢI PHÁP CÔNG NGHỆ TULIE',
                day: docDate.getDate().toString().padStart(2, '0'),
                month: (docDate.getMonth() + 1).toString().padStart(2, '0'),
                year: docDate.getFullYear().toString(),
                contract_date: signedDate ? signedDate.toLocaleDateString('vi-VN') : '',
                date_day: docDate.getDate().toString().padStart(2, '0'),
                date_month: (docDate.getMonth() + 1).toString().padStart(2, '0'),
                date_year: docDate.getFullYear().toString(),
                quotation_date: new Date().toLocaleDateString('vi-VN'),
                location: 'Hà Nội',
                contract_number: contractDocNumber,
                payment_number: paymentDocNumber,
                report_number: deliveryDocNumber,
                quotation_number: contract.quotation?.quotation_number || '',
                subtotal: '',
                vat_rate: '',
                vat_amount: '',
                total_amount_number: '',
                amount_in_words: '',
                payment_terms: '',
                delivery_time: '',
                delivery_address: '',
                delivery_date: '',
                service_description: '',
                payment_percentage: '',
                payment_amount: '',
            }

            variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(contract.total_amount || 0)
            variables.amount_in_words = readNumberToWords(contract.total_amount || 0)
            variables.start_date = contract.start_date ? parseLocalDateString(contract.start_date).toLocaleDateString('vi-VN') : ''
            variables.service_description = contract.description || contract.quotation?.title || contract.title || ''

            if (contract.end_date) {
                variables.delivery_time = parseLocalDateString(contract.end_date).toLocaleDateString('vi-VN')
            }
            variables.delivery_address = custData?.address || customer?.address || ''

            const proposalContent = (contract.quotation?.proposal_content as Record<string, string>) || {}
            const vatStatus = contract.vat_exempt_status || contract.quotation?.vat_exempt_status || proposalContent.vat_exempt_status || '0_percent'

            const items = contract.quotation?.items || []
            if (items.length > 0) {
                let grossTotal = 0
                let totalDiscountAmt = 0
                let totalVat = 0
                let totalAfterVat = 0

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

                sectionEntries.forEach(([sectionName, sectionItems]) => {
                    sectionItems.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                    sectionItems.forEach((item: any) => {
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
                        
                        grossTotal += itemGross
                        totalDiscountAmt += discountAmount
                        totalVat += itemVat
                        totalAfterVat += afterVat
                    })
                })

                const subtotalAfterDiscount = grossTotal - totalDiscountAmt
                const overallDiscountAmount = contract.quotation?.discount_amount ?? 0
                
                const finalTotal = contract.total_amount || (totalAfterVat - overallDiscountAmount)
                variables.total_amount_number = new Intl.NumberFormat('vi-VN').format(finalTotal)
            }

            if (contract.milestones && contract.milestones.length > 0) {
                const paymentMilestones = contract.milestones.filter((m: any) => m.amount > 0)
                if (paymentMilestones.length > 0) {
                    const totalAmount = contract.total_amount || 0
                    paymentMilestones.map((m: any, idx: number) => {
                        const percentage = totalAmount > 0 ? Math.round((m.amount / totalAmount) * 100) : 0
                        const dueStr = m.due_date ? `(Hạn: ${parseLocalDateString(m.due_date).toLocaleDateString('vi-VN')})` : ''
                        return `- Đợt ${idx + 1}: ${percentage}% = ${m.amount} — ${m.name} ${dueStr}`
                    })
                }
            }

        } catch (e: any) {
            errorCount++
            console.error(`\n❌ ERROR DETECTED ON CONTRACT: ${contract.id}`)
            console.error(`Title: "${contract.title}"`)
            console.error(`Quotation ID: ${contract.quotation_id}`)
            console.error(`Error:`, e.message)
            console.error(e.stack)
        }
    }

    console.log(`\nScan finished. Total contracts with errors: ${errorCount}/${contracts.length}`)
}

diagnose()
