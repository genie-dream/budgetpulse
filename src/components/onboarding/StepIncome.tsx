'use client'

import { useEffect, useState } from 'react'
import { detectCurrencyFromLocale } from '@/lib/locale'
import type { CurrencyCode } from '@/types'

interface StepIncomeProps {
  income: number
  setIncome: (value: number) => void
  currency: CurrencyCode
  setCurrency: (value: CurrencyCode) => void
}

const CURRENCIES: CurrencyCode[] = ['KRW', 'USD', 'JPY']

/**
 * Step 1: Monthly income input with conditional currency picker.
 * Currency picker only shown for USD or JPY device locales.
 * KRW locale users see income input only (default KRW is silent).
 */
export default function StepIncome({ income, setIncome, currency, setCurrency }: StepIncomeProps) {
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false)

  useEffect(() => {
    const detected = detectCurrencyFromLocale()
    if (detected === 'USD' || detected === 'JPY') {
      setShowCurrencyPicker(true)
      setCurrency(detected)
    }
    // KRW locale: no picker, default stays KRW
  }, [setCurrency])

  function handleIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, '')
    setIncome(raw === '' ? 0 : Number(raw))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">Monthly Income</h2>
        <p className="text-sm text-slate-400">Enter your total monthly take-home pay.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="income" className="text-sm font-medium text-slate-300">
          Income
        </label>
        <input
          id="income"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className="min-h-[44px] w-full rounded-xl bg-slate-800 border border-slate-700 px-4 text-slate-100 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={income === 0 ? '' : String(income)}
          onChange={handleIncomeChange}
        />
      </div>

      {showCurrencyPicker && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-slate-300">Currency</span>
          <div className="flex gap-2">
            {CURRENCIES.map((code) => (
              <button
                key={code}
                onClick={() => setCurrency(code)}
                className={`flex-1 min-h-[44px] rounded-xl border text-sm font-medium transition-colors ${
                  currency === code
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-800 text-slate-400'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
