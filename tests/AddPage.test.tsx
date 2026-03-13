// tests/AddPage.test.tsx
// Test scaffold for Add Transaction page (TRAN-02, TRAN-03)
// Add page does not exist yet — all tests use it.todo stubs (vitest exits 0)
import { describe, it } from 'vitest'

describe('AddPage', () => {
  it.todo('amount input has inputmode="numeric" and pattern="[0-9]*"')
  it.todo('category chips row is visible without scrolling on mount')
  it.todo('Save button is disabled when amount is empty')
  it.todo('typing amount and tapping Save calls db.transactions.add and navigates to /')
})
