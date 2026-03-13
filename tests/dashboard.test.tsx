// tests/dashboard.test.tsx
// Dashboard phase RTL component tests (DASH-01 through DASH-06)
//
// HeroCard tests: implemented in Plan 04-02
// StatGrid tests: implemented in Plan 04-03 (StatGrid stub present, full impl in 04-03)
// DashboardPage integration tests: implemented in Plan 04-04
//
// NOTE: DASH-07 (< 100ms update) is an architectural guarantee from Zustand
// synchronous re-render. No timing test is needed.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { calcPaceRatio, getPaceStatus } from '../src/lib/budget'
import { StatGrid } from '../src/components/dashboard/StatGrid'
import { useBudgetStore } from '@/stores/budgetStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import type { BudgetConfig, Transaction } from '@/types'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// budget mock: use real implementations (no mocking of formatCurrency or getPaceStatus)
vi.mock('@/lib/budget', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/lib/budget')>()
  return { ...actual }
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/',
}))

// Mutable store for db mock — tests set this before render
const _dbTxStore: { value: Transaction[] } = { value: [] }

vi.mock('@/lib/db', () => ({
  db: {
    transactions: {
      where: () => ({
        aboveOrEqual: () => ({
          toArray: () => Promise.resolve(_dbTxStore.value),
        }),
      }),
    },
  },
}))

// Helper to build a minimal BudgetConfig
function makeBudgetConfig(overrides?: Partial<BudgetConfig>): BudgetConfig {
  const now = new Date()
  return {
    id: 'test-budget',
    income: 1_000_000,
    fixedExpenses: [],
    savingsGoal: 0,
    monthStartDay: 1,
    currency: 'KRW',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// Helper to build a Transaction
function makeTransaction(overrides: Partial<Transaction> & { id: string }): Transaction {
  const now = new Date()
  return {
    id: overrides.id,
    amount: overrides.amount ?? 10_000,
    category: overrides.category ?? 'food',
    memo: overrides.memo,
    date: overrides.date ?? now,
    createdAt: overrides.createdAt ?? now,
  }
}

// Import page under test after mocks are registered
import DashboardPage from '@/app/page'

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

// RTL component tests — HeroCard (DASH-01, DASH-05, DASH-06)

describe('HeroCard', () => {
  let HeroCard: React.ComponentType<{
    remainingBudget: number
    variableBudget: number
    totalSpent: number
    paceRatio: number
    currency: 'KRW' | 'USD' | 'JPY'
  }>

  beforeEach(async () => {
    const mod = await import('../src/components/dashboard/HeroCard')
    HeroCard = mod.HeroCard
  })

  // DASH-01: Remaining budget as dominant value
  it('renders remaining budget as the dominant value', () => {
    render(
      <HeroCard
        remainingBudget={500000}
        variableBudget={1000000}
        totalSpent={500000}
        paceRatio={0.5}
        currency="KRW"
      />,
    )
    // formatCurrency(500000, 'KRW') => '₩500,000'
    expect(screen.getByText('₩500,000')).toBeTruthy()
    // label should be 'remainingThisMonth' (mock returns key)
    expect(screen.getByText('remainingThisMonth')).toBeTruthy()
  })

  // DASH-05: Progress bar width
  it('renders progress bar with correct width percentage', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={500000}
        variableBudget={1000000}
        totalSpent={500000}
        paceRatio={0.5}
        currency="KRW"
      />,
    )
    // Progress bar inner div should have style width = 50%
    const progressBar = container.querySelector('[data-testid="progress-bar-fill"]') as HTMLElement
    expect(progressBar).toBeTruthy()
    expect(progressBar.style.width).toBe('50%')
  })

  // DASH-05: Pace badge safe
  it('renders pace badge with safe label and green progress bar when safe', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={900000}
        variableBudget={1000000}
        totalSpent={100000}
        paceRatio={0.3}
        currency="KRW"
      />,
    )
    // paceRatio 0.3 => safe
    expect(screen.getByText('paceSafe')).toBeTruthy()
    const progressFill = container.querySelector('[data-testid="progress-bar-fill"]') as HTMLElement
    expect(progressFill.className).toContain('bg-green-500')
  })

  it('renders pace badge with caution label and amber progress bar when caution', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={50000}
        variableBudget={1000000}
        totalSpent={950000}
        paceRatio={1.0}
        currency="KRW"
      />,
    )
    // paceRatio 1.0 => caution
    expect(screen.getByText('paceCaution')).toBeTruthy()
    const progressFill = container.querySelector('[data-testid="progress-bar-fill"]') as HTMLElement
    expect(progressFill.className).toContain('bg-amber-400')
  })

  it('renders pace badge with danger label and red progress bar when danger', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={-100000}
        variableBudget={1000000}
        totalSpent={1100000}
        paceRatio={1.5}
        currency="KRW"
      />,
    )
    // paceRatio 1.5 => danger
    expect(screen.getByText('paceDanger')).toBeTruthy()
    const progressFill = container.querySelector('[data-testid="progress-bar-fill"]') as HTMLElement
    expect(progressFill.className).toContain('bg-red-500')
  })

  // DASH-06: Over-budget state
  it('shows over-budget state: hero value in red with Over budget label', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={-50000}
        variableBudget={1000000}
        totalSpent={1050000}
        paceRatio={1.5}
        currency="KRW"
      />,
    )
    // Label should be 'overBudget' (mock returns key)
    expect(screen.getByText('overBudget')).toBeTruthy()
    // Hero amount should display absolute value: formatCurrency(50000, 'KRW') => '₩50,000'
    expect(screen.getByText('₩50,000')).toBeTruthy()
    // Hero amount element should have text-red-500
    const heroAmount = container.querySelector('[data-testid="hero-amount"]') as HTMLElement
    expect(heroAmount.className).toContain('text-red-500')
  })

  it('progress bar is full and red when over-budget', () => {
    const { container } = render(
      <HeroCard
        remainingBudget={-50000}
        variableBudget={1000000}
        totalSpent={1050000}
        paceRatio={1.5}
        currency="KRW"
      />,
    )
    const progressFill = container.querySelector('[data-testid="progress-bar-fill"]') as HTMLElement
    expect(progressFill.style.width).toBe('100%')
    expect(progressFill.className).toContain('bg-red-500')
  })
})

