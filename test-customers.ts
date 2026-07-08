import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: 'apps/tulie_crm/.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
    const { data: customers } = await supabase
        .from('customers')
        .select('*, quotations(total_amount, status), contracts(total_amount, status), retail_orders(total_amount, paid_amount, payment_status, order_status)')
        .eq('customer_type', 'individual')
        .order('created_at', { ascending: false })
        .limit(5)

    console.log(JSON.stringify(customers, null, 2))
}
run()
