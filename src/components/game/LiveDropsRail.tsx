'use client'

// Rail vertical persistant des derniers drops — pattern Hellcase.
// Visible à gauche de toutes les pages /game/*. Defile lentement avec
// nouveaux drops qui apparaissent en haut. Hidden sur mobile (<lg).
//
// Images Pokémon réelles via TCGdex (hook useTCGdexCard). Phase 2 =
// subscribe Supabase realtime sur `pack_openings` filtré par valeur > $50.

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTCGdexCard, tcgdexImageUrl } from '@/hooks/useTCGdexCard'
import {
  LIVE_DROPS,
  ENERGY_COLOR,
  GRADE_COLOR,
  type LiveDrop,
} from '@/data/liveDrops'

export function LiveDropsRail() {
  const [feed, setFeed] = useState<LiveDrop[]>(() => LIVE_DROPS.slice(0, 14))

  useEffect(() => {
    // Toutes les 4-6s, push un nouveau drop en haut, retire le dernier
    const interval = setInterval(
      () => {
        setFeed(prev => {
          const next = LIVE_DROPS[Math.floor(Math.random() * LIVE_DROPS.length)]
          return [next, ...prev].slice(0, 14)
        })
      },
      4500 + Math.random() * 1500,
    )
    return () => clearInterval(interval)
  }, [])

  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0 border-r overflow-hidden sticky top-0 self-start"
      style={{
        width: 88,
        height: '100vh',
        background: 'rgba(5,7,16,0.65)',
        borderColor: 'var(--color-border)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
      aria-label="Derniers drops live"
    >
      {/* Header crown — pattern Hellcase qui marque le top drop */}
      <div
        className="flex items-center justify-center h-10 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFD740"
          strokeWidth="2"
        >
          <path d="M2 18h20l-2-13-5 5-5-7-5 7-5-5L2 18z" />
        </svg>
      </div>

      {/* Indicateur live (~ pulse signal) */}
      <div
        className="flex items-center justify-center gap-1.5 h-7 flex-shrink-0 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full pulse-live"
          style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88' }}
        />
        <span
          className="text-[8.5px] font-extrabold uppercase tracking-[1.5px]"
          style={{ color: '#00FF88' }}
        >
          Live
        </span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {feed.map((drop, i) => (
          <DropChip
            key={`${drop.user}-${drop.cardId}-${i}`}
            drop={drop}
            fresh={i === 0}
          />
        ))}
      </div>
    </aside>
  )
}

function DropChip({ drop, fresh }: { drop: LiveDrop; fresh: boolean }) {
  const energyColor = ENERGY_COLOR[drop.energy]
  const gradeColor = GRADE_COLOR[drop.grade]
  const { data: tcgCard } = useTCGdexCard(drop.cardId)
  const imageUrl = tcgdexImageUrl(tcgCard, 'low')

  // Indicateur de "rareté" du drop : badge condition style Hellcase
  // Mappé sur le grade PSA : Raw → WW, PSA 5 → BS, PSA 8 → FT, PSA 9 → MW, PSA 10 → FN
  const conditionLabel = {
    Raw: 'WW',
    'PSA 5': 'BS',
    'PSA 8': 'FT',
    'PSA 9': 'MW',
    'PSA 10': 'FN',
  }[drop.grade]

  return (
    <div
      className="relative flex flex-col items-center justify-center px-1.5 py-2 border-b transition-all"
      style={{
        borderColor: 'rgba(255,255,255,0.04)',
        background: fresh
          ? `linear-gradient(180deg, ${gradeColor}1A, transparent 70%)`
          : 'transparent',
        animation: fresh ? 'fadeInUp 0.5s ease-out' : undefined,
      }}
      title={`${drop.user} — ${drop.cardName} (${drop.grade}) — $${drop.value}`}
    >
      {/* Hot indicator top-right pour les gros drops */}
      {drop.isHot && (
        <span
          className="absolute top-1 right-1 z-10 text-[8px] font-extrabold uppercase px-1 rounded-[2px]"
          style={{
            background: gradeColor,
            color: drop.grade === 'PSA 10' ? 'white' : '#1A0F00',
            lineHeight: 1.2,
            letterSpacing: '0.5px',
          }}
        >
          {drop.grade.replace('PSA ', '')}
        </span>
      )}

      {/* Condition label top-left */}
      <span
        className="absolute top-1 left-1 z-10 text-[7.5px] font-extrabold tracking-[1px]"
        style={{ color: gradeColor }}
      >
        {conditionLabel}
      </span>

      {/* Card art réel — image TCGdex avec halo énergie */}
      <div
        className="relative w-12 h-[68px] rounded-[3px] my-1.5 overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(155deg, ${energyColor}50, ${energyColor}20 60%, transparent)`,
          border: `1px solid ${energyColor}66`,
          boxShadow: `0 2px 8px ${energyColor}40`,
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={drop.cardName}
            width={48}
            height={68}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span
            className="text-[8px] font-bold text-center px-0.5 leading-tight"
            style={{
              color: 'rgba(255,255,255,0.95)',
              textShadow: '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {drop.cardName.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
      </div>

      {/* User + value */}
      <span
        className="text-[8px] font-bold leading-none truncate w-full text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {drop.user.slice(0, 9)}
      </span>
      <span
        className="text-[9px] font-extrabold tabular-nums leading-none mt-0.5"
        style={{
          fontFamily: 'var(--font-mono)',
          color: '#00FF88',
        }}
      >
        ${drop.value > 999 ? `${(drop.value / 1000).toFixed(1)}k` : drop.value}
      </span>
    </div>
  )
}
