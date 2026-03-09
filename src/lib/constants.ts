// src/lib/constants.ts
import type { Category, CurrencyCode } from '@/types'

export const DEFAULT_CURRENCY: CurrencyCode = 'KRW'
export const DEFAULT_MONTH_START_DAY = 1

export const CATEGORIES: Array<{
  id: Category
  labelEn: string
  labelKo: string
  emoji: string
}> = [
  { id: 'food',          labelEn: 'Food',          labelKo: '식비',  emoji: '🍔' },
  { id: 'transport',     labelEn: 'Transport',     labelKo: '교통',  emoji: '🚌' },
  { id: 'shopping',      labelEn: 'Shopping',      labelKo: '쇼핑',  emoji: '🛍️' },
  { id: 'entertainment', labelEn: 'Entertainment', labelKo: '여가',  emoji: '🎮' },
  { id: 'health',        labelEn: 'Health',        labelKo: '의료',  emoji: '💊' },
  { id: 'education',     labelEn: 'Education',     labelKo: '교육',  emoji: '📚' },
  { id: 'housing',       labelEn: 'Housing',       labelKo: '주거',  emoji: '🏠' },
  { id: 'communication', labelEn: 'Communication', labelKo: '통신',  emoji: '📱' },
  { id: 'other',         labelEn: 'Other',         labelKo: '기타',  emoji: '💡' },
]
