import { NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { contractTemplate } from '@/lib/supabase/services/contract-template'
import { paymentTemplate } from '@/lib/supabase/services/payment-template'
import { orderTemplate } from '@/lib/supabase/services/order-template'
import { deliveryMinutesTemplate } from '@/lib/supabase/services/delivery-minutes-template'
import { quotationTemplate } from '@/lib/supabase/services/quotation-template'

/**
 * POST /api/seed-templates — Admin-only
 * Seeds the default document templates into the database.
 * Safe to run multiple times — skips if defaults already exist.
 */
export async function POST() {
    try {
        const authResult = await requireAdmin()
        if (isAuthError(authResult)) return authResult

        const supabase = createAdminClient()

        const body = await request.json().catch(() => ({}))
        const overwrite = body.overwrite === true

        // Check if templates already seeded
        const { data: existing, count } = await supabase
            .from('document_templates')
            .select('id', { count: 'exact' })
            .limit(1)

        if (count && count > 0 && !overwrite) {
            return NextResponse.json({
                success: true,
                message: `Templates already exist (${count} found). No action taken. Use { "overwrite": true } to sync.`,
                count: 0
            })
        }

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

        if (overwrite) {
            await supabase.from('document_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        }

        const { data, error } = await supabase
            .from('document_templates')
            .insert(defaultTemplates)
            .select('id, name, type')

        if (error) {
            console.error('Error seeding templates:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${data.length} default templates`,
            count: data.length,
            templates: data
        })
    } catch (error: any) {
        console.error('Seed templates error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
