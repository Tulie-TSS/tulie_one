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
      const { data, error: err } = await supabase
        .from('cycles')
        .select(`
          *,
          milestones(*)
        `)
        .order('start_date', { ascending: false })

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
