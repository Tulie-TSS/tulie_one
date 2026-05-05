const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('contracts').insert({
    contract_number: 'TEST-123',
    title: 'Test',
    total_amount: 1000,
    status: 'draft',
    type: 'contract',
    category: 'freelancer',
    brand: 'TMM'
  });
  console.log(error);
}
run();
