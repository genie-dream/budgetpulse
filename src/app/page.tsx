'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useBudgetStore } from '@/stores/budgetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useHydrated } from '@/hooks/useHydrated'
import { db } from '@/lib/db'
import {
  calcVariableBudget,
  calcDailySurvivalBudget,
  calcPaceRatio,
  getRemainingDaysInPeriod,
  getPeriodStartDate,
} from '@/lib/budget'
import { HeroCard } from '@/components/dashboard/HeroCard'
import { StatGrid } from '@/components/dashboard/StatGrid'
import type { CurrencyCode } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const t = useTranslations('home')

  // --- Store subscriptions ---
  const config = useBudgetStore((s) => s.config)
  const isOnboarded = useBudgetStore((s) => s.isOnboarded)
  const currency = useSettingsStore((s) => s.currency)
  const transactions = useTransactionStore((s) => s.transactions)

  // --- Two-store hydration guard (DASH-01, prevents flash) ---
  const budgetHydrated = useHydrated(useBudgetStore)
  const settingsHydrated = useHydrated(useSettingsStore)
  const hydrated = budgetHydrated && settingsHydrated

  // --- Onboarding redirect (existing behaviour preserved) ---
  useEffect(() => {
    if (hydrated && !isOnboarded) {
      router.replace('/onboarding')
    }
  }, [hydrated, isOnboarded, router])

  // --- Dexie current-period load (run once after budget store is hydrated and config exists) ---
  useEffect(() => {
    if (!budgetHydrated || !config) return
    const periodStart = getPeriodStartDate(new Date(), config.monthStartDay)
    useTransactionStore.getState().setLoading(true)
    db.transactions
      .where('date')
      .aboveOrEqual(periodStart)
      .toArray()
      .then((txns) => {
        useTransactionStore.getState().setTransactions(txns)
        useTransactionStore.getState().setLoading(false)
      })
  }, [budgetHydrated, config])

  // --- Hydration + onboarding guard — return null to prevent any flash ---
  if (!hydrated || !isOnboarded) return null

  // --- Defensive currency before hydration settles (matches TransactionsPage pattern) ---
  const resolvedCurrency: CurrencyCode = hydrated ? currency : 'KRW'

  // --- Edge case: onboarded but config somehow null ---
  if (!config) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">{t('noData')}</div>
    )
  }

  // --- Synchronous value derivation (DASH-01 through DASH-07) ---
  const variableBudget = calcVariableBudget(config.income, config.fixedExpenses, config.savingsGoal)
  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const remainingBudget = variableBudget - totalSpent
  const remainingDays = getRemainingDaysInPeriod(new Date(), config.monthStartDay)

  // CRITICAL: pass Math.max(0, remainingBudget) so dailySurvival is never negative
  const dailySurvival = Math.max(
    0,
    calcDailySurvivalBudget(Math.max(0, remainingBudget), remainingDays),
  )
  const weeklySurvival = dailySurvival * 7
  const paceRatio = calcPaceRatio(totalSpent, variableBudget, config.monthStartDay)

  const today = new Date()
  const dateLabel = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm text-slate-400">{dateLabel}</p>
      <HeroCard
        remainingBudget={remainingBudget}
        variableBudget={variableBudget}
        totalSpent={totalSpent}
        paceRatio={paceRatio}
        currency={resolvedCurrency}
      />
      <StatGrid
        dailySurvival={dailySurvival}
        weeklySurvival={weeklySurvival}
        totalSpent={totalSpent}
        remainingDays={remainingDays}
        currency={resolvedCurrency}
      />
    </div>
  )
}
