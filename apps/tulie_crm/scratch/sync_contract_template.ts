import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Read the content from the file to ensure accuracy
const filePath = path.join(process.cwd(), 'lib/supabase/services/contract-template.ts')
const fileContent = fs.readFileSync(filePath, 'utf-8')

// Extract the template string using regex
const templateMatch = fileContent.match(/export const contractTemplate = `([\s\S]*)`/m)
if (!templateMatch) {
    console.error('Could not find contractTemplate string in file')
    process.exit(1)
}
const contractTemplate = templateMatch[1]

async function update() {
    console.log('Updating Contract template in database...')
    const { error } = await supabase
        .from('document_templates')
        .update({ content: contractTemplate })
        .eq('type', 'contract')
    
    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Success! Updated Contract template.')
    }
}

update()
