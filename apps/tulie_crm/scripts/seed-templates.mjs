import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Read env manually
const env = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}="([^"]+)"`))
    return match ? match[1] : null
}

const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
)

// Read template content from TS files
function extractTemplate(filename) {
    const content = readFileSync(`lib/supabase/services/${filename}`, 'utf8')
    const match = content.match(/export const \w+Template = `([\s\S]*?)`/)
    return match ? match[1] : ''
}

const templates = [
    { name: 'Báo giá (Mẫu chuẩn)', type: 'quotation', content: extractTemplate('quotation-template.ts'), variables: ['quotation_number','day','month','year','customer_company','customer_representative','customer_position','customer_address','customer_phone','customer_mobile','customer_tax_code','customer_email','quotation_items_table','subtotal','vat_rate','vat_amount','total_amount_number','amount_in_words','payment_terms','delivery_time','delivery_address'], is_default: true },
    { name: 'Hợp đồng kinh tế (Mẫu chuẩn)', type: 'contract', content: extractTemplate('contract-template.ts'), variables: ['contract_number','day','month','year','customer_company','customer_representative','customer_position','customer_address','customer_phone','customer_mobile','customer_tax_code','customer_email','contract_items_table','subtotal','vat_rate','vat_amount','total_amount_number','amount_in_words','payment_terms','delivery_time','delivery_address','service_description','warranty_clause_html','contract_clause_count'], is_default: true },
    { name: 'Đơn đặt hàng (Mẫu chuẩn)', type: 'order', content: extractTemplate('order-template.ts'), variables: ['order_number','day','month','year','customer_company','customer_representative','customer_position','customer_address','customer_phone','customer_mobile','customer_tax_code','customer_email','contract_items_table','subtotal','vat_rate','vat_amount','total_amount_number','amount_in_words','payment_terms','delivery_time','delivery_address'], is_default: true },
    { name: 'Đề nghị thanh toán (Mẫu chuẩn)', type: 'payment_request', content: extractTemplate('payment-template.ts'), variables: ['payment_number','day','month','year','customer_company','contract_number','contract_date','service_description','delivery_date','payment_percentage','payment_amount','amount_in_words'], is_default: true },
    { name: 'Biên bản giao nhận (Mẫu chuẩn)', type: 'delivery_minutes', content: extractTemplate('delivery-minutes-template.ts'), variables: ['report_number','day','month','year','customer_company','customer_representative','customer_position','customer_address','customer_phone','customer_mobile','customer_tax_code','customer_email','contract_number','order_number','order_date','delivery_items_table'], is_default: true },
]

console.log('Seeding', templates.length, 'templates...')
templates.forEach((t, i) => console.log(`  [${i}] ${t.name} — content length: ${t.content.length}`))

const { data, error } = await supabase.from('document_templates').insert(templates).select('id, name, type')
if (error) { console.error('❌ ERROR:', error.message); process.exit(1) }
console.log('\n✅ Seeded', data.length, 'templates:')
data.forEach(t => console.log(`  ✅ ${t.name} → ${t.id}`))
