'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'
import type { MockCard } from '@/lib/mock'
import { energyColors } from '@/constants/theme'

interface CollectionRowProps {
  card: MockCard
  onClick?: () => void
}

const CONDITION_COLORS: Record<string, string> = {
  NM: '#10B981',
  EX: '#3B82F6',
  GD: '#F59E0B',
  PL: '#F97316',
  PO: '#EF4444',
}

export function CollectionRow({ card, onClick }: CollectionRowProps) {
  const ec     = energyColors[card.energy] ?? energyColors.colorless
  const isUp   = card.changePct >= 0
  const pnl    = card.value - card.purchasePrice
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = card.imageUrl && !imageFailed

  return (
    <Link
      href={`/card/${encodeURIComponent(card.id)}`}
      onClick={onClick}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-[var(--radius-sm)] border transition-all duration-150 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-glass-hi)] text-left"
      style={{
        borderColor:    'var(--color-border)',
        background:     'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Mini card art - image réelle si dispo */}
      <div
        className="w-9 h-[50px] rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
        style={{
          background: showImage ? '#0B0F1A' : `linear-gradient(140deg, ${ec.from}, ${ec.to})`,
        }}
      >
        {showImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={card.imageUrl!}
            alt={card.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            {card.energy[0].toUpperCase()}
          </span>
        )}
      </div>

      {/* Nom + set */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="text-[13px] font-semibold truncate"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            {card.name}
          </p>
          {card.grade && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold flex-shrink-0" style={{ color: '#FBBF24' }}>
              <Award size={9} />
              {card.grade}
            </span>
          )}
        </div>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {card.set} · {card.number}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{
            background: `${CONDITION_COLORS[card.condition]}18`,
            color: CONDITION_COLORS[card.condition],
          }}
        >
          {card.condition}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {card.language}
        </span>
      </div>

      {/* Prix achat */}
      <div className="w-20 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          Achat
        </p>
        <p className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
          {card.purchasePrice.toFixed(2)} €
        </p>
      </div>

      {/* Valeur actuelle */}
      <div className="w-24 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          Valeur
        </p>
        <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
          {card.value > 0 ? `${card.value.toFixed(2)} €` : '—'}
        </p>
      </div>

      {/* P&L — seulement si prix d'achat connu */}
      <div className="w-24 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          P&amp;L
        </p>
        {card.purchasePrice > 0 ? (
          <p
            className="text-[13px] font-bold flex items-center justify-end gap-0.5"
            style={{
              fontFamily: 'var(--font-mono)',
              color: pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
            }}
          >
            {pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} €
          </p>
        ) : (
          <p className="text-[13px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>—</p>
        )}
      </div>
    </Link>
  )
}
