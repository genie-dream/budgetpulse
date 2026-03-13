'use client'

import SwipeToDelete from '@/components/ui/SwipeToDelete'
import { formatCurrency } from '@/lib/budget'
import { CATEGORIES } from '@/lib/constants'
import type { CurrencyCode, Transaction } from '@/types'

interface TransactionRowProps {
  tx: Transaction
  onDelete: () => void
  currency: CurrencyCode
}

export function TransactionRow({ tx, onDelete, currency }: TransactionRowProps) {
  const category = CATEGORIES.find((c) => c.id === tx.category)
  const emoji = category?.emoji ?? '💡'
  const label = category?.labelEn ?? tx.category

  const timeString = (tx.createdAt instanceof Date ? tx.createdAt : new Date(tx.createdAt))
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return (
    <SwipeToDelete onDelete={onDelete}>
      <div className="flex flex-row items-center px-4 py-3 min-h-[64px] gap-3 bg-slate-900">
        {/* Category emoji circle */}
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl flex-shrink-0">
          {emoji}
        </div>

        {/* Middle: category label + memo */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 truncate">{label}</p>
          {tx.memo && (
            <p className="text-xs text-slate-500 truncate">{tx.memo}</p>
          )}
        </div>

        {/* Right: amount + time */}
        <div className="flex flex-col items-end flex-shrink-0">
          <p className="text-base font-semibold text-white">
            {formatCurrency(tx.amount, currency)}
          </p>
          <p className="text-xs text-slate-500">{timeString}</p>
        </div>
      </div>
    </SwipeToDelete>
  )
}
