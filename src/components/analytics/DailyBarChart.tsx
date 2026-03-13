'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { TooltipContentProps } from 'recharts'
import type { CurrencyCode } from '../../types'
import type { DailyTotal } from '../../lib/analyticsHelpers'
import { formatCurrency } from '../../lib/budget'

function makeBarTooltip(currency: CurrencyCode) {
  // Use default generics (ValueType, NameType) to satisfy ContentType<ValueType, NameType>
  return function CustomBarTooltip(props: TooltipContentProps) {
    const { active, payload } = props
    if (!active || !payload || payload.length === 0) return null
    const entry = payload[0]
    if (!entry) return null
    const day = (entry.payload as DailyTotal | undefined)?.day ?? ''
    return (
      <div className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-100">
        <p>Day {day}: {formatCurrency(Number(entry.value ?? 0), currency)}</p>
      </div>
    )
  }
}

interface DailyBarChartProps {
  data: DailyTotal[]
  currency: CurrencyCode
  className?: string
}

export function DailyBarChart({ data, currency, className }: DailyBarChartProps) {
  const CustomBarTooltip = makeBarTooltip(currency)

  if (data.length === 0) {
    return (
      <p data-testid="bar-empty">No data</p>
    )
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip content={CustomBarTooltip} />
          <Bar dataKey="amount" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
