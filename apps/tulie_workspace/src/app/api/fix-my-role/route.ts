import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // 1. Get current logged in user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'You must be logged in first' }, { status: 401 })
  }

  // 2. Check if user_profile exists
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  // 3. Update or Upsert the user profile to 'admin'
  if (profile) {
    // Update
    const { error } = await supabase
      .from('user_profiles')
      .update({ role_type: 'admin' })
      .eq('id', user.id)
      
    if (error) {
      return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 })
    }
  } else {
    // Upsert if not exists
    const { error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || 'Admin User',
        role_type: 'admin',
        is_active: true,
        personal_wip_limit: 3,
        hofstadter_multiplier: 1.30,
      })
      
    if (error) {
      return NextResponse.json({ error: 'Insert failed', details: error.message }, { status: 500 })
    }
  }

  // 4. Redirect back to dashboard
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
