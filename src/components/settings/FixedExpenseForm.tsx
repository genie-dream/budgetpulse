import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types'

interface ExpenseFormState {
  name: string
  amount: string
  category: Category
}

export const DEFAULT_EXPENSE_FORM: ExpenseFormState = {
  name: '',
  amount: '',
  category: 'other',
}

interface FixedExpenseFormProps {
  form: ExpenseFormState
  onFormChange: (form: ExpenseFormState) => void
  onSubmit: () => void
  onCancel: () => void
  isEditing: boolean
  isValid: boolean
}

export type { ExpenseFormState }

export function FixedExpenseForm({
  form,
  onFormChange,
  onSubmit,
  onCancel,
  isEditing,
  isValid,
}: FixedExpenseFormProps) {
  return (
    <div className="flex flex-col gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
      <input
        type="text"
        placeholder="Expense name"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.name}
        onChange={(e) => onFormChange({ ...form, name: e.target.value })}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Amount"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.amount}
        onChange={(e) => onFormChange({ ...form, amount: e.target.value.replace(/\D/g, '') })}
      />
      <select
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.category}
        onChange={(e) => onFormChange({ ...form, category: e.target.value as Category })}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.emoji} {cat.labelEn}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onSubmit}
              disabled={!isValid}
              className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex-1 min-h-[44px] rounded-lg border border-slate-600 text-slate-300 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )
}

export function getCategoryEmoji(id: Category) {
  return CATEGORIES.find((c) => c.id === id)?.emoji ?? '💡'
}
