// src/stores/budgetStore.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BudgetConfig } from '@/types'

interface BudgetStore {
  config: BudgetConfig | null
  isOnboarded: boolean
  setConfig: (config: BudgetConfig) => void
  setOnboarded: (value: boolean) => void
}

export const useBudgetStore = create<BudgetStore>()(
  persist(
    (set) => ({
      config: null,
      isOnboarded: false,
      setConfig: (config) => set({ config }),
      setOnboarded: (isOnboarded) => set({ isOnboarded }),
    }),
    {
      name: 'budgetpulse-budget',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : ({} as Storage)
      ),
      skipHydration: true,
    }
  )
)
