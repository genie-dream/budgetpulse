// src/lib/transactionHelpers.ts
import type { Transaction } from '@/types'

// Groups by LOCAL calendar date (avoids UTC midnight drift)
export function groupByDate(txns: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const tx of txns) {
    const d = tx.date instanceof Date ? tx.date : new Date(tx.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(tx)
  }
  return map
}

// Returns 'Today', 'Yesterday', or locale-formatted date (e.g. 'Mar 8')
export function smartDateLabel(isoDate: string, locale: string): string {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const yesterday = new Date(now.getTime() - 86400000)
  const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (isoDate === todayKey) return 'Today'
  if (isoDate === yKey) return 'Yesterday'
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
}
