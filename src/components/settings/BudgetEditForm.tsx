'use client'

import { useState } from 'react'
import type { BudgetConfig, FixedExpense } from '@/types'
import {
  FixedExpenseForm,
  DEFAULT_EXPENSE_FORM,
} from './FixedExpenseForm'
import type { ExpenseFormState } from './FixedExpenseForm'
import { FixedExpenseList } from './FixedExpenseList'

interface BudgetEditFormProps {
  config: BudgetConfig
  onSave: (updates: Partial<BudgetConfig>) => Promise<void>
}

export function BudgetEditForm({ config, onSave }: BudgetEditFormProps) {
  const [income, setIncome] = useState(config.income)
  const [monthStartDay, setMonthStartDay] = useState(config.monthStartDay)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(config.fixedExpenses)
  const [savingsGoal, setSavingsGoal] = useState(config.savingsGoal)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

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

  function handleExpenseSubmit() {
    if (!isExpenseFormValid) return
    if (editingExpenseId !== null) {
      setFixedExpenses(
        fixedExpenses.map((e) =>
          e.id === editingExpenseId
            ? { ...e, name: expenseForm.name.trim(), amount: Number(expenseForm.amount), category: expenseForm.category }
            : e
        )
      )
      setEditingExpenseId(null)
    } else {
      const newExpense: FixedExpense = {
        id: crypto.randomUUID(),
        name: expenseForm.name.trim(),
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
      }
      setFixedExpenses([...fixedExpenses, newExpense])
    }
    setExpenseForm(DEFAULT_EXPENSE_FORM)
  }

  function handleEditStart(expense: FixedExpense) {
    setEditingExpenseId(expense.id)
    setExpenseForm({ name: expense.name, amount: String(expense.amount), category: expense.category })
  }

  function handleEditCancel() {
    setEditingExpenseId(null)
    setExpenseForm(DEFAULT_EXPENSE_FORM)
  }

  function handleDeleteExpense(id: string) {
    setFixedExpenses(fixedExpenses.filter((e) => e.id !== id))
  }

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
        <FixedExpenseForm
          form={expenseForm}
          onFormChange={setExpenseForm}
          onSubmit={handleExpenseSubmit}
          onCancel={handleEditCancel}
          isEditing={editingExpenseId !== null}
          isValid={isExpenseFormValid}
        />
        <FixedExpenseList
          expenses={fixedExpenses}
          editingId={editingExpenseId}
          onEditStart={handleEditStart}
          onDelete={handleDeleteExpense}
          currency={config.currency}
        />
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
