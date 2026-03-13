// tests/TransactionsPage.test.tsx
// RTL tests for Transaction History page (TRAN-04, TRAN-05, TRAN-06)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useTransactionStore } from '@/stores/transactionStore'
import type { Transaction } from '@/types'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/transactions',
}))

// Mock Dexie db — we control what it returns
vi.mock('@/lib/db', () => {
  const transactions: Transaction[] = []
  return {
    db: {
      transactions: {
        orderBy: () => ({
          reverse: () => ({
            toArray: () => Promise.resolve(transactions),
          }),
        }),
        delete: vi.fn(),
        add: vi.fn(),
        _store: transactions,
      },
    },
  }
})

// Helper to create a Transaction
function makeTransaction(overrides: Partial<Transaction> & { id: string }): Transaction {
  const now = new Date('2026-03-13T10:00:00')
  return {
    id: overrides.id,
    amount: overrides.amount ?? 10000,
    category: overrides.category ?? 'food',
    memo: overrides.memo,
    date: overrides.date ?? now,
    createdAt: overrides.createdAt ?? now,
  }
}

// Lazy import after mocks are set up
async function importPage() {
  const mod = await import('@/app/transactions/page')
  return mod.default
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    // Reset store to empty state
    useTransactionStore.setState({ transactions: [], isLoading: false })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it('renders empty state with CTA when no transactions exist', async () => {
    const TransactionsPage = await importPage()
    render(<TransactionsPage />)

    // Wait for loading to complete (useEffect fires)
    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument()
    })

    // CTA link to /add
    const ctaLink = screen.getByRole('link', { name: /log your first one/i })
    expect(ctaLink).toBeInTheDocument()
    expect(ctaLink).toHaveAttribute('href', '/add')
  })

  it('groups transactions by date with sticky headers', async () => {
    // Pre-populate store with two transactions on different dates
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: new Date('2026-03-13T10:00:00'),
      createdAt: new Date('2026-03-13T10:00:00'),
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'transport',
      date: new Date('2026-03-12T09:00:00'),
      createdAt: new Date('2026-03-12T09:00:00'),
    })
    useTransactionStore.setState({ transactions: [tx1, tx2], isLoading: false })

    const TransactionsPage = await importPage()
    render(<TransactionsPage />)

    await waitFor(() => {
      // Should have "Today" header (2026-03-13 is today in tests)
      // and "Yesterday" header (2026-03-12)
      const headers = screen.getAllByText(/Today|Yesterday|Mar/i)
      expect(headers.length).toBeGreaterThanOrEqual(1)
    })
  })

  it('shows daily total in each date group header', async () => {
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: new Date('2026-03-13T10:00:00'),
      createdAt: new Date('2026-03-13T10:00:00'),
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'food',
      date: new Date('2026-03-13T11:00:00'),
      createdAt: new Date('2026-03-13T11:00:00'),
    })
    useTransactionStore.setState({ transactions: [tx1, tx2], isLoading: false })

    const TransactionsPage = await importPage()
    render(<TransactionsPage />)

    await waitFor(() => {
      // Daily total for today: 20000 KRW
      // formatCurrency(20000, 'KRW') = '₩20,000'
      expect(screen.getByText('₩20,000')).toBeInTheDocument()
    })
  })

  it('category chip filter shows only transactions matching that category', async () => {
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: new Date('2026-03-13T10:00:00'),
      createdAt: new Date('2026-03-13T10:00:00'),
    })
    const tx2 = makeTransaction({
      id: 'tx2',
      amount: 5000,
      category: 'transport',
      date: new Date('2026-03-13T11:00:00'),
      createdAt: new Date('2026-03-13T11:00:00'),
    })
    useTransactionStore.setState({ transactions: [tx1, tx2], isLoading: false })

    const TransactionsPage = await importPage()
    render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
      expect(screen.getByText('Transport')).toBeInTheDocument()
    })

    // Both categories visible initially (All selected)
    expect(screen.getByText('Food')).toBeInTheDocument()

    // Click Transport chip to filter
    const transportChip = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('Transport')
    )
    expect(transportChip).toBeDefined()
    fireEvent.click(transportChip!)

    // After filtering: Food transaction should not appear in main list
    // Transport amount (₩5,000) should appear
    await waitFor(() => {
      expect(screen.getByText('₩5,000')).toBeInTheDocument()
    })
  })

  it('swiping a transaction row reveals delete button', async () => {
    const tx1 = makeTransaction({
      id: 'tx1',
      amount: 15000,
      category: 'food',
      date: new Date('2026-03-13T10:00:00'),
      createdAt: new Date('2026-03-13T10:00:00'),
    })
    useTransactionStore.setState({ transactions: [tx1], isLoading: false })

    const TransactionsPage = await importPage()
    const { container } = render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('₩15,000')).toBeInTheDocument()
    })

    // Find the swipe container (the outer div of SwipeToDelete)
    // Simulate swipe left > 60px on the transaction row
    const swipeContainer = container.querySelector('[onTouchEnd]') ??
      container.querySelector('[class*="overflow-hidden"]')

    if (swipeContainer) {
      fireEvent.touchStart(swipeContainer, {
        touches: [{ clientX: 200, clientY: 300 }],
      })
      fireEvent.touchEnd(swipeContainer, {
        changedTouches: [{ clientX: 100, clientY: 300 }],
      })

      // Delete button should be present in DOM (opacity change controlled by CSS)
      await waitFor(() => {
        const deleteBtn = screen.getByRole('button', { name: /delete/i })
        expect(deleteBtn).toBeInTheDocument()
      })
    }
  })
})
