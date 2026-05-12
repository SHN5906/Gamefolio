'use client'

import dynamic from 'next/dynamic'
import { CardArt } from './CardArt'
import { ConditionBadge, Badge } from '@/components/ui/badge'
import { formatEur, formatPct } from '@/utils/formatCurrency'
import type { MockCard } from '@/lib/mock'
import { genChartData } from '@/lib/mock'
import { useMemo } from 'react'

const Sparkline = dynamic(
  () => import('@/components/portfolio/Sparkline').then((m) => m.Sparkline),
  { ssr: false, loading: () => <div style={{ width: 76, height: 30 }} /> }
)

interface AssetRowProps {
  card: MockCard
}

export function AssetRow({ card }: AssetRowProps) {
  const isUp = card.changePct >= 0

  // Sparkline data générée une fois par card (stable)
  const sparkData = useMemo(
    () => genChartData(22, 100, isUp ? 0.006 : -0.006, 0.018, isUp ? 110 : 90),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card.id]
  )

  return (
    <div
      className="grid items-center gap-3 px-3 py-2.5 rounded-[10px] cursor-pointer border border-transparent transition-all duration-150 hover:border-[var(--color-border)] hover:bg-[var(--color-bg-glass-hi)]"
      style={{ gridTemplateColumns: '46px 1fr 76px auto' }}
    >
      {/* Art */}
      <CardArt energy={card.energy} number={card.number} size="md" />

      {/* Info */}
      <div className="min-w-0">
        <p
          className="text-[13px] font-semibold truncate"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {card.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {card.set} · {card.language}
          </span>
          {card.grade
            ? <Badge variant="blue">{card.grade}</Badge>
            : <ConditionBadge condition={card.condition} />
          }
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline data={sparkData} isUp={isUp} />

      {/* Valeur + variation */}
      <div className="text-right">
        <p
          className="text-[13px] font-semibold"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
        >
          {formatEur(card.value)}
        </p>
        <p
          className="text-[11px] font-medium mt-0.5"
          style={{
            fontFamily: 'var(--font-mono)',
            color: isUp ? 'var(--color-positive)' : 'var(--color-negative)',
          }}
        >
          {formatPct(card.changePct)}
        </p>
      </div>
    </div>
  )
}
