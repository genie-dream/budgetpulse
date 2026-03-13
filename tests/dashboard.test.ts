// tests/dashboard.test.ts
// Dashboard phase — pure function integration tests
// RTL component tests have been moved to dashboard.test.tsx (Plan 04-02)
//
// NOTE: DASH-07 (< 100ms update) is an architectural guarantee from Zustand
// synchronous re-render. No timing test is needed.

import { describe, it, expect } from 'vitest'
import { calcPaceRatio, getPaceStatus } from '../src/lib/budget'

describe('calcPaceRatio + getPaceStatus integration', () => {
  it('returns safe status when pace is well below threshold', () => {
    // Day 1 of 31-day period, spent nothing — ratio should be 0, status safe
    const ratio = calcPaceRatio(0, 310_000, 1, new Date(2026, 2, 1))
    expect(ratio).toBe(0)
    expect(getPaceStatus(ratio)).toBe('safe')
  })

  it('returns caution status when pace is near 1.0', () => {
    // Day 1 of 31-day period, spent exactly on-pace — ratio ~1.0, status caution
    const budget = 310_000
    const onPaceSpend = budget / 31
    const ratio = calcPaceRatio(onPaceSpend, budget, 1, new Date(2026, 2, 1))
    expect(ratio).toBeCloseTo(1.0, 5)
    expect(getPaceStatus(ratio)).toBe('caution')
  })

  it('returns danger status when pace exceeds 1.1', () => {
    // Day 1 of 31-day period, spent 2x on-pace — ratio ~2.0, status danger
    const budget = 310_000
    const overSpend = (budget / 31) * 2
    const ratio = calcPaceRatio(overSpend, budget, 1, new Date(2026, 2, 1))
    expect(ratio).toBeCloseTo(2.0, 5)
    expect(getPaceStatus(ratio)).toBe('danger')
  })

  it('handles over-budget scenario (variableBudget=0)', () => {
    // When variable budget is 0 and some spending occurred — danger sentinel
    const ratio = calcPaceRatio(10_000, 0, 1, new Date(2026, 2, 13))
    expect(ratio).toBe(2)
    expect(getPaceStatus(ratio)).toBe('danger')
  })
})
