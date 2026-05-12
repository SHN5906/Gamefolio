'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'
import type { MockCard } from '@/lib/mock'
import { energyColors } from '@/constants/theme'

interface CollectionCardProps {
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

export function CollectionCard({ card, onClick }: CollectionCardProps) {
  const ec     = energyColors[card.energy] ?? energyColors.colorless
  const isUp   = card.changePct >= 0
  const pnl    = card.value - card.purchasePrice
  const pnlPct = card.changePct

  // Si l'image rate (404, CORS, etc.), on retombe sur le gradient
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = card.imageUrl && !imageFailed

  return (
    <Link
      href={`/card/${encodeURIComponent(card.id)}`}
      onClick={onClick}
      className="group flex flex-col rounded-[var(--radius-md)] border overflow-hidden card-lift text-left"
      style={{
        borderColor:    'var(--color-border)',
        background:     'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Image / gradient placeholder */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: '2.5 / 3.5',
          background: showImage
            ? '#0B0F1A'
            : `linear-gradient(140deg, ${ec.from}, ${ec.via}, ${ec.to})`,
        }}
      >
        {/* Image réelle TCGdex si disponible */}
        {showImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl!}
              alt={card.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ imageRendering: 'auto' }}
              onError={() => setImageFailed(true)}
            />
          </>
        ) : (
          <>
            {/* Pattern subtil sur fallback */}
            <div
              className="absolute inset-0 opacity-25 mix-blend-overlay"
              style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 6px)',
              }}
            />
            <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.18), transparent)' }} />
            <div className="absolute inset-0 flex items-end p-2">
              <span
                className="text-[10px] font-bold uppercase tracking-widest text-white/40"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {card.number}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-1/3" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.4), transparent)' }} />
          </>
        )}

        {/* Shimmer holographique au hover (toujours présent) */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)' }}
        />

        {/* Badge gradé */}
        {card.grade && (
          <div
            className="absolute top-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold backdrop-blur-md"
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#FCD34D',
              border: '1px solid rgba(252,211,77,0.4)',
              zIndex: 1,
            }}
          >
            <Award size={8} />
            {card.grade}
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">
        {/* Nom + condition */}
        <div className="flex items-start justify-between gap-1">
          <p
            className="text-[12px] font-semibold leading-tight truncate flex-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            {card.name}
          </p>
          <span
            className="text-[9px] font-bold px-1 py-0.5 rounded flex-shrink-0"
            style={{
              background: `${CONDITION_COLORS[card.condition]}20`,
              color: CONDITION_COLORS[card.condition],
            }}
          >
            {card.condition}
          </span>
        </div>

        {/* Set */}
        <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
          {card.set}
        </p>

        {/* Valeur + P&L */}
        <div className="flex items-center justify-between mt-0.5">
          <span
            className="text-[13px] font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            {card.value > 0 ? `${card.value.toFixed(2)} €` : '—'}
          </span>
          {/* P&L réel uniquement — on masque si 0 (pas d'historique de prix) */}
          {pnl !== 0 && (
            <span
              className="flex items-center gap-0.5 text-[10px] font-semibold"
              style={{ color: pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {pnl >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {pnl >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
