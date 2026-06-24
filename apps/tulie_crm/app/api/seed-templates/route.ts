import { NextResponse } from 'next/server'
import { requireAdmin, isAuthError } from '@/lib/security/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { contractSoftwareTemplate, contractDesignTemplate } from '@/lib/supabase/services/contract-template'
import { paymentTemplate } from '@/lib/supabase/services/payment-template'
import { orderTemplate } from '@/lib/supabase/services/order-template'
import { deliveryMinutesTemplate } from '@/lib/supabase/services/delivery-minutes-template'
import { quotationTemplate } from '@/lib/supabase/services/quotation-template'
import { freelanceTemplate } from '@/lib/supabase/services/freelance-template'


/**
 * POST /api/seed-templates — Admin-only
 * Seeds the default document templates into the database.
 * Safe to run multiple times — skips if defaults already exist.
 */
export async function POST(request: Request) {
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
                    'customer_company', 'customer_representative_title', 'customer_representative', 'customer_position',
                    'customer_address', 'customer_phone', 'customer_mobile',
                    'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                    'quotation_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                    'total_amount_number', 'amount_in_words',
                    'payment_terms', 'delivery_time', 'delivery_address'
                ],
            },
            {
                name: 'Hợp đồng dịch vụ (Mẫu chuẩn)',
                type: 'contract',
                content: contractSoftwareTemplate,
                variables: [
                    'contract_number', 'day', 'month', 'year',
                    'customer_company', 'customer_representative_title', 'customer_representative', 'customer_position',
                    'customer_address', 'customer_phone', 'customer_mobile',
                    'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                    'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                    'total_amount_number', 'amount_in_words',
                    'payment_terms', 'delivery_time', 'end_date', 'delivery_address',
                    'service_description', 'warranty_clause_html', 'contract_clause_count',
                    'contract_title_upper', 'contract_title_body'
                ],
            },
            {
                name: 'Hợp đồng thiết kế & in ấn (Mẫu chuẩn)',
                type: 'contract',
                content: contractDesignTemplate,
                variables: [
                    'contract_number', 'day', 'month', 'year',
                    'customer_company', 'customer_representative_title', 'customer_representative', 'customer_position',
                    'customer_address', 'customer_phone', 'customer_mobile',
                    'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                    'contract_items_table', 'subtotal', 'vat_rate', 'vat_amount',
                    'total_amount_number', 'amount_in_words',
                    'payment_terms', 'delivery_time', 'end_date', 'delivery_address',
                    'service_description', 'warranty_clause_html', 'contract_clause_count',
                    'contract_title_upper', 'contract_title_body',
                    'design_review_days', 'design_review_rounds',
                    'video_review_days', 'video_review_rounds',
                    'print_review_days'
                ],
            },
            {
                name: 'Đơn đặt hàng (Mẫu chuẩn)',
                type: 'order',
                content: orderTemplate,
                variables: [
                    'order_number', 'day', 'month', 'year',
                    'customer_company', 'customer_representative_title', 'customer_representative', 'customer_position',
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
                    'customer_company', 'customer_representative_title', 'customer_representative', 'customer_position',
                    'customer_address', 'customer_phone', 'customer_mobile',
                    'customer_tax_code', 'customer_email', 'customer_bank_account', 'customer_bank_name',
                    'contract_number', 'order_number', 'order_date',
                    'delivery_items_table'
                ],
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
                ],
            }

        ]

        if (overwrite) {
            await supabase.from('document_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
        }

        const seeded: any[] = []
        for (const template of defaultTemplates) {
            const { data: existingTemplate, error: lookupError } = await supabase
                .from('document_templates')
                .select('id')
                .eq('type', template.type)
                .eq('name', template.name)
                .maybeSingle()

            if (lookupError) {
                console.error('Error looking up template:', lookupError)
                return NextResponse.json({ error: lookupError.message }, { status: 500 })
            }

            if (existingTemplate?.id) {
                const { data: updated, error: updateError } = await supabase
                    .from('document_templates')
                    .update(template)
                    .eq('id', existingTemplate.id)
                    .select('id, name, type')
                    .single()
                if (updateError) {
                    console.error('Error updating template:', updateError)
                    return NextResponse.json({ error: updateError.message }, { status: 500 })
                }
                seeded.push(updated)
            } else {
                const { data: inserted, error: insertError } = await supabase
                    .from('document_templates')
                    .insert(template)
                    .select('id, name, type')
                    .single()
                if (insertError) {
                    console.error('Error inserting template:', insertError)
                    return NextResponse.json({ error: insertError.message }, { status: 500 })
                }
                seeded.push(inserted)
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${seeded.length} default templates`,
            count: seeded.length,
            templates: seeded
        })
    } catch (error: any) {
        console.error('Seed templates error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
