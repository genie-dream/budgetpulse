'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBudgetStore } from '@/stores/budgetStore'
import { db } from '@/lib/db'
import { getPeriodStartDate, calcVariableBudget, formatCurrency } from '@/lib/budget'
import {
  aggregateByCategory,
  aggregateByDay,
  getPeriodEndDate,
} from '@/lib/analyticsHelpers'
import { DonutChart } from '@/components/analytics/DonutChart'
import { DailyBarChart } from '@/components/analytics/DailyBarChart'
import { MonthSummary } from '@/components/analytics/MonthSummary'
import type { Transaction, CurrencyCode } from '@/types'

export default function AnalyticsPage() {
  const t = useTranslations('analytics')
  const tCommon = useTranslations('common')
  const tHome = useTranslations('home')

  const [hydrated, setHydrated] = useState(false)
  const [monthOffset, setMonthOffset] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const config = useBudgetStore((s) => s.config)

  // Hydration guard — same pattern as DashboardPage
  useEffect(() => {
    const unsub = useBudgetStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBudgetStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Period computation based on monthOffset
  const { periodStart, periodEnd, referenceDate } = useMemo(() => {
    const ref = new Date()
    ref.setMonth(ref.getMonth() + monthOffset)
    if (!config) return { periodStart: null, periodEnd: null, referenceDate: ref }
    const start = getPeriodStartDate(ref, config.monthStartDay)
    const end = getPeriodEndDate(start, config.monthStartDay)
    return { periodStart: start, periodEnd: end, referenceDate: ref }
  }, [monthOffset, config])

  // Dexie query — fires when hydrated + config + period change
  useEffect(() => {
    if (!hydrated || !config || !periodStart || !periodEnd) return
    db.transactions
      .where('date')
      .between(periodStart, periodEnd, true, true)
      .toArray()
      .then(setTransactions)
  }, [hydrated, config, periodStart, periodEnd])

  // Derived values
  const categoryData = useMemo(() => aggregateByCategory(transactions), [transactions])
  const dailyData = useMemo(
    () =>
      periodStart && periodEnd
        ? aggregateByDay(transactions, periodStart, periodEnd)
        : [],
    [transactions, periodStart, periodEnd],
  )
  const variableBudget = useMemo(
    () => (config ? calcVariableBudget(config.income, config.fixedExpenses, config.savingsGoal) : 0),
    [config],
  )
  const totalSpent = useMemo(
    () => transactions.reduce((sum, tx) => sum + tx.amount, 0),
    [transactions],
  )
  const currency: CurrencyCode = config?.currency ?? 'KRW'

  // Period label: YYYY.MM based on referenceDate
  const periodLabel = `${referenceDate.getFullYear()}.${String(referenceDate.getMonth() + 1).padStart(2, '0')}`

  if (!hydrated) {
    return <div className="p-4 text-slate-400">{tCommon('loading')}</div>
  }

  if (!config) {
    return <div className="p-4 text-slate-400">{tHome('noData')}</div>
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-100">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            aria-label={t('previousMonth')}
            className="p-1 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-slate-300 text-sm min-w-[64px] text-center">{periodLabel}</span>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            disabled={monthOffset >= 0}
            aria-label={t('nextMonth')}
            className="p-1 text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Category donut chart */}
      <section>
        <h2 className="text-slate-300 font-medium mb-2">{t('byCategory')}</h2>
        <DonutChart data={categoryData} currency={currency} />
      </section>

      {/* Daily bar chart */}
      <section>
        <h2 className="text-slate-300 font-medium mb-2">{t('dailySpending')}</h2>
        <DailyBarChart data={dailyData} currency={currency} />
      </section>

      {/* Monthly summary */}
      <MonthSummary
        variableBudget={variableBudget}
        totalSpent={totalSpent}
        currency={currency}
      />
    </div>
  )
}
