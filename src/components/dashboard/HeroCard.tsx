'use client'
// src/components/dashboard/HeroCard.tsx
// Presentational hero card for the dashboard — answers "how much can I spend today?"
// Shows remaining budget as the dominant number, an inset progress bar, and a pace badge.

import { useTranslations } from 'next-intl'
import { formatCurrency, getPaceStatus } from '@/lib/budget'
import type { PaceStatus } from '@/lib/budget'
import type { CurrencyCode } from '@/types'

interface HeroCardProps {
  remainingBudget: number // can be negative (over-budget)
  variableBudget: number // monthly variable budget total
  totalSpent: number // sum of current-period transactions
  paceRatio: number // from calcPaceRatio
  currency: CurrencyCode
}

export function HeroCard({
  remainingBudget,
  variableBudget,
  totalSpent,
  paceRatio,
  currency,
}: HeroCardProps) {
  const t = useTranslations('home')

  // Derive pace status from the ratio (thresholds: safe < 0.9, caution 0.9–1.1, danger >= 1.1)
  const paceStatus: PaceStatus = getPaceStatus(paceRatio)

  // Hero amount color: red when danger OR over-budget; slate-100 otherwise
  const heroAmountColor =
    paceStatus === 'danger' || remainingBudget < 0 ? 'text-red-500' : 'text-slate-100'

  // Progress bar fill color per pace status
  const progressBarColor =
    paceStatus === 'safe'
      ? 'bg-green-500'
      : paceStatus === 'caution'
        ? 'bg-amber-400'
        : 'bg-red-500'

  // Pace badge background and text colors
  const badgeBgColor =
    paceStatus === 'safe'
      ? 'bg-green-500/20'
      : paceStatus === 'caution'
        ? 'bg-amber-400/20'
        : 'bg-red-500/20'
  const badgeTextColor =
    paceStatus === 'safe'
      ? 'text-green-400'
      : paceStatus === 'caution'
        ? 'text-amber-400'
        : 'text-red-500'

  // Progress percent: always 100 when over-budget, else clamped 0–100
  const progressPct =
    remainingBudget < 0
      ? 100
      : Math.min(100, Math.max(0, variableBudget > 0 ? (totalSpent / variableBudget) * 100 : 0))

  // Label: "Over budget" when negative, else "remaining this month"
  const heroLabel = remainingBudget < 0 ? t('overBudget') : t('remainingThisMonth')

  // Pace badge label per status
  const paceStatusLabel =
    paceStatus === 'safe'
      ? t('paceSafe')
      : paceStatus === 'caution'
        ? t('paceCaution')
        : t('paceDanger')

  return (
    <div className="relative min-h-[120px] rounded-2xl bg-slate-800 p-6">
      {/* Pace badge — top right corner */}
      <div
        className={`absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${badgeBgColor} ${badgeTextColor}`}
      >
        <span>{t('paceLabel')}</span>
        <span className="opacity-60">·</span>
        <span>{paceStatusLabel}</span>
      </div>

      {/* Hero amount — dominant numeric value (absolute value, negative shown via color + label) */}
      <p
        data-testid="hero-amount"
        className={`mt-2 text-5xl font-bold tabular-nums ${heroAmountColor}`}
      >
        {formatCurrency(Math.abs(remainingBudget), currency)}
      </p>

      {/* Hero label */}
      <p className="mt-1 text-sm text-slate-400">{heroLabel}</p>

      {/* Progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          data-testid="progress-bar-fill"
          className={`h-full rounded-full transition-none ${progressBarColor}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}
