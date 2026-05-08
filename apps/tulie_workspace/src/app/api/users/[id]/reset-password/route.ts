import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// POST /api/users/[id]/reset-password — Admin only: generate a password recovery link
export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: me } = await supabase
      .from('user_profiles')
      .select('role_type')
      .eq('id', user.id)
      .single()

    if (me?.role_type !== 'admin') {
      return NextResponse.json({ error: 'Chỉ Admin mới có quyền reset mật khẩu.' }, { status: 403 })
    }

    const { id } = await params
    const adminClient = createAdminClient()

    // Get user email
    const { data: profile } = await adminClient
      .from('user_profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (!profile?.email) {
      return NextResponse.json({ error: 'Không tìm thấy thành viên.' }, { status: 404 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://workspace.tulie.app'

    // Generate recovery link
    const { data: recoveryData, error } = await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email: profile.email,
      options: {
        redirectTo: `${siteUrl}/auth/callback?next=/settings/profile` // Redirect to profile page to change pwd
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      recoveryLink: recoveryData.properties.action_link 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server.' }, { status: 500 })
  }
}
