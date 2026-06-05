import { create } from 'zustand'
import { createClient } from '@/lib/supabase'

interface Strike {
    id: string
    description: string
    completed_at: string
}

interface QuickStrikeStore {
    recentStrikes: Strike[]
    loading: boolean
    fetchStrikes: () => Promise<void>
    addStrike: (description: string) => Promise<void>
}

export const useQuickStrikeStore = create<QuickStrikeStore>((set, get) => ({
    recentStrikes: [],
    loading: false,

    fetchStrikes: async () => {
        set({ loading: true })
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('quick_strikes')
                .select('id, description, completed_at')
                .eq('user_id', user.id)
                .order('completed_at', { ascending: false })
                .limit(20)

            if (data) {
                set({ recentStrikes: data as Strike[] })
            }
        } finally {
            set({ loading: false })
        }
    },

    addStrike: async (description: string) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const completed_at = new Date().toISOString()
        const { data, error } = await supabase
            .from('quick_strikes')
            .insert({ user_id: user.id, description, completed_at })
            .select('id, description, completed_at')
            .single()

        if (!error && data) {
            set(s => ({
                recentStrikes: [data as Strike, ...s.recentStrikes].slice(0, 20)
            }))
        }
    },
}))
