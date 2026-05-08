import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

// DELETE /api/users/[id]/delete — Admin only: permanently delete a user
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Cannot delete yourself
    if (user.id === id) {
      return NextResponse.json({ error: 'Không thể xoá chính mình.' }, { status: 400 })
    }

    const { data: me } = await supabase
      .from('user_profiles')
      .select('role_type')
      .eq('id', user.id)
      .single()

    if (me?.role_type !== 'admin') {
      return NextResponse.json({ error: 'Chỉ Admin mới có quyền xoá thành viên.' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Check target user is not admin
    const { data: target } = await adminClient
      .from('user_profiles')
      .select('role_type')
      .eq('id', id)
      .single()

    if (target?.role_type === 'admin') {
      return NextResponse.json({ error: 'Không thể xoá tài khoản Admin.' }, { status: 403 })
    }

    // Delete from auth.users (will cascade to user_profiles if FK is set up)
    const { error: authError } = await adminClient.auth.admin.deleteUser(id)
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Also delete from user_profiles in case no cascade
    await adminClient.from('user_profiles').delete().eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Lỗi server.' }, { status: 500 })
  }
}
