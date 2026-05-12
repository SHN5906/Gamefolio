'use client'

import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import type { EnergyType } from '@/constants/theme'
import { energyColors } from '@/constants/theme'

interface CardArtProps {
  energy: EnergyType
  number?: string
  size?: 'sm' | 'md' | 'lg'
  imageUrl?: string | null
  name?: string
  className?: string
}

const SIZE = {
  sm: 'w-[26px] h-[36px]',
  md: 'w-[36px] h-[50px]',
  lg: 'w-[44px] h-[62px]',
}

export function CardArt({ energy, number, size = 'md', imageUrl, name, className }: CardArtProps) {
  const { from, via, to } = energyColors[energy]
  const [failed, setFailed] = useState(false)

  const showImage = imageUrl && !failed

  return (
    <div
      className={twMerge(
        'relative rounded-[5px] overflow-hidden flex-shrink-0',
        SIZE[size],
        className
      )}
      style={{
        background: `linear-gradient(155deg, ${from}, ${via} 45%, ${to})`,
      }}
    >
      {/* Vraie image de carte */}
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={name ?? energy}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          {/* Shimmer holographique fallback */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0) 70%)',
            }}
          />
          {/* Numéro de carte */}
          {number && (
            <span
              className="absolute bottom-[3px] right-[3px] leading-none z-10"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 6,
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              {number}
            </span>
          )}
        </>
      )}

      {/* Bordure inset (toujours visible) */}
      <div
        className="absolute inset-0 rounded-[5px] pointer-events-none z-10"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}
      />
    </div>
  )
}
