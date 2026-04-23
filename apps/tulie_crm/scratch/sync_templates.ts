import { createClient } from '@supabase/supabase-js'
import { contractTemplate } from './lib/supabase/services/contract-template'
import { paymentTemplate } from './lib/supabase/services/payment-template'
import { orderTemplate } from './lib/supabase/services/order-template'
import { deliveryMinutesTemplate } from './lib/supabase/services/delivery-minutes-template'
import { quotationTemplate } from './lib/supabase/services/quotation-template'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function syncTemplates() {
  const templates = [
    { type: 'quotation', content: quotationTemplate },
    { type: 'contract', content: contractTemplate },
    { type: 'order', content: orderTemplate },
    { type: 'payment_request', content: paymentTemplate },
    { type: 'delivery_minutes', content: deliveryMinutesTemplate }
  ]

  console.log('Syncing templates to database...')

  for (const t of templates) {
    const { error } = await supabase
      .from('document_templates')
      .update({ content: t.content })
      .eq('type', t.type)

    if (error) {
      console.error(`Error updating ${t.type}:`, error)
    } else {
      console.log(`Updated ${t.type} template successfully.`)
    }
  }

  console.log('Sync complete.')
}

syncTemplates()
