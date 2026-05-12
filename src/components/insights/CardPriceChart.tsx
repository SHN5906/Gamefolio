'use client'

import {
  AreaChart, Area, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts'
import { formatEur } from '@/utils/formatCurrency'

interface Point { i: number; value: number }

interface CardPriceChartProps {
  data: Point[]
  isUp: boolean
  height?: number
  showAxes?: boolean
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: number
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium border"
      style={{
        fontFamily: 'var(--font-mono)',
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border-strong)',
        color: 'var(--color-text-primary)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
      }}
    >
      {formatEur(payload[0].value)}
    </div>
  )
}

export function CardPriceChart({ data, isUp, height = 160, showAxes = false }: CardPriceChartProps) {
  const color  = isUp ? '#10B981' : '#EF4444'
  const gradId = `card-grad-${isUp ? 'up' : 'dn'}`

  // first value for reference line
  const baseline = data[0]?.value

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: showAxes ? 8 : 0, bottom: 0, left: showAxes ? 0 : 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>

        {showAxes && (
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
        )}

        <XAxis dataKey="i" hide={!showAxes} tick={false} axisLine={false} tickLine={false} />
        <YAxis
          domain={['auto', 'auto']}
          hide={!showAxes}
          tick={{ fontSize: 10, fill: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
          width={showAxes ? 64 : 0}
          tickFormatter={(v) => formatEur(v)}
        />

        {showAxes && baseline && (
          <ReferenceLine
            y={baseline}
            stroke="rgba(255,255,255,0.12)"
            strokeDasharray="4 4"
          />
        )}

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          isAnimationActive
          animationDuration={700}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
