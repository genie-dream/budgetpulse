// tests/transactions.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { BudgetPulseDB } from '../src/lib/db'
import { groupByDate, smartDateLabel } from '../src/lib/transactionHelpers'
import { useTransactionStore } from '../src/stores/transactionStore'
import type { Transaction } from '../src/types'

// --- groupByDate ---

describe('groupByDate', () => {
  it('returns empty Map for empty array', () => {
    const result = groupByDate([])
    expect(result).toBeInstanceOf(Map)
    expect(result.size).toBe(0)
  })

  it('groups a flat array into a Map keyed by local YYYY-MM-DD date strings', () => {
    const tx1: Transaction = {
      id: 'tx-1',
      amount: 1000,
      category: 'food',
      date: new Date(2026, 2, 10), // Mar 10 local
      createdAt: new Date(),
    }
    const result = groupByDate([tx1])
    expect(result.has('2026-03-10')).toBe(true)
    expect(result.get('2026-03-10')).toHaveLength(1)
  })

  it('groups 3 transactions on 2 different local dates into 2 keys', () => {
    const tx1: Transaction = {
      id: 'tx-1',
      amount: 1000,
      category: 'food',
      date: new Date(2026, 2, 10),
      createdAt: new Date(),
    }
    const tx2: Transaction = {
      id: 'tx-2',
      amount: 2000,
      category: 'transport',
      date: new Date(2026, 2, 10),
      createdAt: new Date(),
    }
    const tx3: Transaction = {
      id: 'tx-3',
      amount: 3000,
      category: 'shopping',
      date: new Date(2026, 2, 11),
      createdAt: new Date(),
    }
    const result = groupByDate([tx1, tx2, tx3])
    expect(result.size).toBe(2)
    expect(result.get('2026-03-10')).toHaveLength(2)
    expect(result.get('2026-03-11')).toHaveLength(1)
  })
})

// --- smartDateLabel ---

describe('smartDateLabel', () => {
  it('returns Today for today\'s ISO date string', () => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    expect(smartDateLabel(todayKey, 'en')).toBe('Today')
  })

  it('returns Yesterday for yesterday\'s ISO date string', () => {
    const yesterday = new Date(Date.now() - 86400000)
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    expect(smartDateLabel(yKey, 'en')).toBe('Yesterday')
  })

  it('returns a locale-formatted string for an older date', () => {
    const result = smartDateLabel('2026-01-15', 'en')
    // Should not be Today or Yesterday
    expect(result).not.toBe('Today')
    expect(result).not.toBe('Yesterday')
    // Should contain Jan or 15 in some format
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// --- Dexie write ---

describe('Dexie write', () => {
  let testDb: BudgetPulseDB

  beforeEach(async () => {
    testDb = new BudgetPulseDB('test-' + Date.now())
    await testDb.open()
  })

  it('db.transactions.add persists transaction with all fields readable back', async () => {
    const tx: Transaction = {
      id: 'dexie-test-1',
      amount: 5500,
      category: 'food',
      memo: 'lunch',
      date: new Date(2026, 2, 13),
      createdAt: new Date(),
    }
    await testDb.transactions.add(tx)
    const record = await testDb.transactions.get('dexie-test-1')
    expect(record).toBeDefined()
    expect(record?.amount).toBe(5500)
    expect(record?.category).toBe('food')
    expect(record?.memo).toBe('lunch')
  })
})

// --- transactionStore addTransaction ---

describe('transactionStore.addTransaction', () => {
  it('prepends transaction to array (newest first)', () => {
    // Reset store state
    useTransactionStore.setState({ transactions: [] })

    const tx1: Transaction = {
      id: 'store-tx-1',
      amount: 1000,
      category: 'food',
      date: new Date(),
      createdAt: new Date(),
    }
    const tx2: Transaction = {
      id: 'store-tx-2',
      amount: 2000,
      category: 'transport',
      date: new Date(),
      createdAt: new Date(),
    }

    useTransactionStore.getState().addTransaction(tx1)
    useTransactionStore.getState().addTransaction(tx2)

    const { transactions } = useTransactionStore.getState()
    expect(transactions[0].id).toBe('store-tx-2')
    expect(transactions[1].id).toBe('store-tx-1')
  })
})
