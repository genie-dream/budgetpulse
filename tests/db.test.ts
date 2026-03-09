// tests/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../src/lib/db'
import type { BudgetConfig } from '../src/types'

describe('BudgetPulseDB schema', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('opens database at version 1', () => {
    expect(db.verno).toBe(1)
  })

  it('has budgetConfigs and transactions tables', () => {
    const tableNames = db.tables.map((t) => t.name)
    expect(tableNames).toContain('budgetConfigs')
    expect(tableNames).toContain('transactions')
  })

  it('transactions table has compound index [date+category]', () => {
    const txTable = db.table('transactions')
    const indexes = txTable.schema.indexes.map((i) => i.name)
    expect(indexes).toContain('[date+category]')
  })

  it('can write and read a Transaction record', async () => {
    const tx = {
      id: 'test-1',
      amount: 5000,
      category: 'food' as const,
      date: new Date('2026-03-09'),
      createdAt: new Date(),
    }
    await db.transactions.add(tx)
    const record = await db.transactions.get('test-1')
    expect(record?.amount).toBe(5000)
    expect(record?.category).toBe('food')
  })
})

describe('BudgetConfig persistence', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('can write and read a BudgetConfig with fixedExpenses', async () => {
    const config: BudgetConfig = {
      id: 'budget-1',
      income: 2_000_000,
      fixedExpenses: [
        { id: 'fe-1', name: 'Rent', amount: 500_000, category: 'housing' },
      ],
      savingsGoal: 0,
      monthStartDay: 1,
      currency: 'KRW',
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-01'),
    }
    await db.budgetConfigs.put(config)
    const record = await db.budgetConfigs.get('budget-1')
    expect(record?.income).toBe(2_000_000)
    expect(record?.fixedExpenses).toHaveLength(1)
    expect(record?.fixedExpenses[0].name).toBe('Rent')
    expect(record?.savingsGoal).toBe(0)
    expect(record?.currency).toBe('KRW')
  })
})
