'use client'

import Image from 'next/image'
import { Plus } from 'lucide-react'
import type { TCGCard } from '@/hooks/useCardSearch'
import { getSetIdFromCard } from '@/hooks/useCardSearch'

interface CardSearchResultProps {
  card:    TCGCard
  onAdd:   (card: TCGCard) => void
}

export function CardSearchResult({ card, onAdd }: CardSearchResultProps) {
  const imageUrl = card.image ? `${card.image}/high.webp` : null
  const setId    = getSetIdFromCard(card)

  return (
    <button
      onClick={() => onAdd(card)}
      className="group relative flex flex-col rounded-[var(--radius-md)] border overflow-hidden transition-all duration-200"
      style={{
        borderColor: 'var(--color-border)',
        background:  'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Image de la carte */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '2.5 / 3.5', background: 'linear-gradient(140deg, #1e1b4b, #312e81)' }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={card.name}
            fill
            className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            unoptimized  // TCGdex CDN — pas besoin d'optimisation Next.js
          />
        ) : (
          /* Fallback si pas d'image */
          <div className="flex items-center justify-center h-full">
            <span
              className="text-[28px] font-bold text-white/20"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {card.name[0]}
            </span>
          </div>
        )}

        {/* Overlay hover avec bouton + */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.55)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-brand)' }}
          >
            <Plus size={18} color="white" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="px-2 py-2 flex flex-col gap-0.5">
        <p
          className="text-[12px] font-semibold leading-tight truncate text-left"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {card.name}
        </p>
        <p
          className="text-[10px] uppercase tracking-wide truncate text-left"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {setId}
        </p>
      </div>
    </button>
  )
}
