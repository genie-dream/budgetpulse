'use client'

import type { CurrencyCode } from '@/types'

interface StepSavingsGoalProps {
  savingsGoal: number
  setSavingsGoal: (value: number) => void
  currency: CurrencyCode
}

/**
 * Step 3: Optional monthly savings goal input.
 * Zero (0) is the default and signals "skip saving".
 */
export default function StepSavingsGoal({ savingsGoal, setSavingsGoal }: StepSavingsGoalProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setSavingsGoal(raw === '' ? 0 : Number(raw))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Savings Goal</h2>
        <p className="text-sm text-slate-400">
          How much do you want to save each month? This is optional.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="savings-goal" className="text-sm font-medium text-slate-300">
          Monthly Savings Goal (optional)
        </label>
        <input
          id="savings-goal"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="min-h-[44px] w-full rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={savingsGoal === 0 ? '' : String(savingsGoal)}
          onChange={handleChange}
        />
        <p className="text-xs text-slate-500">Set to 0 to skip saving</p>
      </div>
    </div>
  )
}
