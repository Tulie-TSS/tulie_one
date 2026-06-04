'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useDailyPlan } from './useDailyPlan'

export interface TimeBlock {
    id?: string
    user_id: string
    daily_plan_id: string
    block_type: 'deep_work' | 'meeting' | 'admin' | 'learning' | 'exercise' | 'family' | 'rest'
    life_role_id: string | null
    start_time: string // Format: 'HH:MM:SS' or 'HH:MM'
    end_time: string   // Format: 'HH:MM:SS' or 'HH:MM'
    title: string
    is_completed: boolean
    notes?: string | null
}

const DEFAULT_BLOCKS = [
    { start_time: '06:30', end_time: '08:30', block_type: 'rest', title: 'Thức dậy / Morning routine', roleKey: 'personal' },
    { start_time: '08:30', end_time: '12:00', block_type: 'deep_work', title: 'FPT IS — Bắt đầu làm việc', roleKey: 'fpt' },
    { start_time: '12:00', end_time: '13:00', block_type: 'rest', title: 'Nghỉ trưa', roleKey: null },
    { start_time: '13:00', end_time: '17:30', block_type: 'deep_work', title: 'FPT IS — Buổi chiều', roleKey: 'fpt' },
    { start_time: '17:30', end_time: '18:00', block_type: 'family', title: 'Nghỉ / Gia đình', roleKey: 'personal' },
    { start_time: '18:00', end_time: '21:00', block_type: 'deep_work', title: 'Tulie Business', roleKey: 'tulie' },
    { start_time: '21:00', end_time: '22:00', block_type: 'rest', title: 'Cá nhân / Thư giãn', roleKey: 'personal' },
    { start_time: '22:00', end_time: '06:30', block_type: 'rest', title: 'Đi ngủ', roleKey: null }
] as const

export function useTimeBlocks() {
    const { plan, loading: planLoading } = useDailyPlan()
    const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchBlocks = useCallback(async () => {
        if (!plan) return
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            
            // Get user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Fetch time blocks for today's plan
            const { data, error: fetchErr } = await supabase
                .from('time_blocks')
                .select('*')
                .eq('daily_plan_id', plan.id)
                .order('start_time')

            if (fetchErr) throw fetchErr

            if (data && data.length > 0) {
                // Format start_time and end_time to HH:MM (remove seconds if present)
                const formatted = data.map((b: any) => ({
                    ...b,
                    start_time: b.start_time.substring(0, 5),
                    end_time: b.end_time.substring(0, 5),
                }))
                setTimeBlocks(formatted)
            } else {
                // No time blocks → Seed defaults
                // 1. Fetch user's life roles to link them properly
                const { data: roles } = await supabase
                    .from('life_roles')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_active', true)

                const fptRole = roles?.find(r => r.role === 'fpt_is' || r.role === 'fpt' || r.display_name.toLowerCase().includes('fpt'))
                const tulieRole = roles?.find(r => r.role === 'tulie' || r.display_name.toLowerCase().includes('tulie'))
                const personalRole = roles?.find(r => r.role === 'personal' || r.display_name.toLowerCase().includes('cá nhân') || r.display_name.toLowerCase().includes('ca nhan'))

                const roleMap: Record<string, string | null> = {
                    fpt: fptRole?.id || null,
                    tulie: tulieRole?.id || null,
                    personal: personalRole?.id || null,
                }

                // 2. Map default blocks with actual database role IDs
                const seedData = DEFAULT_BLOCKS.map(b => ({
                    user_id: user.id,
                    daily_plan_id: plan.id,
                    block_type: b.block_type,
                    life_role_id: b.roleKey ? roleMap[b.roleKey] : null,
                    start_time: b.start_time,
                    end_time: b.end_time,
                    title: b.title,
                    is_completed: false
                }))

                const { data: inserted, error: insertErr } = await supabase
                    .from('time_blocks')
                    .insert(seedData)
                    .select()

                if (insertErr) throw insertErr

                if (inserted) {
                    const formatted = inserted.map((b: any) => ({
                        ...b,
                        start_time: b.start_time.substring(0, 5),
                        end_time: b.end_time.substring(0, 5),
                    }))
                    setTimeBlocks(formatted)
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch time blocks')
        } finally {
            setLoading(false)
        }
    }, [plan])

    useEffect(() => {
        if (plan) {
            fetchBlocks()
        }
    }, [plan, fetchBlocks])

    const saveTimeBlocks = async (blocks: Omit<TimeBlock, 'user_id' | 'daily_plan_id'>[]) => {
        if (!plan) return
        setLoading(true)
        setError(null)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            // Start a deletion + insertion block
            const { error: deleteErr } = await supabase
                .from('time_blocks')
                .delete()
                .eq('daily_plan_id', plan.id)

            if (deleteErr) throw deleteErr

            if (blocks.length > 0) {
                const insertData = blocks.map(b => ({
                    user_id: user.id,
                    daily_plan_id: plan.id,
                    block_type: b.block_type,
                    life_role_id: b.life_role_id,
                    start_time: b.start_time,
                    end_time: b.end_time,
                    title: b.title,
                    is_completed: b.is_completed,
                    notes: b.notes || null
                }))

                const { error: insertErr } = await supabase
                    .from('time_blocks')
                    .insert(insertData)

                if (insertErr) throw insertErr
            }

            await fetchBlocks()
        } catch (err: any) {
            setError(err.message || 'Failed to save time blocks')
            throw err
        } finally {
            setLoading(false)
        }
    }

    const toggleBlockCompletion = async (blockId: string, isCompleted: boolean) => {
        try {
            const supabase = createClient()
            const { error: updateErr } = await supabase
                .from('time_blocks')
                .update({ is_completed: isCompleted })
                .eq('id', blockId)

            if (updateErr) throw updateErr

            setTimeBlocks(prev => prev.map(b => b.id === blockId ? { ...b, is_completed: isCompleted } : b))
        } catch (err: any) {
            setError(err.message || 'Failed to update time block status')
        }
    }

    return {
        timeBlocks,
        loading: planLoading || loading,
        error,
        saveTimeBlocks,
        toggleBlockCompletion,
        refetch: fetchBlocks
    }
}
