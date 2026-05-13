'use client'

// Bandeau scrollant en boucle des derniers wins. Signature visuelle des
// sites casino TCG (Hellcase, CSGOEmpire, Roobet) — instantanément
// "ça vit, des gens gagnent maintenant".
//
// Pure CSS animation (pas de JS interval) → 0 cost runtime, paused au hover.
// Images Pokémon réelles via TCGdex. Phase 2 = subscribe Supabase realtime.

import Image from 'next/image'
import { useMemo } from 'react'
import { useTCGdexCard, tcgdexImageUrl } from '@/hooks/useTCGdexCard'
import { LIVE_DROPS, ENERGY_COLOR, type LiveDrop } from '@/data/liveDrops'

interface Props {
  /** Hauteur de la bande, en px. */
  height?: number
  /** Variante avec label "LIVE WINS" sticky à gauche. */
  showLabel?: boolean
}

export function LiveWinsTicker({ height = 56, showLabel = true }: Props) {
  // Duplique le tableau pour permettre une boucle CSS sans saut visible.
  const doubled = useMemo(() => [...LIVE_DROPS, ...LIVE_DROPS], [])

  return (
    <div
      className="relative w-full overflow-hidden border-y"
      style={{
        height,
        background: 'rgba(5,7,16,0.72)',
        borderColor: 'rgba(0,255,140,0.18)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      role="region"
      aria-label="Derniers gains live"
    >
      {showLabel && (
        <div
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-2 pl-4 pr-6"
          style={{
            background: 'linear-gradient(90deg, #0A0E14 70%, transparent)',
          }}
        >
          <span
            className="w-2 h-2 rounded-full pulse-live flex-shrink-0"
            style={{ background: '#00FF88', boxShadow: '0 0 10px #00FF88' }}
          />
          <span
            className="text-[10px] font-extrabold uppercase tracking-[2px] whitespace-nowrap"
            style={{ color: '#00FF88', fontFamily: 'var(--font-display)' }}
          >
            Live wins
          </span>
        </div>
      )}

      <div
        className="flex items-center gap-7 h-full animate-ticker"
        style={{ paddingLeft: showLabel ? 140 : 24 }}
      >
        {doubled.map((w, i) => (
          <WinChip key={i} win={w} />
        ))}
      </div>

      {/* Vignette droite — fade-out du contenu sous le bord */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(-90deg, #0A0E14 30%, transparent)',
        }}
      />
    </div>
  )
}

function WinChip({ win }: { win: LiveDrop }) {
  const color = ENERGY_COLOR[win.energy]
  const { data: tcgCard } = useTCGdexCard(win.cardId)
  const imageUrl = tcgdexImageUrl(tcgCard, 'low')
  const initial = win.user.charAt(0).toUpperCase()

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      {/* Mini card art — image Pokémon réelle */}
      <div
        className="relative w-8 h-11 rounded-[3px] overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${color}40, ${color}15)`,
          border: `1px solid ${color}66`,
          boxShadow: `0 1px 4px ${color}30`,
        }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={win.cardName}
            width={32}
            height={44}
            className="object-cover w-full h-full"
            unoptimized
          />
        ) : (
          <span
            className="text-[10px] font-bold text-white"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
          >
            {initial}
          </span>
        )}
      </div>
      <div className="flex flex-col leading-none gap-1">
        <span className="text-[11.5px] font-medium whitespace-nowrap">
          <span style={{ color: '#9CA1B0' }}>{win.user}</span>
          <span style={{ color: '#5C6373' }}> · </span>
          <span style={{ color: '#E5E7EB' }}>{win.cardName}</span>
          <span
            className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px] rounded-[3px]"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}55`,
            }}
          >
            {win.grade}
          </span>
        </span>
        <span
          className="text-[12px] font-extrabold tabular-nums whitespace-nowrap"
          style={{ color: '#00FF88', fontFamily: 'var(--font-mono)' }}
        >
          +${win.value.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  )
}
