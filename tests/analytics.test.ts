import { describe, it, expect } from 'vitest'
import { aggregateByCategory, aggregateByDay, getPeriodEndDate } from '../src/lib/analyticsHelpers'
import type { Transaction } from '../src/types'

// Helper to build a minimal Transaction for tests
function tx(
  id: string,
  amount: number,
  category: Transaction['category'],
  date: Date,
): Transaction {
  return { id, amount, category, date, createdAt: date }
}

describe('aggregateByCategory', () => {
  it('returns [] for empty input', () => {
    expect(aggregateByCategory([])).toEqual([])
  })

  it('returns sorted descending by value with two food + one transport', () => {
    const txns = [
      tx('t1', 5000, 'food', new Date(2026, 1, 1)),
      tx('t2', 3000, 'food', new Date(2026, 1, 2)),
      tx('t3', 2000, 'transport', new Date(2026, 1, 3)),
    ]
    const result = aggregateByCategory(txns)
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('food')
    expect(result[0].value).toBe(8000)
    expect(result[1].id).toBe('transport')
    expect(result[1].value).toBe(2000)
  })

  it('excludes categories with zero or negative total', () => {
    // transport has 0 total — should not appear
    const txns = [
      tx('t1', 1000, 'food', new Date(2026, 1, 1)),
    ]
    const result = aggregateByCategory(txns)
    const ids = result.map((r) => r.id)
    expect(ids).not.toContain('transport')
    expect(ids).toContain('food')
  })
})

describe('aggregateByDay', () => {
  it('returns full day range of zeros when no transactions', () => {
    const start = new Date(2026, 1, 1) // Feb 1
    const end = new Date(2026, 1, 3)   // Feb 3
    const result = aggregateByDay([], start, end)
    expect(result).toHaveLength(3)
    expect(result.every((d) => d.amount === 0)).toBe(true)
    expect(result[0].day).toBe('01')
    expect(result[1].day).toBe('02')
    expect(result[2].day).toBe('03')
  })

  it('returns one entry per day with correct amounts on transaction days', () => {
    const start = new Date(2026, 1, 1) // Feb 1
    const end = new Date(2026, 1, 3)   // Feb 3
    const txns = [
      tx('t1', 1500, 'food', new Date(2026, 1, 1)),
      tx('t2', 2500, 'transport', new Date(2026, 1, 3)),
    ]
    const result = aggregateByDay(txns, start, end)
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ day: '01', amount: 1500 })
    expect(result[1]).toEqual({ day: '02', amount: 0 })
    expect(result[2]).toEqual({ day: '03', amount: 2500 })
  })
})

describe('getPeriodEndDate', () => {
  it('monthStartDay=25: Jan 25 period ends Feb 24', () => {
    const start = new Date(2026, 0, 25) // Jan 25
    const end = getPeriodEndDate(start, 25)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(1) // February (0-indexed)
    expect(end.getDate()).toBe(24)
  })

  it('monthStartDay=1: period ends on last day of the period start month', () => {
    const start = new Date(2026, 0, 1) // Jan 1
    const end = getPeriodEndDate(start, 1)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(0) // January
    expect(end.getDate()).toBe(31)
  })

  it('monthStartDay=31: period end in Feb is clamped to Feb 28 (2026 not leap year)', () => {
    const start = new Date(2026, 0, 31) // Jan 31
    const end = getPeriodEndDate(start, 31)
    expect(end.getFullYear()).toBe(2026)
    expect(end.getMonth()).toBe(1) // February
    expect(end.getDate()).toBe(28)
  })
})
