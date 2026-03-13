'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { CurrencyCode, Category } from '../../types'
import type { CategoryTotal } from '../../lib/analyticsHelpers'
import { formatCurrency } from '../../lib/budget'

const CATEGORY_COLORS: Record<Category, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#a855f7',
  entertainment: '#ec4899',
  health: '#22c55e',
  education: '#eab308',
  housing: '#14b8a6',
  communication: '#06b6d4',
  other: '#94a3b8',
}

function makeTooltip(currency: CurrencyCode) {
  // Use default generics (ValueType, NameType) to satisfy ContentType<ValueType, NameType>
  return function CustomTooltip(props: TooltipContentProps) {
    const { active, payload } = props
    if (!active || !payload || payload.length === 0) return null
    const entry = payload[0]
    if (!entry) return null
    return (
      <div className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100">
        <p>{String(entry.name ?? '')}</p>
        <p>{formatCurrency(Number(entry.value ?? 0), currency)}</p>
      </div>
    )
  }
}

interface DonutChartProps {
  data: CategoryTotal[]
  currency: CurrencyCode
  className?: string
}

export function DonutChart({ data, currency, className }: DonutChartProps) {
  const CustomTooltip = makeTooltip(currency)

  if (data.length === 0) {
    return (
      <p
        data-testid="donut-empty"
        className="text-slate-400 text-sm text-center py-8"
      >
        No spending this period
      </p>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry) => (
              <Cell key={entry.id} fill={CATEGORY_COLORS[entry.id as Category]} />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
