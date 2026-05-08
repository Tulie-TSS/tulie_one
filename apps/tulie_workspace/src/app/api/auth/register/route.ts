import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// POST /api/auth/register — create auth user + user_profiles record
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { email, password, fullName, roleType = 'maker' } = body

  // 1. Sign up with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })
  if (!authData.user) return NextResponse.json({ error: 'User creation failed' }, { status: 500 })

  // 2. Get the org (use first org found, or a default org ID)
  const { data: orgs } = await supabase.from('organizations').select('id').limit(1)
  const orgId = orgs?.[0]?.id ?? null

  // 3. Create user_profiles record (auto-trigger may handle this too, but we ensure it)
  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: authData.user.id,
    email,
    full_name: fullName,
    role_type: roleType,
    organization_id: orgId,
    is_active: true,
    personal_wip_limit: roleType === 'maker' ? 2 : 3,
    hofstadter_multiplier: 1.30,
  })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // Don't fail — auth user created, profile can be set later
  }

  return NextResponse.json({ success: true, userId: authData.user.id })
}
