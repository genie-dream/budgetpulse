import '@testing-library/jest-dom'

// Provide a working localStorage for zustand persist middleware in jsdom
// jsdom without a URL throws SecurityError on localStorage access
const localStorageMock = (() => {
  const store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value },
    removeItem: (key: string): void => { delete store[key] },
    clear: (): void => { Object.keys(store).forEach((k) => delete store[k]) },
    get length(): number { return Object.keys(store).length },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
