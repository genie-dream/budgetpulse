// src/lib/analyticsHelpers.ts
// Pure data-transformation functions for the Analytics page.
// No side effects, no React, no Dexie — only local Date math and array operations.

import type { Category, Transaction } from '../types'

// Human-readable category label (labelEn) — matches categoryConstants pattern
const CATEGORY_LABEL: Record<Category, string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  health: 'Health',
  education: 'Education',
  housing: 'Housing',
  communication: 'Communication',
  other: 'Other',
}

/**
 * Per-category spending total for the chart data layer.
 * id matches the Category union; name is the English display label.
 */
export interface CategoryTotal {
  id: Category
  name: string
  value: number
}

/**
 * Per-day spending total.
 * day is the zero-padded day-of-month string ('01'–'31').
 */
export interface DailyTotal {
  day: string
  amount: number
}

/**
 * Aggregates transactions by category, filters out zero-spend categories,
 * and returns results sorted descending by total value.
 */
export function aggregateByCategory(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<Category, number>()

  for (const tx of transactions) {
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount)
  }

  const result: CategoryTotal[] = []
  for (const [category, value] of totals) {
    if (value > 0) {
      result.push({ id: category, name: CATEGORY_LABEL[category], value })
    }
  }

  result.sort((a, b) => b.value - a.value)
  return result
}

/**
 * Builds a full day-by-day array from periodStart to periodEnd (inclusive).
 * Each entry's day is the zero-padded day-of-month.
 * Days with no transactions have amount 0.
 *
 * Uses local-date keys (getFullYear/getMonth/getDate) to avoid UTC midnight drift
 * for UTC+9 mobile users — same pattern as transactionHelpers.groupByDate.
 */
export function aggregateByDay(
  transactions: Transaction[],
  periodStart: Date,
  periodEnd: Date,
): DailyTotal[] {
  // Build a lookup map: 'YYYY-MM-DD' -> total amount
  const dailyMap = new Map<string, number>()
  for (const tx of transactions) {
    const d = tx.date instanceof Date ? tx.date : new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + tx.amount)
  }

  // Iterate each day in the period range
  const result: DailyTotal[] = []
  const cursor = new Date(
    periodStart.getFullYear(),
    periodStart.getMonth(),
    periodStart.getDate(),
  )
  const endMs = new Date(
    periodEnd.getFullYear(),
    periodEnd.getMonth(),
    periodEnd.getDate(),
  ).getTime()

  while (cursor.getTime() <= endMs) {
    const y = cursor.getFullYear()
    const m = cursor.getMonth()
    const d = cursor.getDate()
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const day = String(d).padStart(2, '0')
    result.push({ day, amount: dailyMap.get(key) ?? 0 })

    // Advance one day using local-date math (avoids DST edge cases)
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

/**
 * Returns the last day of the budget period that starts on periodStart.
 *
 * Rules:
 * - monthStartDay=1: period ends on the last day of periodStart's calendar month.
 * - General case: end day = monthStartDay - 1, in the month following periodStart.
 *   If that end day exceeds the days in the following month, it is clamped (e.g. Feb).
 *
 * Uses local Date constructor exclusively — no ISO strings.
 */
export function getPeriodEndDate(periodStart: Date, monthStartDay: number): Date {
  const y = periodStart.getFullYear()
  const m = periodStart.getMonth() // 0-indexed

  if (monthStartDay === 1) {
    // Period is a calendar month — ends on the last day of periodStart's month
    return new Date(y, m + 1, 0) // day 0 of next month = last day of current month
  }

  // General case: period ends on (monthStartDay - 1) in the following month
  const endMonth = m + 1
  const endYear = endMonth > 11 ? y + 1 : y
  const normalizedEndMonth = endMonth > 11 ? 0 : endMonth

  const daysInEndMonth = new Date(endYear, normalizedEndMonth + 1, 0).getDate()
  const endDay = Math.min(monthStartDay - 1, daysInEndMonth)

  return new Date(endYear, normalizedEndMonth, endDay)
}
