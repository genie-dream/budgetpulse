// src/stores/transactionStore.ts
import { create } from 'zustand'
import type { Transaction } from '@/types'

interface TransactionStore {
  transactions: Transaction[]
  isLoading: boolean
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  removeTransaction: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useTransactionStore = create<TransactionStore>()((set) => ({
  transactions: [],
  isLoading: false,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) =>
    set((state) => ({ transactions: [transaction, ...state.transactions] })),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
