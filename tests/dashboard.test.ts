// tests/dashboard.test.ts
// Wave 0 scaffold for Dashboard phase (DASH-01 through DASH-06)
//
// Pure function integration tests are fully implemented here.
// RTL component tests are registered as it.todo() stubs because HeroCard
// and StatGrid components do not exist yet — they are created in Plan 04-02.
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

// RTL component tests — stubs for Wave 1+ components

describe('HeroCard', () => {
  // DASH-01: Remaining budget as dominant value
  it.todo('renders remaining budget as the dominant value')
  // DASH-05: Pace badge
  it.todo('renders progress bar with correct width percentage')
  it.todo('renders pace badge with safe/caution/danger label')
  // DASH-06: Over-budget state
  it.todo('shows over-budget state: negative hero value in red, Over budget label, ₩0 survival values')
  it.todo('progress bar is full and red when over-budget')
})

describe('StatGrid', () => {
  // DASH-02: Daily survival budget
  it.todo('renders daily survival budget formatted as currency')
  // DASH-03: Weekly survival budget
  it.todo('renders weekly survival budget as daily x 7')
  // DASH-04: Remaining days count
  it.todo('renders remaining days count')
  // DASH-02: Total spent
  it.todo('renders total spent formatted as currency')
})

describe('DashboardPage integration', () => {
  // DASH-01–DASH-06: Full dashboard render
  it.todo('renders full dashboard after both stores hydrate')
  it.todo('shows skeleton/null before hydration completes')
})
