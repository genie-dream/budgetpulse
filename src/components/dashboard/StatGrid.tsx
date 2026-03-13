'use client'
// src/components/dashboard/StatGrid.tsx
// 2×2 stat card grid: daily survival, weekly survival, total spent, remaining days.
// Purely presentational — receives all pre-computed values as props.

import { useTranslations } from 'next-intl'
import { formatCurrency } from '@/lib/budget'
import type { CurrencyCode } from '@/types'

interface StatGridProps {
  dailySurvival: number // pre-computed, already clamped to >= 0 by caller
  weeklySurvival: number // dailySurvival * 7, already clamped to >= 0 by caller
  totalSpent: number // sum of current-period transaction amounts
  remainingDays: number // from getRemainingDaysInPeriod
  currency: CurrencyCode
}

export function StatGrid({
  dailySurvival,
  weeklySurvival,
  totalSpent,
  remainingDays,
  currency,
}: StatGridProps) {
  const t = useTranslations('home')

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Top-left: Daily Survival */}
      <div className="flex flex-col gap-1 rounded-2xl bg-slate-800 p-4">
        <p className="text-xs text-slate-400">{t('dailySurvival')}</p>
        <p className="text-xl font-semibold text-slate-100">
          {formatCurrency(dailySurvival, currency)}
        </p>
      </div>

      {/* Top-right: Weekly Survival */}
      <div className="flex flex-col gap-1 rounded-2xl bg-slate-800 p-4">
        <p className="text-xs text-slate-400">{t('weeklySurvival')}</p>
        <p className="text-xl font-semibold text-slate-100">
          {formatCurrency(weeklySurvival, currency)}
        </p>
      </div>

      {/* Bottom-left: Total Spent */}
      <div className="flex flex-col gap-1 rounded-2xl bg-slate-800 p-4">
        <p className="text-xs text-slate-400">{t('totalSpent')}</p>
        <p className="text-xl font-semibold text-slate-100">
          {formatCurrency(totalSpent, currency)}
        </p>
      </div>

      {/* Bottom-right: Remaining Days */}
      <div className="flex flex-col gap-1 rounded-2xl bg-slate-800 p-4">
        <p className="text-xs text-slate-400">{t('remainingDays')}</p>
        <p className="text-xl font-semibold text-slate-100">
          {remainingDays} {t('days')}
        </p>
      </div>
    </div>
  )
}
