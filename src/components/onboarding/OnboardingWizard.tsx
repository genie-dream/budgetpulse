'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { calcVariableBudget } from '@/lib/budget'
import { db } from '@/lib/db'
import { useBudgetStore } from '@/stores/budgetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import type { BudgetConfig, CurrencyCode, FixedExpense } from '@/types'
import ProgressIndicator from './ProgressIndicator'
import LiveBudgetBar from './LiveBudgetBar'
import StepIncome from './StepIncome'
import StepFixedExpenses from './StepFixedExpenses'
import StepSavingsGoal from './StepSavingsGoal'

/**
 * Top-level onboarding wizard orchestrator.
 * Manages step state, form data, and the submit handler.
 * Layout: ProgressIndicator → step content → LiveBudgetBar → CTA buttons.
 */
export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [income, setIncome] = useState(0)
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([])
  const [savingsGoal, setSavingsGoal] = useState(0)
  const [currency, setCurrency] = useState<CurrencyCode>('KRW')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const variableBudget = calcVariableBudget(income, fixedExpenses, savingsGoal)

  async function handleFinish() {
    setIsSubmitting(true)
    try {
      const config: BudgetConfig = {
        id: crypto.randomUUID(),
        income,
        fixedExpenses,
        savingsGoal,
        monthStartDay: 1,
        currency,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await db.budgetConfigs.put(config)
      useBudgetStore.getState().setConfig(config)
      useBudgetStore.getState().setOnboarded(true)
      useSettingsStore.getState().setCurrency(currency)
      router.replace('/')
    } catch (err) {
      console.error('Failed to save budget config:', err)
      setIsSubmitting(false)
    }
  }

  function handleNext() {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
  }

  function handleBack() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Step progress indicator */}
      <div className="px-4 pt-4">
        <ProgressIndicator currentStep={step} totalSteps={3} />
      </div>

      {/* Step content area — scrollable, fills remaining space */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {step === 1 && (
          <StepIncome
            income={income}
            setIncome={setIncome}
            currency={currency}
            setCurrency={setCurrency}
          />
        )}
        {step === 2 && (
          <StepFixedExpenses
            fixedExpenses={fixedExpenses}
            setFixedExpenses={setFixedExpenses}
            currency={currency}
          />
        )}
        {step === 3 && (
          <StepSavingsGoal
            savingsGoal={savingsGoal}
            setSavingsGoal={setSavingsGoal}
            currency={currency}
          />
        )}
      </div>

      {/* Live variable budget bar — sticky above CTA buttons */}
      <LiveBudgetBar variableBudget={variableBudget} currency={currency} />

      {/* CTA button area */}
      <div className="flex gap-3 px-4 py-4 bg-slate-900 border-t border-slate-800">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 min-h-[44px] rounded-xl border border-slate-600 text-slate-300 text-sm font-medium"
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            className="flex-1 min-h-[44px] rounded-xl bg-blue-600 text-white text-sm font-semibold"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={isSubmitting}
            className="flex-1 min-h-[44px] rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  )
}
