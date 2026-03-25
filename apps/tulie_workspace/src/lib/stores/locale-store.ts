import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale } from '@/lib/i18n/translations'
import { translations } from '@/lib/i18n/translations'

interface LocaleStore {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

export const useLocaleStore = create<LocaleStore>()(
    persist(
        (set, get) => ({
            locale: 'vi',
            setLocale: (locale) => set({ locale }),
            t: (key: string) => {
                const entry = (translations as Record<string, Record<string, string>>)[key]
                return entry?.[get().locale] || key
            },
        }),
        { name: 'flowguard-locale' }
    )
)
