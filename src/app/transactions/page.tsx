'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt } from 'lucide-react'
import { db } from '@/lib/db'
import { useTransactionStore } from '@/stores/transactionStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { groupByDate } from '@/lib/transactionHelpers'
import { CATEGORIES } from '@/lib/constants'
import { CategoryChips } from '@/components/transactions/CategoryChips'
import { DateGroupHeader } from '@/components/transactions/DateGroupHeader'
import { TransactionRow } from '@/components/transactions/TransactionRow'
import { useTranslations } from 'next-intl'
import type { Category } from '@/types'

export default function TransactionsPage() {
  const t = useTranslations('history')
  const transactions = useTransactionStore((s) => s.transactions)
  const isLoading = useTransactionStore((s) => s.isLoading)
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all')

  // Currency from settings store (skipHydration: true — read after hydration)
  const currency = useSettingsStore((s) => s.currency)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true))
    if (useSettingsStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Load transactions from Dexie on mount
  useEffect(() => {
    useTransactionStore.getState().setLoading(true)
    db.transactions
      .orderBy('date')
      .reverse()
      .toArray()
      .then((txns) => {
        useTransactionStore.getState().setTransactions(txns)
        useTransactionStore.getState().setLoading(false)
      })
  }, [])

  // In-memory filter — no Dexie re-fetch on chip tap
  const filtered =
    selectedCategory === 'all'
      ? transactions
      : transactions.filter((tx) => tx.category === selectedCategory)

  const grouped = groupByDate(filtered)

  // Derive used categories for filter chips
  const usedCategoryIds = [...new Set(transactions.map((tx) => tx.category))]
  const usedCategories = CATEGORIES.filter((c) => usedCategoryIds.includes(c.id))

  // Delete handler — owned by the page, passed to TransactionRow
  const handleDelete = async (id: string) => {
    await db.transactions.delete(id)
    useTransactionStore.getState().removeTransaction(id)
  }

  const resolvedCurrency = hydrated ? currency : 'KRW'

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 pb-safe">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-100">{t('title')}</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 pb-safe">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-slate-100">{t('title')}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <Receipt size={48} className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-300">{t('empty')}</h2>
          <Link
            href="/add"
            className="px-6 py-3 rounded-2xl bg-blue-500 text-white text-sm font-semibold min-h-[44px] flex items-center"
          >
            {t('logFirst')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 pb-safe">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-xl font-semibold text-slate-100">{t('title')}</h1>
      </div>

      {/* Category filter chips */}
      <CategoryChips
        categories={usedCategories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        showAll
      />

      {/* Transaction list grouped by date */}
      <div className="flex-1 overflow-y-auto">
        {Array.from(grouped.entries()).map(([dateKey, txnsInGroup]) => {
          const dailyTotal = txnsInGroup.reduce((sum, tx) => sum + tx.amount, 0)
          return (
            <div key={dateKey}>
              <DateGroupHeader
                dateKey={dateKey}
                locale="en"
                dailyTotal={dailyTotal}
                currency={resolvedCurrency}
              />
              {txnsInGroup.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  tx={tx}
                  currency={resolvedCurrency}
                  onDelete={() => handleDelete(tx.id)}
                />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
