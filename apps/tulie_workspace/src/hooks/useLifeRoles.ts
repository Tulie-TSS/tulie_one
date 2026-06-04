'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { LifeRole } from '@/types/command-center.types'

interface UseLifeRolesResult {
  roles: LifeRole[]
  loading: boolean
  error: string | null
  getRoleById: (id: string) => LifeRole | undefined
  getRoleByType: (type: string) => LifeRole | undefined
  initializeRoles: () => Promise<void>
  refetch: () => void
  addRole: (data: { display_name: string; color: string; icon: string; daily_time_budget_minutes?: number }) => Promise<LifeRole>
  updateRole: (id: string, data: Partial<Omit<LifeRole, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<LifeRole>
  deleteRole: (id: string) => Promise<void>
}

// Helper to generate a unique role slug/key from display name
const generateRoleKey = (name: string) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "role_" + Math.random().toString(36).substring(2, 6);
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
      { user_id: user.id, role: 'fpt_is', display_name: 'FPT IS', color: '#E53935', icon: 'Briefcase', daily_time_budget_minutes: 480, priority_order: 0 },
      { user_id: user.id, role: 'tulie', display_name: 'Tulie', color: '#1E88E5', icon: 'Rocket', daily_time_budget_minutes: 120, priority_order: 1 },
      { user_id: user.id, role: 'personal', display_name: 'Cá nhân', color: '#43A047', icon: 'Home', daily_time_budget_minutes: 180, priority_order: 2 },
    ]

    const { data: insertedRoles } = await supabase.from('life_roles').insert(defaults).select()

    if (insertedRoles && insertedRoles.length > 0) {
      const fptRole = insertedRoles.find(r => r.role === 'fpt_is')
      const tulieRole = insertedRoles.find(r => r.role === 'tulie')
      const personalRole = insertedRoles.find(r => r.role === 'personal')

      const defaultHabits = [
        { user_id: user.id, name: 'Học tiếng Anh 30p', icon: 'Languages', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 0 },
        { user_id: user.id, name: 'Tập thể thao 30p', icon: 'Dumbbell', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 1 },
        { user_id: user.id, name: 'Chơi/học với con', icon: 'Baby', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 2 },
        { user_id: user.id, name: 'Ngủ trước 22h', icon: 'Moon', color: '#43A047', life_role_id: personalRole?.id, frequency: 'daily', sort_order: 3 },
        { user_id: user.id, name: 'Review & Planning', icon: 'FileText', color: '#1E88E5', life_role_id: tulieRole?.id, frequency: 'daily', sort_order: 4 },
        { user_id: user.id, name: 'Đọc tài liệu quy trình', icon: 'Briefcase', color: '#E53935', life_role_id: fptRole?.id, frequency: 'weekdays', sort_order: 5 },
      ]

      await supabase.from('habits').insert(defaultHabits)
    }

    await fetchRoles()
  }, [fetchRoles])

  const addRole = useCallback(async (data: { display_name: string; color: string; icon: string; daily_time_budget_minutes?: number }) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const roleKey = generateRoleKey(data.display_name)
    const priorityOrder = roles.length

    const newRole = {
      user_id: user.id,
      role: roleKey,
      display_name: data.display_name,
      color: data.color,
      icon: data.icon,
      daily_time_budget_minutes: data.daily_time_budget_minutes ?? 120,
      priority_order: priorityOrder,
      is_active: true
    }

    const { data: inserted, error: err } = await supabase
      .from('life_roles')
      .insert(newRole)
      .select()
      .single()

    if (err) throw err
    await fetchRoles()
    return inserted
  }, [roles, fetchRoles])

  const updateRole = useCallback(async (id: string, data: Partial<Omit<LifeRole, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: updated, error: err } = await supabase
      .from('life_roles')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (err) throw err
    await fetchRoles()
    return updated
  }, [fetchRoles])

  const deleteRole = useCallback(async (id: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error: err } = await supabase
      .from('life_roles')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (err) throw err
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
    addRole,
    updateRole,
    deleteRole
  }
}
