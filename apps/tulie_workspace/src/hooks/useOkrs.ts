'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface Objective {
  id: string
  title: string
  description: string | null
  level: 'company' | 'department' | 'team' | 'individual'
  parent_objective_id: string | null
  owner_id: string
  department_id: string | null
  cycle_id: string | null
  status: string
  progress_percentage: number
  key_results?: KeyResult[]
  owner?: { full_name: string; avatar_url: string | null }
}

export interface KeyResult {
  id: string
  objective_id: string
  title: string
  current_value: number
  target_value: number
  unit: string
  weight: number
}

export function useOkrs(filter?: { level?: string; cycleId?: string; ownerId?: string }) {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOkrs = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      let query = supabase
        .from('objectives')
        .select(`
          *,
          key_results(*),
          owner:user_profiles!owner_id(full_name, avatar_url)
        `)
        .order('level', { ascending: true })

      if (filter?.level) query = query.eq('level', filter.level)
      if (filter?.cycleId) query = query.eq('cycle_id', filter.cycleId)
      if (filter?.ownerId) query = query.eq('owner_id', filter.ownerId)

      const { data, error: err } = await query
      if (err) throw err
      setObjectives(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch OKRs')
    } finally {
      setLoading(false)
    }
  }, [filter?.level, filter?.cycleId, filter?.ownerId])

  useEffect(() => {
    fetchOkrs()
  }, [fetchOkrs])

  return { objectives, loading, error, refetch: fetchOkrs }
}