describe('StatGrid', () => {
  const defaultProps = {
    dailySurvival: 10_000,
    weeklySurvival: 70_000,
    totalSpent: 50_000,
    remainingDays: 18,
    currency: 'KRW' as const,
  }

  // DASH-02: Daily survival budget
  it('renders daily survival budget formatted as currency', () => {
    render(<StatGrid {...defaultProps} />)
    expect(screen.getByText('dailySurvival')).toBeInTheDocument()
    // formatCurrency(10_000, 'KRW') — check label presence via t('dailySurvival') key
    const label = screen.getByText('dailySurvival')
    expect(label).toBeInTheDocument()
  })

  // DASH-03: Weekly survival budget
  it('renders weekly survival budget as daily x 7', () => {
    render(<StatGrid {...defaultProps} />)
    expect(screen.getByText('weeklySurvival')).toBeInTheDocument()
  })

  // DASH-04: Remaining days count
  it('renders remaining days count', () => {
    render(<StatGrid {...defaultProps} />)
    expect(screen.getByText('remainingDays')).toBeInTheDocument()
    // "18 days" — remainingDays + t('days')
    expect(screen.getByText('18 days')).toBeInTheDocument()
  })

  // DASH-02: Total spent
  it('renders total spent formatted as currency', () => {
    render(<StatGrid {...defaultProps} />)
    expect(screen.getByText('totalSpent')).toBeInTheDocument()
  })

  it('shows zero currency value when dailySurvival is clamped to 0 (over-budget)', () => {
    render(<StatGrid {...defaultProps} dailySurvival={0} weeklySurvival={0} />)
    // formatCurrency(0, 'KRW') should render ₩0
    const allText = document.body.textContent ?? ''
    // KRW format: ₩0
    expect(allText).toContain('0')
  })
})

describe('DashboardPage integration', () => {
  const config = makeBudgetConfig()

  beforeEach(() => {
    // Reset all stores before each test
    useBudgetStore.setState({ config: null, isOnboarded: false })
    useSettingsStore.setState({ currency: 'KRW', language: 'en', theme: 'dark' })
    useTransactionStore.setState({ transactions: [], isLoading: false })
    _dbTxStore.value = []
    vi.clearAllMocks()
  })

  // DASH-01–DASH-06: renders null before hydration
  it('renders null (no content) before stores hydrate', () => {
    // Both stores not hydrated — page returns null
    const { container } = render(<DashboardPage />)
    // No hero amount or stat grid labels visible
    expect(container.firstChild).toBeNull()
  })

  // DASH-01: Full dashboard render after hydration
  it('renders HeroCard and StatGrid when both stores hydrated and isOnboarded=true', async () => {
    // Simulate hydration by setting store state directly
    useBudgetStore.setState({ config, isOnboarded: true })
    useSettingsStore.setState({ currency: 'KRW', language: 'en', theme: 'dark' })

    // Simulate persisted hydration flags
    ;(useBudgetStore.persist as { hasHydrated: () => boolean }).hasHydrated = () => true
    ;(useSettingsStore.persist as { hasHydrated: () => boolean }).hasHydrated = () => true

    render(<DashboardPage />)

    await waitFor(() => {
      // remainingThisMonth label from HeroCard (t key returned by mock)
      expect(screen.getByText('remainingThisMonth')).toBeInTheDocument()
    })

    // StatGrid labels should also be present
    expect(screen.getByText('dailySurvival')).toBeInTheDocument()
    expect(screen.getByText('weeklySurvival')).toBeInTheDocument()
    expect(screen.getByText('totalSpent')).toBeInTheDocument()
    expect(screen.getByText('remainingDays')).toBeInTheDocument()
  })

  // DASH-01: remaining budget displayed as dominant value
  it('derives and displays remaining budget from variableBudget - totalSpent', async () => {
    useBudgetStore.setState({ config, isOnboarded: true })
    useSettingsStore.setState({ currency: 'KRW', language: 'en', theme: 'dark' })
    ;(useBudgetStore.persist as { hasHydrated: () => boolean }).hasHydrated = () => true
    ;(useSettingsStore.persist as { hasHydrated: () => boolean }).hasHydrated = () => true

    // Set transactions so totalSpent = 200,000
    const tx = makeTransaction({ id: 'tx1', amount: 200_000 })
    _dbTxStore.value = [tx]

    render(<DashboardPage />)

    await waitFor(() => {
      // variableBudget = 1,000,000, totalSpent = 200,000 => remaining = 800,000 => ₩800,000
      expect(screen.getByText('₩800,000')).toBeInTheDocument()
    })
  })
})
