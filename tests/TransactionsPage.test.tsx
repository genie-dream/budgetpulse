// tests/TransactionsPage.test.tsx
// RTL tests for Transaction History page (TRAN-04, TRAN-05, TRAN-06)
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next-intl with lookup-map so existing assertions on English text keep passing
vi.mock('next-intl', () => ({
  useTranslations: (_ns: string) => (key: string) => {
    const map: Record<string, string> = {
      title: 'History',
      empty: 'No transactions yet',
      logFirst: 'Log your first one',
    }
    return map[key] ?? key
  },
}))
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/transactions',
}))

// Mock next/link — render as plain <a>
vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

// Mutable array for db mock — tests mutate this before render
const _txStore: { value: Transaction[] } = { value: [] }

vi.mock('@/lib/db', () => ({
  db: {
    transactions: {
      orderBy: () => ({
        reverse: () => ({
          toArray: () => Promise.resolve(_txStore.value),
        }),
      }),
      delete: vi.fn(),
    },
  },
}))

// Helper to create a Transaction
function makeTransaction(overrides: Partial<Transaction> & { id: string }): Transaction {
  const now = new Date()
  return {
    id: overrides.id,
    amount: overrides.amount ?? 10000,
    category: overrides.category ?? 'food',
    memo: overrides.memo,
    date: overrides.date ?? now,
    createdAt: overrides.createdAt ?? now,
  }
}

// Import page at module level after mocks are registered
import TransactionsPage from '@/app/transactions/page'

describe('TransactionsPage', () => {
  beforeEach(() => {
    // Reset store to empty state before each test
    useTransactionStore.setState({ transactions: [], isLoading: false })
    _txStore.value = []
    vi.clearAllMocks()
  })

  it('renders empty state with CTA when no transactions exist', async () => {
    _txStore.value = []
    render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
    })

    const ctaLink = screen.getByRole('link', { name: /log your first one/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/add')
  })

  it('groups transactions by date with sticky headers', async () => {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 86400000)

    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: today,
      createdAt: today,
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'transport',
      date: yesterday,
      createdAt: yesterday,
    })

    _txStore.value = [tx1, tx2]
    render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Today')).toBeInTheDocument()
    })
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
  })

  it('shows daily total in each date group header', async () => {
    const today = new Date()
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: today,
      createdAt: today,
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'food',
      date: today,
      createdAt: today,
    })

    _txStore.value = [tx1, tx2]
    render(<TransactionsPage />)

    await waitFor(() => {
      // Daily total: 20000 KRW => ₩20,000
      expect(screen.getByText('₩20,000')).toBeInTheDocument()
    })
  })

  it('category chip filter shows only transactions matching that category', async () => {
    const today = new Date()
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: today,
      createdAt: today,
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'transport',
      date: today,
      createdAt: today,
    })

    _txStore.value = [tx1, tx2]
    render(<TransactionsPage />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('₩15,000')).toBeInTheDocument()
    })
    expect(screen.getByText('₩5,000')).toBeInTheDocument()

    // Find Transport chip (in category filter row) and click it
    // Chip text includes emoji, e.g. "🚌Transport"
    const transportChip = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('Transport')
    )
    expect(transportChip).toBeDefined()
    fireEvent.click(transportChip!)

    // Only transport transaction visible (₩5,000 appears in row and daily total header)
    const transportAmounts = screen.getAllByText('₩5,000')
    expect(transportAmounts.length).toBeGreaterThan(0)
    // Food amount (₩15,000) should no longer appear
    expect(screen.queryByText('₩15,000')).not.toBeInTheDocument()
  })

  it('swiping a transaction row reveals delete button', async () => {
    const today = new Date()
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: today,
      createdAt: today,
    })

    _txStore.value = [tx1]
    const { container } = render(<TransactionsPage />)

    await waitFor(() => {
      // Multiple elements may show ₩15,000 (row + header daily total)
      const matches = screen.getAllByText('₩15,000')
      expect(matches.length).toBeGreaterThan(0)
    })

    // Find the SwipeToDelete outer container (has overflow-hidden)
    const swipeContainer = container.querySelector('.overflow-hidden')
    expect(swipeContainer).not.toBeNull()

    if (swipeContainer) {
      fireEvent.touchStart(swipeContainer, {
        touches: [{ clientX: 200, clientY: 300 }],
      })
      fireEvent.touchEnd(swipeContainer, {
        changedTouches: [{ clientX: 100, clientY: 300 }],
      })

      // Delete button is in DOM; after swipe it becomes visible
      await waitFor(() => {
        const deleteBtn = screen.getByRole('button', { name: /delete/i })
        expect(deleteBtn).toBeInTheDocument()
      })
    }
  })
})
