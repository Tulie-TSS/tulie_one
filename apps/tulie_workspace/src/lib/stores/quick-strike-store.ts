import { create } from 'zustand'

interface QuickStrikeStore {
    isOpen: boolean
    value: string
    recentStrikes: { id: string; description: string; completed_at: string }[]
    setOpen: (open: boolean) => void
    setValue: (value: string) => void
    addStrike: (strike: { id: string; description: string; completed_at: string }) => void
}

export const useQuickStrikeStore = create<QuickStrikeStore>((set) => ({
    isOpen: false,
    value: '',
    recentStrikes: [],
    setOpen: (open) => set({ isOpen: open }),
    setValue: (value) => set({ value }),
    addStrike: (strike) =>
        set((s) => ({
            recentStrikes: [strike, ...s.recentStrikes].slice(0, 10),
            value: '',
        })),
}))
