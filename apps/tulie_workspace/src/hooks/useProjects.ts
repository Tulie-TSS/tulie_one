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
