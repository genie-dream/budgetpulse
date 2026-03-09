// src/stores/settingsStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Settings, CurrencyCode } from '@/types'

interface SettingsStore extends Settings {
  currency: CurrencyCode
  setLanguage: (language: 'en' | 'ko') => void
  setTheme: (theme: 'dark' | 'light') => void
  setCurrency: (currency: CurrencyCode) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      language: 'en',
      theme: 'dark',
      currency: 'KRW',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'budgetpulse-settings',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      skipHydration: true,
    }
  )
)
