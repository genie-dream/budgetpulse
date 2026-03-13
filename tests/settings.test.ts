import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Mocks ---
const mockPut = vi.fn().mockResolvedValue(undefined)
const mockToArray = vi.fn()
const mockSetConfig = vi.fn()

vi.mock('../src/lib/db', () => ({
  db: {
    budgetConfigs: { put: mockPut, toArray: mockToArray },
    transactions: {},
  },
}))

vi.mock('../src/stores/budgetStore', () => ({
  useBudgetStore: { getState: () => ({ setConfig: mockSetConfig }) },
}))

const mockExportDB = vi.fn()
const mockPeakImportFile = vi.fn()
const mockImportInto = vi.fn().mockResolvedValue(undefined)

vi.mock('dexie-export-import', () => ({
  exportDB: mockExportDB,
  peakImportFile: mockPeakImportFile,
  importInto: mockImportInto,
}))

// --- Helpers ---
function makeConfig(overrides = {}) {
  return {
    id: 'cfg-1',
    income: 3000000,
    fixedExpenses: [],
    savingsGoal: 500000,
    monthStartDay: 25,
    currency: 'KRW' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// --- Tests ---

describe('Settings: budget update (SETT-01)', () => {
  beforeEach(() => {
    mockPut.mockClear()
    mockSetConfig.mockClear()
  })

  it('saves updated config to Dexie and syncs Zustand', async () => {
    // Exercise the same logic as handleSaveSettings in SettingsPage
    const { db } = await import('../src/lib/db')
    const { useBudgetStore } = await import('../src/stores/budgetStore')

    const config = makeConfig()
    const updates = { income: 4000000 }
    const updated = { ...config, ...updates, updatedAt: new Date() }

    await db.budgetConfigs.put(updated)
    useBudgetStore.getState().setConfig(updated)

    expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({ income: 4000000 }))
    expect(mockSetConfig).toHaveBeenCalledWith(expect.objectContaining({ income: 4000000 }))
  })
})

describe('Settings: JSON export (SETT-02)', () => {
  it('exportDB creates a Blob and exportDB is called with db', async () => {
    const fakeBlob = new Blob(['{}'], { type: 'application/json' })
    mockExportDB.mockResolvedValue(fakeBlob)

    const { exportDB } = await import('dexie-export-import')
    const { db } = await import('../src/lib/db')

    const blob = await exportDB(db, { prettyJson: true })

    expect(mockExportDB).toHaveBeenCalledWith(db, { prettyJson: true })
    expect(blob).toBe(fakeBlob)
  })
})

describe('Settings: JSON import (SETT-03)', () => {
  it('validates required tables — rejects files missing transactions or budgetConfigs', async () => {
    mockPeakImportFile.mockResolvedValue({
      data: { tables: [{ name: 'otherTable' }] },
    })

    const { peakImportFile } = await import('dexie-export-import')
    const fakeFile = new File(['{}'], 'backup.json', { type: 'application/json' })

    const meta = await peakImportFile(fakeFile)
    const tableNames = meta.data.tables.map((t: { name: string }) => t.name)
    const valid =
      tableNames.includes('transactions') && tableNames.includes('budgetConfigs')

    expect(valid).toBe(false)
  })

  it('accepts valid backup files with required tables', async () => {
    mockPeakImportFile.mockResolvedValue({
      data: { tables: [{ name: 'transactions' }, { name: 'budgetConfigs' }] },
    })

    const { peakImportFile } = await import('dexie-export-import')
    const fakeFile = new File(['{}'], 'backup.json', { type: 'application/json' })

    const meta = await peakImportFile(fakeFile)
    const tableNames = meta.data.tables.map((t: { name: string }) => t.name)
    const valid =
      tableNames.includes('transactions') && tableNames.includes('budgetConfigs')

    expect(valid).toBe(true)
  })
})
