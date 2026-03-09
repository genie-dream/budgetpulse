// tests/BottomNav.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BottomNav } from '../src/components/layout/BottomNav'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock next/link to render a simple anchor
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('BottomNav', () => {
  it('renders exactly 5 navigation tabs', () => {
    render(<BottomNav />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(5)
  })

  it('has correct href for each tab', () => {
    render(<BottomNav />)
    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))
    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/transactions')
    expect(hrefs).toContain('/add')
    expect(hrefs).toContain('/analytics')
    expect(hrefs).toContain('/settings')
  })

  it('Add tab has sr-only label (accessible FAB button)', () => {
    render(<BottomNav />)
    const srOnly = screen.getByText('Add')
    expect(srOnly).toBeInTheDocument()
  })
})
