const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/tulie_crm/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: customers } = await supabase
        .from('customers')
        .select('*, retail_orders(id, customer_phone, total_amount)')
        .eq('customer_type', 'individual');
    
    customers.forEach(c => {
        if (c.retail_orders && c.retail_orders.length > 0) {
            console.log(`Customer: ${c.company_name} | Phone: ${c.phone} | FK Orders: ${c.retail_orders.length}`);
        }
    });
}
run();
