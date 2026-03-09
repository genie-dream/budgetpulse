// tests/manifest.test.ts
import { describe, it, expect } from 'vitest'
import manifest from '../src/app/manifest'

describe('PWA manifest', () => {
  const m = manifest()

  it('exports valid manifest with name, short_name, start_url, display:standalone', () => {
    expect(m.name).toBe('BudgetPulse')
    expect(m.short_name).toBe('BudgetPulse')
    expect(m.start_url).toBe('/')
    expect(m.display).toBe('standalone')
  })

  it('has icon entries for 192x192 and 512x512', () => {
    const sizes = m.icons?.map((i) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
  })

  it('has theme_color #3B82F6 and background_color #0F172A', () => {
    expect(m.theme_color).toBe('#3B82F6')
    expect(m.background_color).toBe('#0F172A')
  })
})
