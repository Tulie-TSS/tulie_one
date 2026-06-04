'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Habit, HabitLog } from '@/types/command-center.types'

interface UseHabitsResult {
  habits: Habit[]
  loading: boolean
  error: string | null
  toggleHabit: (habitId: string, date?: string) => Promise<void>
  logHabitValue: (habitId: string, value: number, notes?: string) => Promise<void>
  createHabit: (habit: Partial<Habit>) => Promise<void>
  updateHabit: (id: string, fields: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  refetch: () => void
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useHabits(): UseHabitsResult {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHabits = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setHabits([]); return }

      const today = todayStr()

      // Fetch habits
      const { data: habitsData, error: err } = await supabase
        .from('habits')
        .select(`
          *,
          life_role:life_roles(id, role, display_name, color, icon)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('sort_order')

      if (err) throw err

      // Fetch today's logs
      const habitIds = (habitsData || []).map(h => h.id)
      let logs: HabitLog[] = []
      if (habitIds.length > 0) {
        const { data: logsData } = await supabase
          .from('habit_logs')
          .select('*')
          .in('habit_id', habitIds)
          .eq('log_date', today)

        logs = logsData || []
      }

      // Merge logs into habits
      const merged = (habitsData || []).map(h => ({
        ...h,
        today_log: logs.find(l => l.habit_id === h.id) || null,
      }))

      setHabits(merged)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  const toggleHabit = useCallback(async (habitId: string, date?: string) => {
    const supabase = createClient()
    const logDate = date || todayStr()

    // Check existing log
    const { data: existing } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('habit_id', habitId)
      .eq('log_date', logDate)
      .single()

    if (existing) {
      // Toggle
      await supabase
        .from('habit_logs')
        .update({ completed: !existing.completed })
        .eq('id', existing.id)
    } else {
      // Create
      await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, log_date: logDate, completed: true })
    }

    // Update streak
    const habit = habits.find(h => h.id === habitId)
    if (habit) {
      const newStreak = existing?.completed ? Math.max(0, habit.streak_current - 1) : habit.streak_current + 1
      const bestStreak = Math.max(habit.streak_best, newStreak)
      await supabase
        .from('habits')
        .update({ streak_current: newStreak, streak_best: bestStreak })
        .eq('id', habitId)
    }

    await fetchHabits()
  }, [habits, fetchHabits])

  const logHabitValue = useCallback(async (habitId: string, value: number, notes?: string) => {
    const supabase = createClient()
    const logDate = todayStr()

    await supabase
      .from('habit_logs')
      .upsert(
        { habit_id: habitId, log_date: logDate, completed: true, value, notes },
        { onConflict: 'habit_id,log_date' }
      )

    await fetchHabits()
  }, [fetchHabits])

  const createHabit = useCallback(async (habit: Partial<Habit>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('habits').insert({ ...habit, user_id: user.id })
    await fetchHabits()
  }, [fetchHabits])

  const updateHabit = useCallback(async (id: string, fields: Partial<Habit>) => {
    const supabase = createClient()
    await supabase.from('habits').update(fields).eq('id', id)
    await fetchHabits()
  }, [fetchHabits])

  const deleteHabit = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('habits').update({ is_active: false }).eq('id', id)
    await fetchHabits()
  }, [fetchHabits])

  return {
    habits,
    loading,
    error,
    toggleHabit,
    logHabitValue,
    createHabit,
    updateHabit,
    deleteHabit,
    refetch: fetchHabits,
  }
}
