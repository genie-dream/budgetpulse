// tests/db.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../src/lib/db'

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
