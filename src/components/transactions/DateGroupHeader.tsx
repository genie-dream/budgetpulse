import { formatCurrency } from '@/lib/budget'
import { smartDateLabel } from '@/lib/transactionHelpers'
import type { CurrencyCode } from '@/types'

interface DateGroupHeaderProps {
  dateKey: string
  locale: string
  dailyTotal: number
  currency: CurrencyCode
}

export function DateGroupHeader({ dateKey, locale, dailyTotal, currency }: DateGroupHeaderProps) {
  const label = smartDateLabel(dateKey, locale)

  return (
    <div className="sticky top-0 z-10 bg-slate-900 flex justify-between items-center px-4 py-2">
      <span className="text-sm font-semibold text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-400">
        {formatCurrency(dailyTotal, currency)}
      </span>
    </div>
  )
}
