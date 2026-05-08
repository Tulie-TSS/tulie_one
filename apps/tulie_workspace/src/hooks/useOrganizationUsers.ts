'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'

export interface OrgUser {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  role_type: string
  department_id: string | null
}

export function useOrganizationUsers() {
  const [users, setUsers] = useState<OrgUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, role_type, department_id')
        .order('full_name', { ascending: true })

      if (err) throw err
      setUsers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}
