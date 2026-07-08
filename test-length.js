const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/tulie_crm/.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
    const { data } = await supabase.from('customers').select('phone').eq('customer_type', 'individual');
    console.log("Total individuals:", data.length);
}
run();
