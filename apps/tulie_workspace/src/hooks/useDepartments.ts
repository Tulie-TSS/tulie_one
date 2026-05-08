'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface Department {
  id: string
  name: string
  description: string | null
  parent_id: string | null
  manager_id: string | null
  organization_id: string
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true })

      if (err) throw err
      setDepartments(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return { departments, loading, error, refetch: fetchDepartments }
}
