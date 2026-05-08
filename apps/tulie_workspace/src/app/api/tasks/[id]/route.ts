import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// PATCH /api/tasks/[id] — update status (with WIP check)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // WIP enforcement: if moving to 'doing', check limit
  if (body.status === 'doing') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('personal_wip_limit, role_type')
      .eq('id', user.id)
      .single()

    const wipLimit = profile?.personal_wip_limit ?? 2

    // Get the task to find its assignee
    const { data: task } = await supabase
      .from('tasks')
      .select('assigned_to')
      .eq('id', id)
      .single()

    const assigneeId = task?.assigned_to ?? user.id

    const { count } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to', assigneeId)
      .eq('status', 'doing')

    if ((count ?? 0) >= wipLimit) {
      // Allow managers/admins to override
      if (profile?.role_type !== 'admin' && profile?.role_type !== 'manager') {
        return NextResponse.json({
          error: 'WIP_LIMIT_EXCEEDED',
          wipViolation: true,
          doingCount: count,
          wipLimit,
        }, { status: 422 })
      }
    }
  }

  // Build update payload
  const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
  if (body.status !== undefined) updateData.status = body.status
  if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to
  if (body.priority !== undefined) updateData.priority = body.priority
  if (body.eisenhower_quadrant !== undefined) updateData.eisenhower_quadrant = body.eisenhower_quadrant
  if (body.milestone_id !== undefined) updateData.milestone_id = body.milestone_id

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Only admin/manager can delete
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role_type')
    .eq('id', user.id)
    .single()

  if (!['admin', 'manager'].includes(profile?.role_type)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
