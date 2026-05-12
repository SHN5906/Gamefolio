'use client'

interface MiniSparklineProps {
  data: number[]
  isUp: boolean
  width?: number
  height?: number
}

export function MiniSparkline({ data, isUp, width = 60, height = 28 }: MiniSparklineProps) {
  if (!data.length) return null
  const color = isUp ? '#10B981' : '#EF4444'

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const polyline = pts.join(' ')

  // fill path
  const first = pts[0]
  const last  = pts[pts.length - 1]
  const fill  = `M${first} L${polyline.split(' ').slice(1).join(' L')} L${last.split(',')[0]},${height} L${first.split(',')[0]},${height} Z`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <defs>
        <linearGradient id={`spark-${isUp ? 'u' : 'd'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0}   />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#spark-${isUp ? 'u' : 'd'})`} />
      <polyline points={polyline} stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}
