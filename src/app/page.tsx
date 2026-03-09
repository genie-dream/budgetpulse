'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useBudgetStore } from '@/stores/budgetStore'

export default function DashboardPage() {
  const router = useRouter()
  const isOnboarded = useBudgetStore((s) => s.isOnboarded)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useBudgetStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBudgetStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (hydrated && !isOnboarded) {
      router.replace('/onboarding')
    }
  }, [hydrated, isOnboarded, router])

  // Prevent flash: render nothing until hydration is confirmed
  if (!hydrated || !isOnboarded) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
        <span className="text-2xl">💰</span>
      </div>
      <h1 className="text-xl font-semibold text-slate-100 mb-2">BudgetPulse</h1>
      <p className="text-slate-400 text-sm">Dashboard coming in Phase 4</p>
    </div>
  )
}
