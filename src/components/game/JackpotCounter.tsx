'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trophy, Clock, Users } from 'lucide-react'

// Compteur jackpot communautaire. Mock data pour l'instant :
// - valeur initiale 8 472,50
// - +0,50 à +4 toutes les 2s (simulate gens qui déposent)
// - countdown 10 min → reset, indique l'urgence du tirage
//
// À brancher en Phase 2 sur `jackpot_rounds` Supabase realtime
// (subscribe sur le row de la round en cours, valeur = sum(deposits)).

const INITIAL_VALUE = 8472.5
const INITIAL_SECONDS = 7 * 60 + 32 // 7m32s — assez court pour suggérer FOMO

interface Props {
  /** Variante compacte pour topbar. Défaut : full hero card. */
  compact?: boolean
}

export function JackpotCounter({ compact = false }: Props) {
  const [value, setValue] = useState(INITIAL_VALUE)
  const [seconds, setSeconds] = useState(INITIAL_SECONDS)
  const [participants, setParticipants] = useState(127)

  useEffect(() => {
    // Tick du pot (montre que le jackpot vit)
    const valueTick = setInterval(() => {
      setValue(v => v + Math.random() * 3.5 + 0.5)
      // Tous les ~6 tick, +1 participant
      if (Math.random() > 0.85) setParticipants(p => p + 1)
    }, 2000)
    // Countdown
    const timer = setInterval(() => {
      setSeconds(s => (s > 0 ? s - 1 : 10 * 60))
    }, 1000)
    return () => {
      clearInterval(valueTick)
      clearInterval(timer)
    }
  }, [])

  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  const formatted = value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const isCritical = seconds < 60

  if (compact) {
    return (
      <Link
        href="/game/jackpot"
        className="flex items-center gap-2.5 px-3 h-9 rounded-[var(--radius-sm)] border transition-colors"
        style={{
          background: 'rgba(255,215,64,0.06)',
          borderColor: 'rgba(255,215,64,0.35)',
        }}
      >
        <Trophy size={13} style={{ color: '#FFD740' }} />
        <span
          className="text-[12px] font-extrabold tabular-nums animate-jackpot-flicker"
          style={{ fontFamily: 'var(--font-mono)', color: '#FFD740' }}
        >
          ${formatted}
        </span>
        <span
          className="text-[10px] font-bold tabular-nums"
          style={{ color: isCritical ? '#FF3344' : '#9CA1B0', fontFamily: 'var(--font-mono)' }}
        >
          {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </span>
      </Link>
    )
  }

  return (
    <Link
      href="/game/jackpot"
      className="relative block rounded-[var(--radius-md)] overflow-hidden border transition-transform hover:scale-[1.005]"
      style={{
        background:
          'linear-gradient(135deg, #0F0A14 0%, #1A0F1F 45%, #0F0A14 100%)',
        borderColor: '#FFD740',
        boxShadow: isCritical
          ? '0 0 36px rgba(255,51,68,0.35), inset 0 0 0 1px rgba(255,215,64,0.25)'
          : '0 0 36px rgba(255,215,64,0.22), inset 0 0 0 1px rgba(255,215,64,0.25)',
      }}
    >
      {/* Glow d'arrière-plan dorée centrée */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at center, rgba(255,215,64,0.14) 0%, transparent 65%)',
        }}
      />

      {/* Rayures dorées subtiles */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent 0, transparent 12px, #FFD740 12px, #FFD740 13px)',
        }}
      />

      <div className="relative flex items-center justify-between gap-4 p-5 sm:p-6">
        {/* GAUCHE — pot value */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFD740, #FF9500)',
              boxShadow: '0 0 16px rgba(255,215,64,0.5)',
            }}
          >
            <Trophy size={22} color="#1A0F00" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className="w-1.5 h-1.5 rounded-full pulse-live"
                style={{ background: '#FFD740', boxShadow: '0 0 6px #FFD740' }}
              />
              <p
                className="text-[10px] font-extrabold uppercase tracking-[2px]"
                style={{ color: '#FFD740' }}
              >
                Jackpot communautaire · Live
              </p>
            </div>
            <p
              className="text-[40px] sm:text-[56px] font-extrabold tabular-nums leading-none animate-jackpot-flicker"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'white',
                letterSpacing: '-0.035em',
                textShadow: '0 0 28px rgba(255,215,64,0.5)',
              }}
            >
              ${formatted}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Users size={11} style={{ color: '#9CA1B0' }} />
              <span className="text-[11px]" style={{ color: '#9CA1B0' }}>
                <span className="tabular-nums font-bold" style={{ color: '#E5E7EB' }}>
                  {participants}
                </span>{' '}
                participants
              </span>
            </div>
          </div>
        </div>

        {/* DROITE — countdown + CTA */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: isCritical ? '#FF3344' : '#FFD740' }} />
            <span
              className="text-[10px] font-extrabold uppercase tracking-[1.5px]"
              style={{ color: isCritical ? '#FF3344' : '#FFD740' }}
            >
              {isCritical ? 'Tirage imminent' : 'Tirage dans'}
            </span>
          </div>
          <span
            className="text-[28px] sm:text-[32px] font-extrabold tabular-nums leading-none"
            style={{
              fontFamily: 'var(--font-mono)',
              color: isCritical ? '#FF3344' : 'white',
              letterSpacing: '-0.02em',
            }}
          >
            {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
          <span
            className="text-[10px] font-extrabold uppercase tracking-[1.5px] px-2.5 py-1 rounded-[var(--radius-xs)] mt-1"
            style={{
              background: '#FFD740',
              color: '#1A0F00',
              boxShadow: '0 0 14px rgba(255,215,64,0.55)',
            }}
          >
            Déposer une carte →
          </span>
        </div>
      </div>
    </Link>
  )
}
