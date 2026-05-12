'use client'

import { useMemo } from 'react'
import { useCollectionData } from '@/hooks/useCollectionData'
import { formatEur } from '@/utils/formatCurrency'

// Palette couleurs pour les segments
const PALETTE = ['#2A7DFF', '#00D4FF', '#10D9A0', '#F5A623', '#EC4899', '#8B5CF6', '#FF6B47', '#94A3B8']

interface Segment {
  name:  string
  pct:   number
  value: number
  color: string
}

function DonutSVG({ segments }: { segments: Segment[] }) {
  const cx = 56, cy = 56, r = 42, sw = 9
  const C = 2 * Math.PI * r
  const GAP = segments.length > 1 ? 3 : 0

  let offset = 0
  const drawn = segments.map((seg) => {
    const dashLen = seg.pct * C - GAP
    const dashOffset = C * (0.25 - offset)
    offset += seg.pct
    return { ...seg, dashLen, dashOffset, C }
  })

  return (
    <svg width="112" height="112" viewBox="0 0 112 112">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
      {drawn.map((s) => (
        <circle
          key={s.name}
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={s.color}
          strokeWidth={sw}
          strokeDasharray={`${Math.max(0, s.dashLen)} ${s.C - Math.max(0, s.dashLen)}`}
          strokeDashoffset={s.dashOffset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  )
}

export function AllocationDonut({ totalValue }: { totalValue: number }) {
  const { cards, sealed } = useCollectionData()

  // Calcul dynamique répartition par set
  const segments = useMemo<Segment[]>(() => {
    const map = new Map<string, number>()

    cards.forEach(c => {
      const set = c.set_name_fr ?? c.set_name_en ?? 'Autres'
      map.set(set, (map.get(set) ?? 0) + (c.current_price_eur ?? 0) * c.quantity)
    })
    sealed.forEach(s => {
      const set = s.set_name ?? 'Scellés'
      map.set(set, (map.get(set) ?? 0) + (s.current_value_eur ?? 0) * s.quantity)
    })

    const total = [...map.values()].reduce((a, b) => a + b, 0)
    if (total === 0) return []

    // Top 4 sets + "Autres"
    const sorted = [...map.entries()].sort((a, b) => b[1] - a[1])
    const top = sorted.slice(0, 4)
    const others = sorted.slice(4)
    const othersValue = others.reduce((a, [, v]) => a + v, 0)

    const result = top.map(([name, value], i) => ({
      name, value,
      pct: value / total,
      color: PALETTE[i % PALETTE.length],
    }))

    if (othersValue > 0) {
      result.push({
        name: 'Autres',
        value: othersValue,
        pct: othersValue / total,
        color: '#475569',
      })
    }
    return result
  }, [cards, sealed])

  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2">
        <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="text-[20px]" style={{ color: 'var(--color-text-muted)' }}>—</span>
        </div>
        <p className="text-[11px] text-center" style={{ color: 'var(--color-text-muted)' }}>
          Pas encore de cartes
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3.5">
      {/* Donut */}
      <div className="relative">
        <DonutSVG segments={segments} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-base font-bold leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            {formatEur(totalValue).replace(',00', '')}
          </span>
          <span className="text-[9px] uppercase tracking-[0.8px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Total
          </span>
        </div>
      </div>

      {/* Légende */}
      <div className="w-full flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.name} className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
            <span className="flex-1 text-[11px] truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {seg.name}
            </span>
            <div className="w-11 h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${seg.pct * 100}%`, background: seg.color }}
              />
            </div>
            <span
              className="text-[10px] w-7 text-right"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
