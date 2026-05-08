import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// GET /api/tasks
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const assignedTo = searchParams.get('assigned_to')
  const projectId = searchParams.get('project_id')
  const cycleId = searchParams.get('cycle_id')

  let query = supabase
    .from('tasks')
    .select(`
      *,
      assignee:user_profiles!tasks_assigned_to_fkey(id, full_name, email),
      project:projects(id, name),
      tags:task_tags(tag:tags(id, name, color))
    `)
    .order('priority', { ascending: false })

  if (status) query = query.eq('status', status)
  if (assignedTo) query = query.eq('assigned_to', assignedTo)
  if (projectId) query = query.eq('project_id', projectId)
  if (cycleId) query = query.eq('cycle_id', cycleId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const normalized = (data || []).map((t: any) => ({
    ...t,
    tags: t.tags?.map((tt: any) => tt.tag).filter(Boolean) || [],
  }))

  return NextResponse.json(normalized)
}

// POST /api/tasks
export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...body,
      created_by: user.id,
      status: 'intake',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
