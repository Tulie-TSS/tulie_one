import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/users/[id]/role  — Admin only: change role + WIP limit
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: me } = await supabase
    .from('user_profiles')
    .select('role_type')
    .eq('id', user.id)
    .single()

  if (!['admin', 'manager'].includes(me?.role_type)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Admin can change any role; manager can only change maker/observer
  const allowed = ['maker', 'observer']
  if (me?.role_type === 'manager' && !allowed.includes(body.role_type)) {
    return NextResponse.json({ error: 'Managers cannot grant admin/manager roles' }, { status: 403 })
  }

  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body.role_type) updateData.role_type = body.role_type
  if (body.personal_wip_limit) updateData.personal_wip_limit = body.personal_wip_limit
  if (body.is_active !== undefined) updateData.is_active = body.is_active

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
