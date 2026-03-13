'use client'

import { useState } from 'react'
import { formatCurrency } from '@/lib/budget'
import { CATEGORIES } from '@/lib/constants'
import type { BudgetConfig, Category, FixedExpense } from '@/types'
import SwipeToDelete from '@/components/ui/SwipeToDelete'

interface BudgetEditFormProps {
  config: BudgetConfig
  onSave: (updates: Partial<BudgetConfig>) => Promise<void>
}

interface ExpenseFormState {
  name: string
  amount: string
  category: Category
}

const DEFAULT_EXPENSE_FORM: ExpenseFormState = {
  name: '',
  amount: '',
  category: 'other',
}

/**
 * Settings form for editing income, fixed expenses, and savings goal.
 * Reuses UI patterns from onboarding step components.
 */
export default function BudgetEditForm({ config, onSave }: BudgetEditFormProps) {
  const [income, setIncome] = useState(config.income)
  const [monthStartDay, setMonthStartDay] = useState(config.monthStartDay)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(config.fixedExpenses)
  const [savingsGoal, setSavingsGoal] = useState(config.savingsGoal)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fixed expenses inline form state
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>(DEFAULT_EXPENSE_FORM)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)

  const isExpenseFormValid =
    expenseForm.name.trim() !== '' &&
    expenseForm.amount !== '' &&
    Number(expenseForm.amount) > 0

  async function handleSave() {
    setSaving(true)
    await onSave({ income, monthStartDay, fixedExpenses, savingsGoal })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setIncome(raw === '' ? 0 : Number(raw))
  }

  function handleSavingsGoalChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setSavingsGoal(raw === '' ? 0 : Number(raw))
  }

  function handleAddExpense() {
    if (!isExpenseFormValid) return
    const newExpense: FixedExpense = {
      id: crypto.randomUUID(),
      name: expenseForm.name.trim(),
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
    }
    setFixedExpenses([...fixedExpenses, newExpense])
    setExpenseForm(DEFAULT_EXPENSE_FORM)
  }

  function handleEditExpenseStart(expense: FixedExpense) {
    setEditingExpenseId(expense.id)
    setExpenseForm({
      name: expense.name,
      amount: String(expense.amount),
      category: expense.category,
    })
  }

  function handleEditExpenseSave() {
    if (!isExpenseFormValid || editingExpenseId === null) return
    setFixedExpenses(
      fixedExpenses.map((e) =>
        e.id === editingExpenseId
          ? {
              ...e,
              name: expenseForm.name.trim(),
              amount: Number(expenseForm.amount),
              category: expenseForm.category,
            }
          : e
      )
    )
    setEditingExpenseId(null)
    setExpenseForm(DEFAULT_EXPENSE_FORM)
  }

  function handleEditExpenseCancel() {
    setEditingExpenseId(null)
    setExpenseForm(DEFAULT_EXPENSE_FORM)
  }

  function handleDeleteExpense(id: string) {
    setFixedExpenses(fixedExpenses.filter((e) => e.id !== id))
  }

  function getCategoryEmoji(id: Category) {
    return CATEGORIES.find((c) => c.id === id)?.emoji ?? '💡'
  }

  // Inline form for add/edit expense
  const ExpenseInlineForm = (
    <div className="flex flex-col gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
      <input
        type="text"
        placeholder="Expense name"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={expenseForm.name}
        onChange={(e) => setExpenseForm((f) => ({ ...f, name: e.target.value }))}
      />
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Amount"
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={expenseForm.amount}
        onChange={(e) =>
          setExpenseForm((f) => ({ ...f, amount: e.target.value.replace(/\D/g, '') }))
        }
      />
      <select
        className="min-h-[44px] rounded-lg bg-slate-700 border border-slate-600 px-3 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={expenseForm.category}
        onChange={(e) =>
          setExpenseForm((f) => ({ ...f, category: e.target.value as Category }))
        }
      >
        {CATEGORIES.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.emoji} {cat.labelEn}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {editingExpenseId !== null ? (
          <>
            <button
              onClick={handleEditExpenseSave}
              disabled={!isExpenseFormValid}
              className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={handleEditExpenseCancel}
              className="flex-1 min-h-[44px] rounded-lg border border-slate-600 text-slate-300 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleAddExpense}
            disabled={!isExpenseFormValid}
            className="flex-1 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
          >
            Add
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Income section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-income" className="text-sm font-medium text-slate-300">
          Monthly Income
        </label>
        <input
          id="settings-income"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="min-h-[44px] w-full rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={income === 0 ? '' : String(income)}
          onChange={handleIncomeChange}
        />
      </div>

      {/* Pay day section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-payday" className="text-sm font-medium text-slate-300">
          Pay Day (day of month)
        </label>
        <input
          id="settings-payday"
          type="number"
          min={1}
          max={31}
          className="min-h-[44px] w-full rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={monthStartDay}
          onChange={(e) => {
            const v = Math.max(1, Math.min(31, Number(e.target.value.replace(/\D/g, '')) || 1))
            setMonthStartDay(v)
          }}
        />
        <p className="text-xs text-slate-500">
          Your budget period starts on this day each month.
        </p>
      </div>

      {/* Fixed Expenses section */}
      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-slate-300">Fixed Expenses</span>
        {ExpenseInlineForm}
        {fixedExpenses.length > 0 && (
          <div className="flex flex-col gap-1">
            {fixedExpenses.map((expense) =>
              editingExpenseId === expense.id ? null : (
                <SwipeToDelete
                  key={expense.id}
                  onDelete={() => handleDeleteExpense(expense.id)}
                  className="rounded-xl"
                >
                  <button
                    onClick={() => handleEditExpenseStart(expense)}
                    className="w-full flex items-center justify-between min-h-[52px] px-3 bg-slate-800 text-left"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-200">
                      <span>{getCategoryEmoji(expense.category)}</span>
                      <span>{expense.name}</span>
                    </span>
                    <span className="text-sm text-slate-400 font-medium">
                      {formatCurrency(expense.amount, config.currency)}
                    </span>
                  </button>
                </SwipeToDelete>
              )
            )}
          </div>
        )}
      </div>

      {/* Savings Goal section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="settings-savings-goal" className="text-sm font-medium text-slate-300">
          Monthly Savings Goal
        </label>
        <input
          id="settings-savings-goal"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="min-h-[44px] w-full rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={savingsGoal === 0 ? '' : String(savingsGoal)}
          onChange={handleSavingsGoalChange}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="min-h-[44px] rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
      >
        {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )
}
