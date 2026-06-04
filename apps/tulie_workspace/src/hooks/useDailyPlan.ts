'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { DailyPlan } from '@/types/command-center.types'

interface UseDailyPlanResult {
  plan: DailyPlan | null
  loading: boolean
  error: string | null
  logSleep: (hours: number, quality: number) => Promise<void>
  logExercise: (type: string, minutes: number) => Promise<void>
  logMood: (score: number) => Promise<void>
  updateCompletion: (planned: number, completed: number) => Promise<void>
  refetch: () => void
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function useDailyPlan(): UseDailyPlanResult {
  const [plan, setPlan] = useState<DailyPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrCreate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setPlan(null); return }

      const today = todayStr()

      // Try to get today's plan
      let { data, error: err } = await supabase
        .from('daily_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('plan_date', today)
        .single()

      if (err && err.code === 'PGRST116') {
        // No plan for today → create one
        const { data: newPlan, error: insertErr } = await supabase
          .from('daily_plans')
          .insert({ user_id: user.id, plan_date: today })
          .select()
          .single()

        if (insertErr) throw insertErr
        data = newPlan
      } else if (err) {
        throw err
      }

      setPlan(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch daily plan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchOrCreate() }, [fetchOrCreate])

  const updateField = useCallback(async (fields: Partial<DailyPlan>) => {
    if (!plan) return
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('daily_plans')
      .update(fields)
      .eq('id', plan.id)
      .select()
      .single()

    if (!err && data) setPlan(data)
  }, [plan])

  const logSleep = useCallback(async (hours: number, quality: number) => {
    await updateField({ sleep_hours: hours, sleep_quality: quality } as any)
  }, [updateField])

  const logExercise = useCallback(async (type: string, minutes: number) => {
    await updateField({ exercise_done: true, exercise_type: type, exercise_minutes: minutes } as any)
  }, [updateField])

  const logMood = useCallback(async (score: number) => {
    await updateField({ mood_score: score } as any)
  }, [updateField])

  const updateCompletion = useCallback(async (planned: number, completed: number) => {
    const rate = planned > 0 ? Math.round((completed / planned) * 100) : 0
    await updateField({
      total_tasks_planned: planned,
      total_tasks_completed: completed,
      completion_rate: rate,
    } as any)
  }, [updateField])

  return {
    plan,
    loading,
    error,
    logSleep,
    logExercise,
    logMood,
    updateCompletion,
    refetch: fetchOrCreate,
  }
}
