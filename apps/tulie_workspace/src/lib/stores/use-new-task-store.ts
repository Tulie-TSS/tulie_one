'use client'

import { create } from 'zustand'

interface NewTaskStore {
  isOpen: boolean
  defaults: {
    cycle_id?: string
    project_id?: string
  }
  setOpen: (open: boolean) => void
  open: () => void
  openWithDefaults: (defaults: { cycle_id?: string; project_id?: string }) => void
  close: () => void
}

export const useNewTaskStore = create<NewTaskStore>((set) => ({
  isOpen: false,
  defaults: {},
  setOpen: (open) => set({ isOpen: open }),
  open: () => set({ isOpen: true, defaults: {} }),
  openWithDefaults: (defaults) => set({ isOpen: true, defaults }),
  close: () => set({ isOpen: false, defaults: {} }),
}))
