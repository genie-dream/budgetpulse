// src/stores/transactionStore.ts
import { create } from 'zustand'
import type { Transaction, Category } from '@/types'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  lastUsedCategory: Category
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  setLoading: (loading: boolean) => void
  setLastUsedCategory: (category: Category) => void
}

export const useTransactionStore = create<TransactionStore>()((set) => ({
  transactions: [],
  isLoading: false,
  lastUsedCategory: 'food',
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setLastUsedCategory: (lastUsedCategory) => set({ lastUsedCategory }),
}))
