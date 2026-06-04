'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  cycle_id: string
  owner_id: string | null
  organization_id: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  life_role_id?: string | null
  // computed
  task_count?: number
  done_count?: number
  owner?: { id: string; full_name: string } | null
}

interface UseProjectsResult {
  projects: ProjectRow[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProjects(cycleId?: string): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()

      // Get current user to check role
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setProjects([])
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
        .from('projects')
        .select(`
          *,
          owner:user_profiles!projects_owner_id_fkey(id, full_name)
        `)
        .order('priority', { ascending: false })

      if (cycleId) {
        query = query.eq('cycle_id', cycleId)
      }

      // Role-based filtering for projects
      if (isMakerOrObserver) {
        // Only show projects where the user has at least one task assigned
        const { data: userTasks } = await supabase
          .from('tasks')
          .select('project_id')
          .eq('assigned_to', authUser.id)
          .not('project_id', 'is', null)

        const projectIds = Array.from(new Set((userTasks || []).map(t => t.project_id)))
        
        if (projectIds.length === 0) {
          setProjects([])
          setLoading(false)
          return
        }
        
        query = query.in('id', projectIds)
      }

      const { data, error: err } = await query
      if (err) throw err

      // Fetch task counts separately for each project
      const projectsWithCounts = await Promise.all(
        (data || []).map(async (project: any) => {
          const { count: taskCount } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id)
          
          const { count: doneCount } = await supabase
            .from('tasks')
            .select('id', { count: 'exact', head: true })
            .eq('project_id', project.id)
            .eq('status', 'done')

          return {
            ...project,
            task_count: taskCount ?? 0,
            done_count: doneCount ?? 0,
          }
        })
      )

      setProjects(projectsWithCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [cycleId])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects }
}
