const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: quotation, error: qError } = await supabase
        .from('quotations')
        .select('*, customer:customers(*), items:quotation_items(*)')
        .eq('id', 'ffeb5f9d-a4e1-45dd-a5a2-eb0b41644b88')
        .single();
    if (qError) {
        console.log('Quotation fetch error:', qError);
        return;
    }
    console.log('Quotation found:', quotation.id);

    const contractPayload = {
        contract_number: 'TEST-1234',
        customer_id: quotation.customer_id,
        quotation_id: quotation.id,
        title: quotation.title || `Đơn hàng từ ${quotation.quotation_number}`,
        total_amount: quotation.total_amount,
        status: 'draft',
        type: 'contract',
        start_date: new Date().toISOString().split('T')[0],
        terms: quotation.terms,
        brand: quotation.brand,
        project_id: quotation.project_id,
        public_token: 'ct_test_token'
    };

    const { data: contract, error: cError } = await supabase
        .from('contracts')
        .insert([contractPayload])
        .select()
        .single();

    if (cError) {
        console.log('Contract insert error:', cError);
    } else {
        console.log('Contract inserted:', contract.id);
    }
}
check();
