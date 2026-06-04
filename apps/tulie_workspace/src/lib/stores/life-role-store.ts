import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LifeRoleType } from '@/types/command-center.types'

interface LifeRoleStore {
  activeRole: LifeRoleType | 'all'
  setActiveRole: (role: LifeRoleType | 'all') => void
}

export const useLifeRoleStore = create<LifeRoleStore>()(
  persist(
    (set) => ({
      activeRole: 'all',
      setActiveRole: (role) => set({ activeRole: role }),
    }),
    { name: 'tulie-life-role' }
  )
)
