'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  cycle_id: string | null
  owner_id: string
  created_at: string
  life_role_id?: string | null
}

export interface TaskRow {
  id: string
  title: string
  status: string
  assigned_to: string | null
  priority: number
  estimated_effort_hours: number
}

interface UseProjectResult {
  project: ProjectRow | null
  tasks: TaskRow[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProject(id: string): UseProjectResult {
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      
      // 1. Fetch Project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError
      setProject(projectData)

      // 2. Fetch Tasks in this project
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status, assigned_to, priority, estimated_effort_hours')
        .eq('project_id', id)
      
      if (taskError) throw taskError
      setTasks(taskData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { project, tasks, loading, error, refetch: fetchData }
}
