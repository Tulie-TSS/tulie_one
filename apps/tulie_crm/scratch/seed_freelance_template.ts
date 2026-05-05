import { createAdminClient } from '../lib/supabase/admin'
import { freelanceTemplate } from '../lib/supabase/services/freelance-template'

async function seed() {
    const supabase = createAdminClient()
    
    const template = {
        name: 'Hợp đồng CTV (Mẫu chuẩn)',
        type: 'freelance_contract',
        content: freelanceTemplate,
        variables: [
            'contract_number', 'day', 'month', 'year',
            'freelancer_name', 'freelancer_cccd', 'cccd_date', 'cccd_place', 'freelancer_dob',
            'freelancer_address', 'freelancer_contact_address', 'freelancer_phone', 'freelancer_email',
            'freelancer_bank_account', 'freelancer_bank_name',
            'project_name', 'start_date', 'end_date',
            'total_amount', 'deposit_amount', 'deposit_percent', 'remaining_amount',
            'termination_penalty_percent', 'notice_days'
        ],
        is_default: true
    }

    const { data, error } = await supabase
        .from('document_templates')
        .upsert([template], { onConflict: 'name' })
        .select()

    if (error) {
        console.error('Error seeding template:', error)
    } else {
        console.log('Seeded template successfully:', data[0].id)
    }
}

seed()
