// src/lib/db.ts
import Dexie, { type Table } from 'dexie'
import type { BudgetConfig, Transaction } from '@/types'

export class BudgetPulseDB extends Dexie {
  budgetConfigs!: Table<BudgetConfig>
  transactions!: Table<Transaction>

  constructor() {
    super('BudgetPulseDB')
    this.version(1).stores({
      budgetConfigs: 'id, createdAt',
      transactions: 'id, date, category, [date+category]',
    })
  }
}

export const db = new BudgetPulseDB()
