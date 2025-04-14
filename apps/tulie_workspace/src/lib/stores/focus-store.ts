import { create } from 'zustand'

interface FocusStore {
    isActive: boolean
    taskId: string | null
    startedAt: string | null
    pomodoroCount: number
    timerSeconds: number
    isPaused: boolean
    startFocus: (taskId: string) => void
    stopFocus: () => void
    incrementPomodoro: () => void
    setTimerSeconds: (seconds: number) => void
    togglePause: () => void
}

export const useFocusStore = create<FocusStore>((set) => ({
    isActive: false,
    taskId: null,
    startedAt: null,
    pomodoroCount: 0,
    timerSeconds: 0,
    isPaused: false,
    startFocus: (taskId) =>
        set({
            isActive: true,
            taskId,
            startedAt: new Date().toISOString(),
            pomodoroCount: 0,
            timerSeconds: 0,
            isPaused: false,
        }),
    stopFocus: () =>
        set({
            isActive: false,
            taskId: null,
            startedAt: null,
            pomodoroCount: 0,
            timerSeconds: 0,
            isPaused: false,
        }),
    incrementPomodoro: () => set((s) => ({ pomodoroCount: s.pomodoroCount + 1 })),
    setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
    togglePause: () => set((s) => ({ isPaused: !s.isPaused })),
}))
