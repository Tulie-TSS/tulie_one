const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/tulie_crm/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: phoneOrders } = await supabase.from('retail_orders').select('customer_phone, total_amount, paid_amount, order_status');
    console.log("Phone orders:", phoneOrders);
}
run();
