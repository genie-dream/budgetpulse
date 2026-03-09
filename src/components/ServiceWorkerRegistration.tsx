'use client'
import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'
import { useBudgetStore } from '@/stores/budgetStore'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Rehydrate SSR-safe Zustand stores
    useSettingsStore.persist.rehydrate()
    useBudgetStore.persist.rehydrate()

    // Register service worker for PWA installability
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('SW registration failed:', err))
    }
  }, [])

  return null
}
