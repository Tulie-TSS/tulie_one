'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role_type: 'admin' | 'manager' | 'maker' | 'observer'
  organization_id: string | null
  is_active: boolean
  personal_wip_limit: number
  hofstadter_multiplier: number
  last_seen_at: string | null
  created_at: string
  updated_at: string
}

interface UseCurrentUserResult {
  user: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isManager: boolean
  isMaker: boolean
  isObserver: boolean
  canManage: boolean
  refetch: () => void
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) { setUser(null); return }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      setUser(profile)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUser() }, [])

  return {
    user,
    loading,
    isAdmin: user?.role_type === 'admin',
    isManager: user?.role_type === 'manager',
    isMaker: user?.role_type === 'maker',
    isObserver: user?.role_type === 'observer',
    canManage: user?.role_type === 'admin' || user?.role_type === 'manager',
    refetch: fetchUser,
  }
}
