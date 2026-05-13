'use client'

// Rail vertical persistant des derniers drops — pattern Hellcase.
// Visible à gauche de toutes les pages /game/*. Defile lentement avec
// nouveaux drops qui apparaissent en haut. Hidden sur mobile (<lg).
//
// Données mockées comme LiveWinsTicker. Phase 2 = subscribe Supabase
// realtime sur `pack_openings` filtré par valeur > $50.

import { useEffect, useState } from 'react'

interface Drop {
  user: string
  card: string
  grade: 'Raw' | 'PSA 5' | 'PSA 8' | 'PSA 9' | 'PSA 10'
  value: number
  energy: 'fire' | 'water' | 'psychic' | 'lightning' | 'dark' | 'dragon' | 'colorless' | 'grass' | 'fairy' | 'metal'
  /** Couleur de bord — selon grade */
  isHot?: boolean
}

const POOL: Drop[] = [
  { user: 'OakReborn',    card: 'Mewtwo Star',         grade: 'PSA 10', value: 3100, energy: 'psychic',   isHot: true },
  { user: 'Drake_Trainer',card: 'Dracaufeu Cristal',   grade: 'PSA 10', value: 4832, energy: 'fire',      isHot: true },
  { user: 'Sacha_X',      card: 'Lugia Neo',           grade: 'PSA 9',  value: 1240, energy: 'colorless' },
  { user: 'GemHunter',    card: 'Mew Star δ',          grade: 'PSA 9',  value: 590,  energy: 'psychic' },
  { user: 'L33TJ4',       card: 'Rayquaza VMAX',       grade: 'PSA 8',  value: 420,  energy: 'dragon' },
  { user: 'Eclair42',     card: 'Pikachu Star',        grade: 'PSA 10', value: 720,  energy: 'lightning', isHot: true },
  { user: 'NinjaTCG',     card: 'Umbreon Star',        grade: 'PSA 9',  value: 1450, energy: 'dark',      isHot: true },
  { user: 'BrumeArt',     card: 'Crystal Charizard',   grade: 'PSA 8',  value: 1800, energy: 'fire',      isHot: true },
  { user: 'Lulu',         card: 'Reshiram VMAX',       grade: 'PSA 10', value: 540,  energy: 'fire' },
  { user: 'Tomtom_92',    card: 'Charizard VMAX',      grade: 'PSA 9',  value: 320,  energy: 'fire' },
  { user: 'JadePlume',    card: 'Lugia Cristal',       grade: 'PSA 10', value: 2100, energy: 'colorless', isHot: true },
  { user: 'KaedeFR',      card: 'Espeon Neo',          grade: 'PSA 9',  value: 95,   energy: 'psychic' },
  { user: 'NeoFighter',   card: 'Feraligatr Neo',      grade: 'PSA 8',  value: 65,   energy: 'water' },
  { user: 'PyroSan',      card: 'Ho-Oh Neo',           grade: 'PSA 9',  value: 250,  energy: 'fire' },
]

const ENERGY_COLOR: Record<Drop['energy'], string> = {
  fire:      '#FF6B47',
  water:     '#38BDF8',
  grass:     '#22C55E',
  lightning: '#FACC15',
  psychic:   '#A855F7',
  dark:      '#64748B',
  dragon:    '#818CF8',
  colorless: '#94A3B8',
  metal:     '#94A3B8',
  fairy:     '#EC4899',
}

const GRADE_COLOR: Record<Drop['grade'], string> = {
  'Raw':    '#A0A0A0',
  'PSA 5':  '#78B4FF',
  'PSA 8':  '#A36AFF',
  'PSA 9':  '#FFB450',
  'PSA 10': '#FF5050',
}

export function LiveDropsRail() {
  const [feed, setFeed] = useState<Drop[]>(() => POOL.slice(0, 14))

  useEffect(() => {
    // Toutes les 4-6s, push un nouveau drop en haut, retire le dernier
    const interval = setInterval(() => {
      setFeed(prev => {
        const next = POOL[Math.floor(Math.random() * POOL.length)]
        return [next, ...prev].slice(0, 14)
      })
    }, 4500 + Math.random() * 1500)
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD740" strokeWidth="2">
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
          <DropChip key={`${drop.user}-${drop.card}-${i}`} drop={drop} fresh={i === 0} />
        ))}
      </div>
    </aside>
  )
}

function DropChip({ drop, fresh }: { drop: Drop; fresh: boolean }) {
  const energyColor = ENERGY_COLOR[drop.energy]
  const gradeColor = GRADE_COLOR[drop.grade]
  // Indicateur de "rareté" du drop : badge condition style Hellcase (FT/BS/MW)
  // Mappé sur le grade PSA : Raw → WW, PSA 5 → BS, PSA 8 → FT, PSA 9 → MW, PSA 10 → FN
  const conditionLabel = {
    'Raw':    'WW',
    'PSA 5':  'BS',
    'PSA 8':  'FT',
    'PSA 9':  'MW',
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
      title={`${drop.user} — ${drop.card} (${drop.grade}) — $${drop.value}`}
    >
      {/* Hot indicator top-right pour les gros drops */}
      {drop.isHot && (
        <span
          className="absolute top-1 right-1 text-[8px] font-extrabold uppercase px-1 rounded-[2px]"
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
        className="absolute top-1 left-1 text-[7.5px] font-extrabold tracking-[1px]"
        style={{ color: gradeColor }}
      >
        {conditionLabel}
      </span>

      {/* Mini "card art" — gradient énergie */}
      <div
        className="w-12 h-9 rounded-[3px] my-1.5 flex items-center justify-center"
        style={{
          background: `linear-gradient(155deg, ${energyColor}80, ${energyColor}40 60%, ${energyColor}20)`,
          border: `1px solid ${energyColor}66`,
          boxShadow: `0 2px 8px ${energyColor}30`,
        }}
      >
        <span
          className="text-[8px] font-bold text-center px-0.5 leading-tight"
          style={{
            color: 'rgba(255,255,255,0.95)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {drop.card.split(' ').slice(0, 2).join(' ')}
        </span>
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
