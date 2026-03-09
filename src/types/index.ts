// src/types/index.ts
export type CurrencyCode = 'KRW' | 'USD' | 'JPY'

export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'housing'
  | 'communication'
  | 'other'

export interface FixedExpense {
  id: string
  name: string
  amount: number
  category: Category
}

export interface BudgetConfig {
  id: string
  income: number
  fixedExpenses: FixedExpense[]
  savingsGoal: number
  monthStartDay: number // 1-31
  currency: CurrencyCode
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  amount: number
  category: Category
  memo?: string
  date: Date
  createdAt: Date
}

export interface Settings {
  language: 'en' | 'ko'
  theme: 'dark' | 'light'
}
