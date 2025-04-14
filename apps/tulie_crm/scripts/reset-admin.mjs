import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = readFileSync('.env.local', 'utf8')
const getEnv = (key) => {
    const match = env.match(new RegExp(`${key}="([^"]+)"`))
    return match ? match[1] : null
}

const supabase = createClient(
    getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { autoRefreshToken: false, persistSession: false } }
)

const email = 'tung68.nt@gmail.com'
const password = 'Standup001#'

async function reset() {
  try {
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers()
    if (usersError) throw usersError
    
    let user = usersData.users.find(u => u.email === email)
    
    if (user) {
      console.log('User found. Updating password...')
      await supabase.auth.admin.updateUserById(user.id, { password, email_confirm: true })
    } else {
      console.log('User not found. Creating...')
      const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) throw error
      user = data.user
    }
    
    console.log(`Updating profile role to admin for ${user.id}...`)
    // Determine profile table (CRM usually uses users or staff or profiles)
    // Here we assume "users" as per typical CRM setup.
    const { data: profile, error } = await supabase.from('users').select('*').eq('id', user.id).single()
    
    if (profile) {
      await supabase.from('users').update({ role: 'admin' }).eq('id', user.id)
    } else {
      await supabase.from('users').insert({ id: user.id, email, full_name: 'CRM Admin', role: 'admin', is_active: true })
    }
    console.log('✅ Done!')
  } catch(e) {
    console.error('Error:', e.message)
  }
}
reset()
