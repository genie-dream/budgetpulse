'use client'

import { useTranslations } from 'next-intl'
import type { CurrencyCode } from '../../types'
import { formatCurrency } from '../../lib/budget'

interface MonthSummaryProps {
  variableBudget: number
  totalSpent: number
  currency: CurrencyCode
}

export function MonthSummary({ variableBudget, totalSpent, currency }: MonthSummaryProps) {
  const t = useTranslations('analytics')
  const savedAmount = variableBudget - totalSpent
  const isOverBudget = savedAmount < 0

  return (
    <div data-testid="month-summary" className="bg-slate-800 rounded-xl p-4">
      <h2 className="text-slate-100 font-semibold mb-3">{t('monthlySummary')}</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">{t('budget')}</span>
          <span className="text-slate-300 text-sm font-medium">
            {formatCurrency(variableBudget, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">{t('spent')}</span>
          <span
            className={`text-sm font-medium ${totalSpent > variableBudget ? 'text-red-400' : 'text-slate-300'}`}
          >
            {formatCurrency(totalSpent, currency)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 text-sm">{t('saved')}</span>
          <span
            className={`text-sm font-medium ${isOverBudget ? 'text-red-400' : 'text-green-400'}`}
          >
            {isOverBudget
              ? 'Over budget'
              : formatCurrency(Math.max(0, savedAmount), currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
