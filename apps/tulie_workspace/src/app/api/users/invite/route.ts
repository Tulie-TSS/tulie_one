import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Check if current user is admin
    const { data: me } = await supabase
      .from('user_profiles')
      .select('role_type')
      .eq('id', user.id)
      .single()

    if (me?.role_type !== 'admin') {
      return NextResponse.json({ error: 'Chỉ Admin mới có quyền mời thành viên.' }, { status: 403 })
    }

    const body = await request.json()
    const { email, full_name, role_type } = body

    if (!email || !full_name || !role_type) {
      return NextResponse.json({ error: 'Thiếu thông tin yêu cầu.' }, { status: 400 })
    }

    const adminAuthClient = createAdminClient()

    // 1. Generate invite link via Supabase Auth Admin
    // This allows us to get the link manually in case email is rate limited
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspace.tulie.app'
    const { data: inviteData, error: inviteError } = await adminAuthClient.auth.admin.generateLink({
      type: 'invite',
      email,
      options: {
        data: { full_name: full_name },
        redirectTo: `${siteUrl}/auth/callback`
      }
    })

    if (inviteError || !inviteData?.properties) {
      return NextResponse.json({ error: inviteError?.message || 'Không thể tạo link mời.' }, { status: 400 })
    }

    const newUserId = inviteData.user.id
    const hashedToken = inviteData.properties.hashed_token
    const inviteLink = `${siteUrl}/auth/callback?token_hash=${hashedToken}&type=invite`

    // 2. Add user to user_profiles table if trigger doesn't do it, or update it
    // Usually there's a trigger on auth.users -> user_profiles, but we need to set the role_type.
    // Let's just do an upsert or update in case the trigger already created it.
    const { error: profileError } = await adminAuthClient
      .from('user_profiles')
      .upsert({
        id: newUserId,
        email: email,
        full_name: full_name,
        role_type: role_type,
        personal_wip_limit: 2,
        is_active: true
      })

    if (profileError) {
      // It might fail if the user already exists in user_profiles but we can ignore or return error.
      // Actually, if the trigger creates it, we just update it.
      await adminAuthClient
        .from('user_profiles')
        .update({
          full_name: full_name,
          role_type: role_type
        })
        .eq('id', newUserId)
    }

    return NextResponse.json({ success: true, user: inviteData.user, inviteLink })

  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error.message || 'Lỗi server.' }, { status: 500 })
  }
}
