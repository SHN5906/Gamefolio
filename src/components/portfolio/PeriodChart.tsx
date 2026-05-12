'use client'

import {
  AreaChart, Area, Tooltip,
  ResponsiveContainer, XAxis, YAxis,
} from 'recharts'
import { formatEur } from '@/utils/formatCurrency'

interface ChartPoint { i: number; value: number }

interface PeriodChartProps {
  data: ChartPoint[]
  isUp: boolean
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
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
      }}
    >
      {formatEur(payload[0].value)}
    </div>
  )
}

export function PeriodChart({ data, isUp }: PeriodChartProps) {
  const color = isUp ? '#10D9A0' : '#FF4D5E'
  const gradId = `chart-grad-${isUp ? 'up' : 'down'}`

  // Pad le domaine Y pour que la courbe ne touche jamais les bords
  const values = data.map(d => d.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const padding = (max - min) * 0.15 || 1
  const yDomain: [number, number] = [min - padding, max + padding]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
            <stop offset="60%"  stopColor={color} stopOpacity={0.08} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <XAxis dataKey="i" hide />
        <YAxis domain={yDomain} hide />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeWidth: 1, strokeDasharray: '3 3' }}
        />

        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 2, stroke: 'rgba(0,0,0,0.6)' }}
          isAnimationActive={true}
          animationDuration={900}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
