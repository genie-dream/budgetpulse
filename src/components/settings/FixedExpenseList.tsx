import { formatCurrency } from '@/lib/budget'
import SwipeToDelete from '@/components/ui/SwipeToDelete'
import { getCategoryEmoji } from './FixedExpenseForm'
import type { CurrencyCode, FixedExpense } from '@/types'

interface FixedExpenseListProps {
  expenses: FixedExpense[]
  editingId: string | null
  onEditStart: (expense: FixedExpense) => void
  onDelete: (id: string) => void
  currency: CurrencyCode
}

export function FixedExpenseList({
  expenses,
  editingId,
  onEditStart,
  onDelete,
  currency,
}: FixedExpenseListProps) {
  if (expenses.length === 0) return null

  return (
    <div className="flex flex-col gap-1">
      {expenses.map((expense) =>
        editingId === expense.id ? null : (
          <SwipeToDelete
            key={expense.id}
            onDelete={() => onDelete(expense.id)}
            className="rounded-xl"
          >
            <button
              onClick={() => onEditStart(expense)}
              className="w-full flex items-center justify-between min-h-[52px] px-3 bg-slate-800 text-left"
            >
              <span className="flex items-center gap-2 text-sm text-slate-200">
                <span>{getCategoryEmoji(expense.category)}</span>
                <span>{expense.name}</span>
              </span>
              <span className="text-sm text-slate-400 font-medium">
                {formatCurrency(expense.amount, currency)}
              </span>
            </button>
          </SwipeToDelete>
        )
      )}
    </div>
  )
}
