// tests/settingsStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '../src/stores/settingsStore'

describe('settingsStore currency', () => {
  beforeEach(() => {
    useSettingsStore.setState({ language: 'en', theme: 'dark', currency: 'KRW' })
  })

  it('has currency defaulting to KRW', () => {
    expect(useSettingsStore.getState().currency).toBe('KRW')
  })

  it('setCurrency updates currency to USD', () => {
    useSettingsStore.getState().setCurrency('USD')
    expect(useSettingsStore.getState().currency).toBe('USD')
  })

  it('setCurrency updates currency to JPY', () => {
    useSettingsStore.getState().setCurrency('JPY')
    expect(useSettingsStore.getState().currency).toBe('JPY')
  })
})
