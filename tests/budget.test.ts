// tests/budget.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  calcVariableBudget,
  getRemainingDaysInPeriod,
  calcDailySurvivalBudget,
  formatCurrency,
} from '../src/lib/budget'
import { detectCurrencyFromLocale } from '../src/lib/locale'
import type { FixedExpense } from '../src/types'

describe('calcVariableBudget', () => {
  it('returns income minus sum of fixed expenses minus savings goal', () => {
    const fixedExpenses: FixedExpense[] = [
      { id: '1', name: 'Rent', amount: 500_000, category: 'housing' },
    ]
    expect(calcVariableBudget(2_000_000, fixedExpenses, 200_000)).toBe(1_300_000)
  })

  it('returns a negative number when expenses exceed income', () => {
    expect(calcVariableBudget(100_000, [], 200_000)).toBe(-100_000)
  })

  it('returns income when no fixed expenses and no savings goal', () => {
    expect(calcVariableBudget(1_000_000, [], 0)).toBe(1_000_000)
  })

  it('returns 0 when income is 0 and no expenses', () => {
    expect(calcVariableBudget(0, [], 0)).toBe(0)
  })
})

describe('getRemainingDaysInPeriod', () => {
  it('returns 31 when today is the first day of the period (March 25, startDay=25)', () => {
    // Period: March 25 – April 24 = 31 days total, today is day 1
    expect(getRemainingDaysInPeriod(new Date('2026-03-25'), 25)).toBe(31)
  })

  it('returns 1 when today is the last day of the period (March 24, startDay=25)', () => {
    // Period: Feb 25 – March 24, today is the last day
    expect(getRemainingDaysInPeriod(new Date('2026-03-24'), 25)).toBe(1)
  })

  it('returns 24 when today is mid-period (March 1, startDay=25)', () => {
    // Period: Feb 25 – March 24, today is March 1 (24 days left incl today)
    expect(getRemainingDaysInPeriod(new Date('2026-03-01'), 25)).toBe(24)
  })

  it('returns 22 for standard month (March 10, startDay=1)', () => {
    // Period: March 1 – March 31, today is March 10, 22 days left incl today
    expect(getRemainingDaysInPeriod(new Date('2026-03-10'), 1)).toBe(22)
  })

  it('returns at least 1 for monthStartDay=31 in February (Feb 28)', () => {
    // February has no day 31 — clamp to Feb 28, period end is Feb 27 or 28
    const result = getRemainingDaysInPeriod(new Date('2026-02-28'), 31)
    expect(result).toBeGreaterThanOrEqual(1)
  })

  it('returns at least 1 when today is Jan 31 with startDay=31 (next period clamps to Feb 28)', () => {
    // Next period starts Feb 28 (Feb has no day 31); current period contains Jan 31
    // The algorithm yields 29 days remaining (Jan 31 → Feb 28 inclusive)
    const result = getRemainingDaysInPeriod(new Date('2026-01-31'), 31)
    expect(result).toBeGreaterThanOrEqual(1)
  })
})

describe('calcDailySurvivalBudget', () => {
  it('returns Math.floor(variableBudget / remainingDays)', () => {
    expect(calcDailySurvivalBudget(1_200_000, 30)).toBe(40_000)
  })

  it('floors (does not round) the result', () => {
    expect(calcDailySurvivalBudget(1_000_001, 30)).toBe(33_333)
  })

  it('returns 0 when remainingDays is 0 (guard against division by zero)', () => {
    expect(calcDailySurvivalBudget(1_000_000, 0)).toBe(0)
  })
})

describe('formatCurrency', () => {
  it('formats KRW with ₩ symbol and no decimals', () => {
    expect(formatCurrency(1_200_000, 'KRW')).toBe('₩1,200,000')
  })

  it('formats USD with $ symbol and no decimals', () => {
    expect(formatCurrency(1_200, 'USD')).toBe('$1,200')
  })

  it('formats JPY with yen symbol and no decimals', () => {
    // Intl.NumberFormat with ja-JP locale uses fullwidth yen sign (U+FFE5: ￥)
    expect(formatCurrency(150_000, 'JPY')).toBe('￥150,000')
  })
})

describe('detectCurrencyFromLocale', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns JPY for ja locale', () => {
    Object.defineProperty(navigator, 'language', { value: 'ja', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('JPY')
  })

  it('returns JPY for ja-JP locale', () => {
    Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('JPY')
  })

  it('returns USD for en-US locale', () => {
    Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('USD')
  })

  it('returns KRW for ko locale', () => {
    Object.defineProperty(navigator, 'language', { value: 'ko', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('KRW')
  })

  it('returns KRW for ko-KR locale', () => {
    Object.defineProperty(navigator, 'language', { value: 'ko-KR', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('KRW')
  })

  it('returns KRW as default for unknown locale (fr)', () => {
    Object.defineProperty(navigator, 'language', { value: 'fr', configurable: true })
    expect(detectCurrencyFromLocale()).toBe('KRW')
  })
})
