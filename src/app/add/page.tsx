'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '@/lib/db'
import { getPeriodStartDate } from '@/lib/budget'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useBudgetStore } from '@/stores/budgetStore'
import { CategoryChips } from '@/components/transactions/CategoryChips'
import type { Category, Transaction } from '@/types'

export default function AddTransactionPage() {
  const t = useTranslations('add')
  const tCommon = useTranslations('common')
  const router = useRouter()

  // Amount input
  const amountRef = useRef<HTMLInputElement>(null)
  const [amountValue, setAmountValue] = useState('')

  // Category
  const lastUsedCategory = useTransactionStore((s) => s.lastUsedCategory)
  const [selectedCategory, setSelectedCategory] = useState<Category>(lastUsedCategory)

  // Details panel
  const [showDetails, setShowDetails] = useState(false)
  const [memo, setMemo] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Budget config — for period-aware transaction filtering (DASH-07)
  const config = useBudgetStore((s) => s.config)

  // Currency — read after hydration (skipHydration: true on settingsStore)
  const [hydrated, setHydrated] = useState(false)
  const currency = useSettingsStore((s) => s.currency)

  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true))
    if (useSettingsStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Auto-focus amount input (iOS workaround: defer by 50ms)
  useEffect(() => {
    const t = setTimeout(() => amountRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const currencySymbol =
    currency === 'KRW' ? '₩' : currency === 'USD' ? '$' : '¥'

  const parsedAmount =
    currency === 'KRW'
      ? Math.round(parseFloat(amountValue))
      : parseFloat(amountValue)

  const isSaveDisabled =
    !amountValue || isNaN(parsedAmount) || parsedAmount <= 0

  async function handleSave() {
    if (isSaveDisabled) return
    const tx: Transaction = {
      id: crypto.randomUUID(),
      amount: parsedAmount,
      category: selectedCategory,
      memo: memo.trim() || undefined,
      date: selectedDate ?? new Date(),
      createdAt: new Date(),
    }
    const periodStart = config
      ? getPeriodStartDate(new Date(), config.monthStartDay)
      : new Date(0) // defensive: if no config, include all (epoch = include everything)
    await db.transactions.add(tx)
    if (tx.date >= periodStart) {
      useTransactionStore.getState().addTransaction(tx)
    }
    useTransactionStore.getState().setLastUsedCategory(selectedCategory)
    router.push('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label={tCommon('back')}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">{t('title')}</h1>
      </div>

      {/* Amount input */}
      <div className="flex items-center px-4 py-2">
        <span className="text-4xl font-bold text-slate-300 mr-1">
          {hydrated ? currencySymbol : ''}
        </span>
        <input
          ref={amountRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          value={amountValue}
          onChange={(e) => setAmountValue(e.target.value)}
          className="flex-1 text-4xl font-bold bg-transparent outline-none placeholder-slate-600 text-slate-100"
          aria-label={t('amount')}
        />
      </div>

      {/* Category chips */}
      <div className="mt-2">
        <CategoryChips
          selected={selectedCategory}
          onSelect={(id) => {
            if (id !== 'all') setSelectedCategory(id)
          }}
        />
      </div>

      {/* Add details toggle */}
      <div className="px-4 mt-2">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 py-2"
        >
          {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {t('addDetails')}
        </button>

        {showDetails && (
          <div className="flex flex-col gap-3 mt-2">
            {/* Memo */}
            <input
              type="text"
              placeholder={t('memo')}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full bg-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 outline-none placeholder-slate-500"
            />
            {/* Date */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-400 w-12 shrink-0">
                {t('date')}
              </label>
              <input
                type="date"
                value={
                  selectedDate
                    ? selectedDate.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                onChange={(e) =>
                  setSelectedDate(e.target.value ? new Date(e.target.value) : null)
                }
                className="flex-1 bg-slate-800 rounded-lg px-4 py-3 text-sm text-slate-100 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save button */}
      <div className="px-4 pb-6">
        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className="w-full py-4 rounded-2xl text-base font-semibold bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('save')}
        </button>
      </div>
    </div>
  )
}
