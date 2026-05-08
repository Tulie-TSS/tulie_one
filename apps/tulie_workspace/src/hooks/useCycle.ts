'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { CycleRow, MilestoneRow } from './useCycles'

export interface ProjectRow {
  id: string
  name: string
  description: string | null
  status: string
  priority: string
  owner_id: string
}

export interface TaskRow {
  id: string
  title: string
  status: string
  assigned_to: string | null
  priority: number
}

interface UseCycleResult {
  cycle: (CycleRow & { milestones: MilestoneRow[] }) | null
  projects: ProjectRow[]
  tasks: TaskRow[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCycle(id: string): UseCycleResult {
  const [cycle, setCycle] = useState<(CycleRow & { milestones: MilestoneRow[] }) | null>(null)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      
      // 1. Fetch Cycle & Milestones
      const { data: cycleData, error: cycleError } = await supabase
        .from('cycles')
        .select(`
          *,
          milestones(*)
        `)
        .eq('id', id)
        .single()

      if (cycleError) throw cycleError
      setCycle(cycleData)

      // 2. Fetch Projects in this cycle
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('cycle_id', id)
      
      if (projectError) throw projectError
      setProjects(projectData || [])

      // 3. Fetch Tasks in this cycle
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, title, status, assigned_to, priority')
        .eq('cycle_id', id)
      
      if (taskError) throw taskError
      setTasks(taskData || [])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cycle details')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { cycle, projects, tasks, loading, error, refetch: fetchData }
}
