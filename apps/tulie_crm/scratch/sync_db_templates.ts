import { createClient } from '@supabase/supabase-js'
import { contractTemplate } from './lib/supabase/services/contract-template'
import { paymentTemplate } from './lib/supabase/services/payment-template'
import { orderTemplate } from './lib/supabase/services/order-template'
import { deliveryMinutesTemplate } from './lib/supabase/services/delivery-minutes-template'
import { quotationTemplate } from './lib/supabase/services/quotation-template'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const defaultTemplates = [
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
        ],
    },
    {
        name: 'Hợp đồng kinh tế (Mẫu chuẩn)',
        type: 'contract',
        content: contractTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'customer_company', 'customer_representative', 'customer_position',
            'customer_address', 'customer_phone', 'customer_mobile',
            'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
            'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
            'total_amount_number', 'amount_in_words',
            'payment_terms', 'delivery_time', 'delivery_address',
            'service_description'
        ],
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
        ],
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
        ],
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
        ],
    }
]

async function sync() {
    console.log('Deleting existing templates...')
    await supabase.from('document_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    console.log('Inserting fresh templates...')
    const { data, error } = await supabase.from('document_templates').insert(defaultTemplates).select()
    
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success! Synced', data.length, 'templates.')
    }
}

sync()
