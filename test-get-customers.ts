import { getCustomers } from './apps/tulie_crm/lib/supabase/services/customer-service';
async function run() {
    const customers = await getCustomers('individual');
    customers.slice(0, 3).forEach(c => {
        console.log(c.company_name, c.phone, c.quotation_revenue, c.actual_revenue);
    });
}
run();
