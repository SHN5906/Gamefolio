'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Lock, Sparkles, Flame } from 'lucide-react'
import type { Pack, GameCard } from '@/types/game'
import { useTCGdexCard, tcgdexImageUrl } from '@/hooks/useTCGdexCard'

interface PackCardProps {
  pack: Pack
  affordable: boolean
}

const TIER_LABEL: Record<Pack['tier'], string> = {
  starter:      'Starter',
  common:       'Commune',
  intermediate: 'Standard',
  premium:      'Premium',
  ultra:        'Ultra',
}

export function PackCard({ pack, affordable }: PackCardProps) {
  const locked = !affordable
  const ribbon = pack.badge ?? (pack.isNew ? 'NEW' : pack.isFeatured ? 'TOP' : null)

  // Top 3 cartes les plus chères en éventail
  const showcase: GameCard[] = useMemo(
    () => [...pack.cardPool].sort((a, b) => b.value - a.value).slice(0, 3),
    [pack.cardPool]
  )

  return (
    <Link
      href={`/game/open/${pack.id}`}
      className="group relative block rounded-[var(--radius-lg)] overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        borderColor: 'var(--color-border-strong)',
        background: 'var(--color-bg-elevated)',
        boxShadow: locked
          ? 'var(--shadow-sm)'
          : `0 4px 24px ${pack.glowColor}, var(--shadow-md)`,
      }}
    >
      {/* Pack artwork (background) */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{
          background: `linear-gradient(155deg, ${pack.gradient.from} 0%, ${pack.gradient.via ?? pack.gradient.from} 50%, ${pack.gradient.to} 100%)`,
        }}
      >
        {/* Holo shimmer */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
          }}
        />

        {/* Showcase : 3 cartes en éventail */}
        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
          <div className="relative w-full h-full flex items-center justify-center">
            {showcase[1] && (
              <ShowcaseCard card={showcase[1]} rotate={-14} translateX={-32} translateY={6} z={1} />
            )}
            {showcase[2] && (
              <ShowcaseCard card={showcase[2]} rotate={14} translateX={32} translateY={6} z={2} />
            )}
            {showcase[0] && (
              <ShowcaseCard card={showcase[0]} rotate={0} translateX={0} translateY={-4} z={3} hero />
            )}
          </div>
        </div>

        {/* Emoji sticker en bas-droite */}
        <div
          className="absolute bottom-2 right-2 text-[28px] z-10 pointer-events-none"
          style={{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5))` }}
        >
          {pack.emoji}
        </div>

        {/* Top: tier + badge */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <span
            className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-[1.2px]"
            style={{
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              color: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            {TIER_LABEL[pack.tier]}
          </span>
          {ribbon && (
            <span
              className="px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[1.4px] flex items-center gap-1"
              style={{
                background:
                  ribbon === 'JACKPOT' || ribbon === 'MEGA'
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : ribbon === 'NICHE' || ribbon === 'COLLECTOR'
                      ? 'linear-gradient(135deg, #A855F7, #EC4899)'
                      : 'rgba(0,0,0,0.6)',
                color: ribbon === 'JACKPOT' || ribbon === 'MEGA' ? '#000' : '#fff',
                border: '1px solid rgba(255,255,255,0.18)',
                boxShadow: ribbon === 'JACKPOT' ? '0 0 12px rgba(255,215,0,0.6)' : 'none',
              }}
            >
              {ribbon === 'TOP' && <Flame size={9} />}
              {ribbon === 'NEW' && <Sparkles size={9} />}
              {ribbon}
            </span>
          )}
        </div>

        {/* Lock overlay */}
        {locked && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border"
              style={{
                background: 'rgba(0,0,0,0.65)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <Lock size={20} style={{ color: 'rgba(255,255,255,0.85)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-bold truncate"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            {pack.nameFr}
          </p>
          <p
            className="text-[10px] truncate mt-0.5"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {pack.description}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p
            className="text-[14px] font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              color: locked ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            ${pack.price.toFixed(2)}
          </p>
          <p
            className="text-[9px]"
            style={{
              color: locked ? 'var(--color-negative)' : 'var(--color-text-muted)',
            }}
          >
            {locked ? 'Solde insuf.' : pack.cardPool.length + ' cartes'}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ── ShowcaseCard ─────────────────────────────────────────────────────────

interface ShowcaseCardProps {
  card: GameCard
  rotate: number
  translateX: number
  translateY: number
  z: number
  hero?: boolean
}

function ShowcaseCard({ card, rotate, translateX, translateY, z, hero }: ShowcaseCardProps) {
  // Image et nom depuis TCGdex (source unique de vérité)
  const { data: tcgCard } = useTCGdexCard(card.id)
  const imageUrl = tcgdexImageUrl(tcgCard, 'low') ?? card.imageUrl
  const displayName = tcgCard?.name ?? card.nameFr

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${translateX}%, ${translateY}%) rotate(${rotate}deg)`,
        zIndex: z,
        width: hero ? '52%' : '46%',
        aspectRatio: '5/7',
        filter: hero
          ? 'drop-shadow(0 14px 28px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 8px 16px rgba(0,0,0,0.45))',
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayName}
          className="w-full h-full object-cover rounded-[6px]"
          style={{
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        />
      ) : (
        <div
          className="w-full h-full rounded-[6px] flex items-center justify-center text-[10px] font-semibold p-2 text-center"
          style={{
            background: 'rgba(0,0,0,0.45)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          {displayName}
        </div>
      )}
    </div>
  )
}
