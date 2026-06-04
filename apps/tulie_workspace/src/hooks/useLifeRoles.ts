'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { LifeRole, LifeRoleType, DEFAULT_LIFE_ROLES } from '@/types/command-center.types'

interface UseLifeRolesResult {
  roles: LifeRole[]
  loading: boolean
  error: string | null
  getRoleById: (id: string) => LifeRole | undefined
  getRoleByType: (type: LifeRoleType) => LifeRole | undefined
  initializeRoles: () => Promise<void>
  refetch: () => void
}

export function useLifeRoles(): UseLifeRolesResult {
  const [roles, setRoles] = useState<LifeRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setRoles([]); return }

      const { data, error: err } = await supabase
        .from('life_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('priority_order')

      if (err) throw err
      setRoles(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles')
    } finally {
      setLoading(false)
    }
  }, [])

  const initializeRoles = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Check if roles already exist
    const { count } = await supabase
      .from('life_roles')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) > 0) return // Already initialized

    // Create default roles
    const defaults = [
      { user_id: user.id, role: 'fpt_is' as const, display_name: 'FPT IS', color: '#E53935', icon: '🏢', daily_time_budget_minutes: 480, priority_order: 0 },
      { user_id: user.id, role: 'tulie' as const, display_name: 'Tulie', color: '#1E88E5', icon: '🚀', daily_time_budget_minutes: 120, priority_order: 1 },
      { user_id: user.id, role: 'personal' as const, display_name: 'Cá nhân', color: '#43A047', icon: '🏠', daily_time_budget_minutes: 180, priority_order: 2 },
    ]

    const { data: insertedRoles } = await supabase.from('life_roles').insert(defaults).select()

    if (insertedRoles && insertedRoles.length > 0) {
      const fptRole = insertedRoles.find(r => r.role === 'fpt_is')
      const tulieRole = insertedRoles.find(r => r.role === 'tulie')
      const personalRole = insertedRoles.find(r => r.role === 'personal')

      const defaultHabits = [
        { user_id: user.id, name: 'Học tiếng Anh 30p', icon: '🇬🇧', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 0 },
        { user_id: user.id, name: 'Tập thể thao 30p', icon: '🏋️', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 1 },
        { user_id: user.id, name: 'Chơi/học với con', icon: '👶', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 2 },
        { user_id: user.id, name: 'Ngủ trước 22h', icon: '😴', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 3 },
        { user_id: user.id, name: 'Review & Planning', icon: '📝', color: '#1E88E5', life_role_id: tulieRole?.id, frequency: 'daily', sort_order: 4 },
        { user_id: user.id, name: 'Đọc tài liệu quy trình', icon: '🏢', color: '#E53935', life_role_id: fptRole?.id, frequency: 'weekdays', sort_order: 5 },
      ]

      await supabase.from('habits').insert(defaultHabits)
    }

    await fetchRoles()
  }, [fetchRoles])

  useEffect(() => { fetchRoles() }, [fetchRoles])

  return {
    roles,
    loading,
    error,
    getRoleById: (id) => roles.find(r => r.id === id),
    getRoleByType: (type) => roles.find(r => r.role === type),
    initializeRoles,
    refetch: fetchRoles,
  }
}
