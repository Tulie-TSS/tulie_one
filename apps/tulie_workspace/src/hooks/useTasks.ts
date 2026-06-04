'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { TaskStatus } from '@/types/database.types'

export interface TaskRow {
  id: string
  title: string
  description: string | null
  project_id: string
  created_by: string | null
  assigned_to: string | null
  status: TaskStatus
  eisenhower_quadrant: string | null
  estimated_effort_hours: number
  hofstadter_multiplier: number
  scheduled_duration_hours: number
  requested_deadline: string | null
  scheduled_start: string | null
  scheduled_end: string | null
  actual_start: string | null
  actual_end: string | null
  priority: number
  cycle_id: string | null
  milestone_id: string | null
  carried_over_count: number
  created_at: string
  updated_at: string
  // personal command center columns
  life_role_id?: string | null
  energy_required?: 'high' | 'medium' | 'low' | 'exhausted'
  due_time?: string | null
  streak_count?: number
  last_completed_date?: string | null
  // joined
  assignee?: { id: string; full_name: string; email: string } | null
  project?: { id: string; name: string } | null
  tags?: { id: string; name: string; color: string }[]
}

interface UseTasksResult {
  tasks: TaskRow[]
  loading: boolean
  error: string | null
  refetch: () => void
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<{ success: boolean; wipViolation?: boolean; doingCount?: number; wipLimit?: number }>
}

export function useTasks(filters?: { status?: TaskStatus; assignedTo?: string }): UseTasksResult {
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      
      // Get current user to check role
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setTasks([])
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role_type')
        .eq('id', authUser.id)
        .single()

      const isMakerOrObserver = profile?.role_type === 'maker' || profile?.role_type === 'observer'

      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignee:user_profiles!tasks_assigned_to_fkey(id, full_name, email),
          project:projects(id, name),
          tags:task_tags(tag:tags(id, name, color))
        `)
        .order('priority', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // Role-based filtering
      if (profile?.role_type === 'observer') {
        // Observers only see their own tasks
        query = query.eq('assigned_to', authUser.id)
      } else if (filters?.assignedTo) {
        // Admins/Managers/Makers can filter by any user
        query = query.eq('assigned_to', filters.assignedTo)
      }

      const { data, error: err } = await query
      if (err) throw err

      // Flatten tags from nested structure
      const normalized = (data || []).map((t: any) => ({
        ...t,
        tags: t.tags?.map((tt: any) => tt.tag).filter(Boolean) || [],
      }))

      setTasks(normalized)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [filters?.status, filters?.assignedTo])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      const supabase = createClient()

      // WIP check: if moving to 'doing', check limit
      if (newStatus === 'doing') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('personal_wip_limit')
            .eq('id', user.id)
            .single()

          const wipLimit = profile?.personal_wip_limit ?? 2

          const { count } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('assigned_to', user.id)
            .eq('status', 'doing')

          if ((count ?? 0) >= wipLimit) {
            return { success: false, wipViolation: true, doingCount: count ?? 0, wipLimit }
          }
        }
      }

      const { error: err } = await supabase
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId)

      if (err) throw err

      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      return { success: true }
    } catch {
      return { success: false }
    }
  }, [])

  return { tasks, loading, error, refetch: fetchTasks, updateTaskStatus }
}
