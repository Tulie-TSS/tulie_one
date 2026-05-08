'use client'

import { create } from 'zustand'

interface NewTaskStore {
  isOpen: boolean
  setOpen: (open: boolean) => void
  open: () => void
  close: () => void
}

export const useNewTaskStore = create<NewTaskStore>((set) => ({
  isOpen: false,
  setOpen: (open) => set({ isOpen: open }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
