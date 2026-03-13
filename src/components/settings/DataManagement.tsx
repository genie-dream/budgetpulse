'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { exportDB, importInto, peakImportFile } from 'dexie-export-import'
import { db } from '@/lib/db'
import { useBudgetStore } from '@/stores/budgetStore'

interface DataManagementProps {
  className?: string
}

/**
 * Data management section: JSON export and import with pre-validation.
 * Export: downloads a budgetpulse-backup-YYYY-MM-DD.json file.
 * Import: validates required tables before destructive restore.
 */
export default function DataManagement({ className }: DataManagementProps) {
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleExport() {
    const blob = await exportDB(db, { prettyJson: true })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `budgetpulse-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(file: File) {
    try {
      const meta = await peakImportFile(file)
      const tableNames = meta.data.tables.map((t: { name: string }) => t.name)
      if (!tableNames.includes('transactions') || !tableNames.includes('budgetConfigs')) {
        setImportStatus('error')
        setErrorMessage('Invalid backup file — missing required tables')
        return
      }
      if (!window.confirm(t('settings.importConfirm'))) {
        return
      }
      await importInto(db, file, { clearTablesBeforeImport: true })
      const configs = await db.budgetConfigs.toArray()
      if (configs.length > 0) {
        useBudgetStore.getState().setConfig(configs[configs.length - 1])
      }
      setImportStatus('success')
    } catch (err) {
      setImportStatus('error')
      setErrorMessage(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div data-testid="data-management" className={`flex flex-col gap-3 ${className ?? ''}`}>
      <button
        onClick={handleExport}
        className="min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-medium px-4 text-left flex flex-col gap-0.5"
      >
        <span>{t('settings.export')}</span>
        <span className="text-slate-400 text-xs font-normal">{t('settings.exportDesc')}</span>
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-sm font-medium px-4 text-left flex flex-col gap-0.5"
      >
        <span>{t('settings.import')}</span>
        <span className="text-slate-400 text-xs font-normal">{t('settings.importDesc')}</span>
      </button>

      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleImport(f)
        }}
        className="hidden"
      />

      {importStatus === 'success' && (
        <p className="text-green-400 text-sm">{t('settings.importSuccess')}</p>
      )}
      {importStatus === 'error' && (
        <p className="text-red-400 text-sm">{errorMessage || t('settings.importError')}</p>
      )}
    </div>
  )
}
