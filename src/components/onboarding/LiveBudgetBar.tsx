import { formatCurrency } from '@/lib/budget'
import type { CurrencyCode } from '@/types'

interface LiveBudgetBarProps {
  variableBudget: number
  currency: CurrencyCode
}

/**
 * Sticky bottom bar showing the variable budget preview.
 * Red text + warning message when variable budget is negative.
 */
export default function LiveBudgetBar({ variableBudget, currency }: LiveBudgetBarProps) {
  const isNegative = variableBudget < 0

  return (
    <div className="sticky bottom-0 bg-slate-800/90 backdrop-blur border-t border-slate-700 min-h-[60px] px-4 py-3 flex flex-col justify-center">
      <p className={`text-sm font-medium ${isNegative ? 'text-red-400' : 'text-slate-100'}`}>
        Variable Budget:{' '}
        <span className="font-bold">{formatCurrency(variableBudget, currency)}</span>
      </p>
      {isNegative && (
        <p className="text-xs text-red-400 mt-0.5">Expenses exceed income</p>
      )}
    </div>
  )
}
