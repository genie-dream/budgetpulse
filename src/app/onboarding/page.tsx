'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBudgetStore } from '@/stores/budgetStore'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

/**
 * Onboarding route entry point.
 * Guards against already-onboarded users: redirects to '/' if isOnboarded.
 * Uses onFinishHydration pattern to avoid SSR hydration race condition.
 */
export default function OnboardingPage() {
  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const isOnboarded = useBudgetStore((s) => s.isOnboarded)

  useEffect(() => {
    // Wait for Zustand persist hydration before reading isOnboarded
    const unsub = useBudgetStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBudgetStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (hydrated && isOnboarded) {
      router.replace('/')
    }
  }, [hydrated, isOnboarded, router])

  // Brief blank during hydration
  if (!hydrated) return null

  // Already onboarded — redirect in progress
  if (isOnboarded) return null

  return (
    <div className="min-h-screen pb-safe">
      <OnboardingWizard />
    </div>
  )
}
