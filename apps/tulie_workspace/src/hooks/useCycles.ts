'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface CycleRow {
  id: string
  name: string
  organization_id: string
  parent_cycle_id: string | null
  start_date: string
  end_date: string
  buffer_week_start: string
  status: string
  goals: { title: string; progress: number }[]
  created_by: string | null
  created_at: string
  updated_at: string
  milestones?: MilestoneRow[]
}

export interface MilestoneRow {
  id: string
  cycle_id: string
  name: string
  description: string | null
  target_date: string
  completion_rate: number
  sort_order: number
}

interface UseCyclesResult {
  cycles: CycleRow[]
  activeCycle: CycleRow | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCycles(): UseCyclesResult {
  const [cycles, setCycles] = useState<CycleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCycles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      
      // Get current user to check role
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        setCycles([])
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
        .from('cycles')
        .select(`
          *,
          milestones(*)
        `)
        .order('start_date', { ascending: false })

      // Role-based filtering for cycles
      if (isMakerOrObserver) {
        // Only show cycles where the user has at least one task assigned
        // We use a separate query to get cycle IDs first for simplicity and reliability with current schema
        const { data: userTasks } = await supabase
          .from('tasks')
          .select('cycle_id')
          .eq('assigned_to', authUser.id)
          .not('cycle_id', 'is', null)

        const cycleIds = Array.from(new Set((userTasks || []).map(t => t.cycle_id)))
        
        if (cycleIds.length === 0) {
          setCycles([])
          setLoading(false)
          return
        }
        
        query = query.in('id', cycleIds)
      }

      const { data, error: err } = await query

      if (err) throw err
      setCycles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cycles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCycles()
  }, [fetchCycles])

  const activeCycle = cycles.find(c => c.status === 'active') ?? null

  return { cycles, activeCycle, loading, error, refetch: fetchCycles }
}
