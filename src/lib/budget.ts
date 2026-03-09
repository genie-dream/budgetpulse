// src/lib/budget.ts
// Pure calculation functions for BudgetPulse — no side effects, no React, no Dexie
import type { CurrencyCode, FixedExpense } from '../types'

/**
 * Returns the number of days in the given month.
 * month is 0-indexed (0 = January, 11 = December).
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/**
 * Calculates the variable budget: income minus all fixed expenses minus savings goal.
 * Can return a negative value when expenses exceed income.
 */
export function calcVariableBudget(
  income: number,
  fixedExpenses: FixedExpense[],
  savingsGoal: number,
): number {
  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
  return income - totalFixed - savingsGoal
}

/**
 * Returns the number of remaining days in the current budget period, inclusive of today.
 *
 * monthStartDay is 1-31. The period runs from monthStartDay of the current (or previous)
 * calendar month up to (monthStartDay - 1) of the next calendar month.
 *
 * Edge cases:
 * - If monthStartDay exceeds days in a month, it is clamped to the last day of that month.
 * - Always returns at least 1 (today always counts).
 */
export function getRemainingDaysInPeriod(today: Date, monthStartDay: number): number {
  const year = today.getFullYear()
  const month = today.getMonth() // 0-indexed
  const dayOfMonth = today.getDate()

  // Clamp monthStartDay to the actual days in the current month
  const clampedStartDay = Math.min(monthStartDay, daysInMonth(year, month))

  let periodEndDate: Date

  if (dayOfMonth >= clampedStartDay) {
    // Period started this calendar month; it ends on (monthStartDay - 1) of next month
    const nextMonth = month + 1
    const nextYear = nextMonth > 11 ? year + 1 : year
    const normalizedNextMonth = nextMonth > 11 ? 0 : nextMonth
    const endDay = Math.min(monthStartDay - 1, daysInMonth(nextYear, normalizedNextMonth))
    // monthStartDay=1 means end day would be 0 — handle standard case: period ends last day of this month
    if (endDay <= 0) {
      // startDay is 1, period is calendar month: ends on last day of this month
      periodEndDate = new Date(year, month, daysInMonth(year, month))
    } else {
      periodEndDate = new Date(nextYear, normalizedNextMonth, endDay)
    }
  } else {
    // Period started last calendar month; it ends on (monthStartDay - 1) of this month
    const endDay = Math.min(monthStartDay - 1, daysInMonth(year, month))
    if (endDay <= 0) {
      // Should not happen for valid monthStartDay >= 1
      periodEndDate = new Date(year, month, daysInMonth(year, month))
    } else {
      periodEndDate = new Date(year, month, endDay)
    }
  }

  // Calculate the difference in days (today inclusive)
  const todayMidnight = new Date(year, month, dayOfMonth)
  const diffMs = periodEndDate.getTime() - todayMidnight.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  return Math.max(diffDays + 1, 1)
}

/**
 * Returns the daily survival budget as a floored integer.
 * Guards against division by zero: returns 0 if remainingDays is 0.
 */
export function calcDailySurvivalBudget(variableBudget: number, remainingDays: number): number {
  if (remainingDays === 0) return 0
  return Math.floor(variableBudget / remainingDays)
}

/** Locale used for Intl.NumberFormat per currency */
const CURRENCY_LOCALE: Record<CurrencyCode, string> = {
  KRW: 'ko-KR',
  USD: 'en-US',
  JPY: 'ja-JP',
}

/**
 * Formats an amount as a currency string with no decimal places.
 * Uses native Intl.NumberFormat for correct symbol placement.
 */
export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
