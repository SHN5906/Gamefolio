'use client'

import { AreaChart, Area } from 'recharts'

interface SparklineProps {
  data: Array<{ i: number; value: number }>
  isUp: boolean
  width?: number
  height?: number
}

export function Sparkline({ data, isUp, width = 76, height = 30 }: SparklineProps) {
  const color = isUp ? '#10B981' : '#EF4444'
  const gradId = `spark-${isUp ? 'u' : 'd'}-${Math.random().toString(36).slice(2, 6)}`

  return (
    <AreaChart width={width} height={height} data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <Area
        type="monotone"
        dataKey="value"
        stroke={color}
        strokeWidth={1.5}
        fill={`url(#${gradId})`}
        dot={false}
        isAnimationActive={false}
      />
    </AreaChart>
  )
}
