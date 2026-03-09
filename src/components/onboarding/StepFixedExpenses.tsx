'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/budget'
import { CATEGORIES } from '@/lib/constants'
import type { Category, CurrencyCode, FixedExpense } from '@/types'
import SwipeToDelete from '@/components/ui/SwipeToDelete'

interface StepFixedExpensesProps {
  fixedExpenses: FixedExpense[]
  setFixedExpenses: (expenses: FixedExpense[]) => void
  currency: CurrencyCode
}

interface FormState {
  name: string
  amount: string
  category: Category
}

const DEFAULT_FORM: FormState = {
  name: '',
  amount: '',
  category: 'other',
}

/**
 * Step 2: Fixed expenses list with inline add form and swipe-to-delete.
 * Tapping an existing row opens it for inline editing.
 */
export default function StepFixedExpenses({
  fixedExpenses,
  setFixedExpenses,
  currency,
}: StepFixedExpensesProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isFormValid = form.name.trim() !== '' && form.amount !== '' && Number(form.amount) > 0

  function handleAdd() {
    if (!isFormValid) return
    const newExpense: FixedExpense = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      amount: Number(form.amount),
      category: form.category,
    }
    setFixedExpenses([...fixedExpenses, newExpense])
    setForm(DEFAULT_FORM)
  }

  function handleEditStart(expense: FixedExpense) {
    setEditingId(expense.id)
    setForm({
      name: expense.name,
      amount: String(expense.amount),
      category: expense.category,
    })
  }

  function handleEditSave() {
    if (!isFormValid || editingId === null) return
    setFixedExpenses(
      fixedExpenses.map((e) =>
        e.id === editingId
          ? { ...e, name: form.name.trim(), amount: Number(form.amount), category: form.category }
          : e
      )
    )
    setEditingId(null)
    setForm(DEFAULT_FORM)
  }

  function handleEditCancel() {
    setEditingId(null)
    setForm(DEFAULT_FORM)
  }

  function handleDelete(id: string) {
    setFixedExpenses(fixedExpenses.filter((e) => e.id !== id))
  }

  function getCategoryEmoji(id: Category) {
    return CATEGORIES.find((c) => c.id === id)?.emoji ?? '💡'
  }

  // Inline form — used for both add and edit modes
  const InlineForm = (
    <div className="flex flex-col gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
      <input
        type="text"
        placeholder="Expense name"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Amount"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.amount}
        onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/\D/g, '') }))}
      />
      <select
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.emoji} {cat.labelEn}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {editingId !== null ? (
          <>
            <button
              onClick={handleEditSave}
              disabled={!isFormValid}
              className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleEditCancel}
              className="flex-1 min-h-[44px] rounded-lg border border-slate-600 text-slate-300 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleAdd}
            disabled={!isFormValid}
            className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Fixed Expenses</h2>
        <p className="text-sm text-slate-400">Add recurring monthly expenses like rent and subscriptions.</p>
      </div>

      {/* Inline add/edit form */}
      {InlineForm}

      {/* Expense list */}
      {fixedExpenses.length > 0 && (
        <div className="flex flex-col gap-1">
          {fixedExpenses.map((expense) =>
            editingId === expense.id ? null : (
              <SwipeToDelete
                key={expense.id}
                onDelete={() => handleDelete(expense.id)}
                className="rounded-xl"
              >
                <button
                  onClick={() => handleEditStart(expense)}
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
      )}

      {/* Skip button — visible when no expenses added yet */}
      {fixedExpenses.length === 0 && (
        <button
          className="text-sm text-slate-400 underline mt-2 self-center"
          onClick={() => {/* fixedExpenses already [] — user proceeds with Next */}}
        >
          I have no fixed expenses
        </button>
      )}
    </div>
  )
}
