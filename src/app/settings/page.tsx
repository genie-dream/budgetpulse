'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useBudgetStore } from '@/stores/budgetStore'
import { db } from '@/lib/db'
import type { BudgetConfig } from '@/types'
import { BudgetEditForm } from '@/components/settings/BudgetEditForm'
import DataManagement from '@/components/settings/DataManagement'

/**
 * Settings page: budget editing (SETT-01), JSON export (SETT-02), JSON import (SETT-03).
 * Hydration guard prevents rendering stale state before Zustand persist rehydrates.
 */
export default function SettingsPage() {
  const t = useTranslations()
  const config = useBudgetStore((s) => s.config)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const unsub = useBudgetStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBudgetStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  async function handleSaveSettings(updates: Partial<BudgetConfig>) {
    if (!config) return
    const updated: BudgetConfig = { ...config, ...updates, updatedAt: new Date() }
    await db.budgetConfigs.put(updated)
    useBudgetStore.getState().setConfig(updated) // sync Zustand — dashboard recalculates immediately
  }

  if (!hydrated) {
    return <div className="p-4 text-slate-400">{t('common.loading')}</div>
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <h1 className="text-xl font-semibold text-slate-100">{t('settings.title')}</h1>

      {config && (
        <section>
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
            {t('settings.budget')}
          </h2>
          <BudgetEditForm config={config} onSave={handleSaveSettings} />
        </section>
      )}

      <section>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
          {t('settings.data')}
        </h2>
        <DataManagement />
      </section>
    </div>
  )
}
