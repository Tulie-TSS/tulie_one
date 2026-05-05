import { createClient } from '@supabase/supabase-js'
import { generateDocumentBundle } from './lib/supabase/services/document-template-service'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runTest() {
  const { data: contract } = await supabase
    .from('contracts')
    .select('id, contract_number')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!contract) {
    console.error('No contract found')
    return
  }

  console.log(`Regenerating documents for contract: ${contract.contract_number} (${contract.id})`)
  
  try {
    const bundle = await generateDocumentBundle(contract.id)
    console.log('Success! Bundle ID:', bundle.id)
    
    // Log the content of the first generated document to verify HTML
    const { data: docs } = await supabase
        .from('generated_documents')
        .select('content, template_name')
        .eq('bundle_id', bundle.id)
        .limit(1)
    
    if (docs && docs[0]) {
        console.log('--- HTML PREVIEW (Last 500 chars) ---')
        console.log(docs[0].content.slice(-1000))
    }
  } catch (err) {
    console.error('Error:', err)
  }
}

runTest()
