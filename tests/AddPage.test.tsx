// tests/AddPage.test.tsx
// RTL tests for Add Transaction page (TRAN-01, TRAN-02, TRAN-03)
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CategoryChips } from '@/components/transactions/CategoryChips'
import { CATEGORIES } from '@/lib/constants'
import type { Category } from '@/types'

// ---- CategoryChips tests ----

describe('CategoryChips', () => {
  it('renders a chip for each category', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    // All 9 categories should be rendered
    expect(screen.getAllByRole('button').length).toBe(9)
  })

  it('renders All chip when showAll=true', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="all" onSelect={onSelect} showAll />
    )
    // 10 buttons: All + 9 categories
    expect(screen.getAllByRole('button').length).toBe(10)
    expect(screen.getByText('All')).toBeInTheDocument()
  })

  it('selected chip has bg-blue-500 class', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    const foodButton = screen.getAllByRole('button')[0]
    expect(foodButton.className).toContain('bg-blue-500')
    expect(foodButton.className).toContain('text-white')
  })

  it('unselected chips have bg-slate-700 class', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    const buttons = screen.getAllByRole('button')
    // transport (index 1) should be unselected
    expect(buttons[1].className).toContain('bg-slate-700')
    expect(buttons[1].className).toContain('text-slate-300')
  })

  it('calls onSelect with category id when chip is tapped', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[1]) // transport
    expect(onSelect).toHaveBeenCalledWith('transport')
  })

  it('calls onSelect with "all" when All chip is tapped', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} showAll />
    )
    fireEvent.click(screen.getByText('All'))
    expect(onSelect).toHaveBeenCalledWith('all')
  })

  it('each chip has min-h-[44px] for touch target', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      expect(btn.className).toContain('min-h-[44px]')
    })
  })

  it('each chip shows emoji and label', () => {
    const onSelect = vi.fn()
    render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    // Food chip: emoji 🍔 and label 'Food'
    expect(screen.getByText('🍔')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('chips container has overflow-x-auto class (no wrap)', () => {
    const onSelect = vi.fn()
    const { container } = render(
      <CategoryChips selected="food" onSelect={onSelect} />
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('overflow-x-auto')
    expect(wrapper.className).not.toContain('flex-wrap')
  })
})
