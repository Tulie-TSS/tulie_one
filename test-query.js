const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/tulie_crm/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: customers, error } = await supabase
        .from('customers')
        .select('*, quotations(total_amount, status), contracts(total_amount, status), retail_orders(total_amount, paid_amount, payment_status, order_status)')
        .eq('customer_type', 'individual')
        .order('created_at', { ascending: false })
        .limit(3);

    console.log("Error:", error);
    if (customers) {
        customers.forEach(c => {
            console.log(c.company_name, c.phone, c.retail_orders);
        });
        const phones = customers.map(c => c.phone).filter(Boolean);
        const { data: phoneOrders } = await supabase.from('retail_orders').select('customer_phone, total_amount, paid_amount').in('customer_phone', phones);
        console.log("Phone orders:", phoneOrders);
    }
}
run();
