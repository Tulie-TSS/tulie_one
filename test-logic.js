const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/tulie_crm/.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data } = await supabase
        .from('customers')
        .select('*, quotations(total_amount, status), contracts(total_amount, status), retail_orders(total_amount, paid_amount, payment_status, order_status)')
        .eq('customer_type', 'individual')
        .order('created_at', { ascending: false });

    const individualCustomers = (data || []).filter((c) => c.customer_type === 'individual' && c.phone);
    const phoneNumbers = individualCustomers.map((c) => c.phone).filter(Boolean);
    
    let ordersByPhone = {};
    if (phoneNumbers.length > 0) {
        const { data: phoneOrders } = await supabase
            .from('retail_orders')
            .select('customer_phone, total_amount, paid_amount, payment_status, order_status, customer_id')
            .in('customer_phone', phoneNumbers);
        
        if (phoneOrders) {
            for (const order of phoneOrders) {
                const phone = order.customer_phone;
                if (!ordersByPhone[phone]) ordersByPhone[phone] = [];
                ordersByPhone[phone].push(order);
            }
        }
    }

    const customersWithRevenue = (data || []).map((customer) => {
        let quotationRevenue = 0;
        let actualRevenue = 0;
        
        if (customer.customer_type === 'individual') {
            const fkOrders = customer.retail_orders || [];
            const phoneMatchedOrders = customer.phone ? (ordersByPhone[customer.phone] || []) : [];
            const allOrders = phoneMatchedOrders.length > 0 ? phoneMatchedOrders : fkOrders;
            
            quotationRevenue = allOrders
                .filter((o) => o.order_status !== 'cancelled')
                .reduce((sum, o) => sum + (o.total_amount || 0), 0);
            
            actualRevenue = allOrders
                .filter((o) => o.order_status !== 'cancelled')
                .reduce((sum, o) => sum + (o.paid_amount || 0), 0);
        }
            
        return {
            company_name: customer.company_name,
            phone: customer.phone,
            quotation_revenue: quotationRevenue,
            actual_revenue: actualRevenue
        };
    });

    console.log(customersWithRevenue.filter(c => c.company_name === 'PHẠM KINH HÙNG'));
}
run();
