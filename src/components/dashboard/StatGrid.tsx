'use client'
// src/components/dashboard/StatGrid.tsx
// Stub created in Plan 04-02 to unblock test infrastructure.
// Full implementation will be provided in Plan 04-03.

import { useTranslations } from 'next-intl'
import { formatCurrency } from '@/lib/budget'
import type { CurrencyCode } from '@/types'

interface StatGridProps {
  dailySurvival: number
  weeklySurvival: number
  totalSpent: number
  remainingDays: number
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
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="flex flex-col">
        <span className="text-sm text-slate-400">{t('dailySurvival')}</span>
        <span className="text-lg font-semibold text-slate-100">
          {formatCurrency(dailySurvival, currency)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-400">{t('weeklySurvival')}</span>
        <span className="text-lg font-semibold text-slate-100">
          {formatCurrency(weeklySurvival, currency)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-400">{t('remainingDays')}</span>
        <span className="text-lg font-semibold text-slate-100">
          {remainingDays} {t('days')}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-400">{t('totalSpent')}</span>
        <span className="text-lg font-semibold text-slate-100">
          {formatCurrency(totalSpent, currency)}
        </span>
      </div>
    </div>
  )
}
