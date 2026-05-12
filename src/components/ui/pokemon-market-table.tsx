'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { TrendingUp, TrendingDown, Flame, Zap } from 'lucide-react'
import { energyColors, type EnergyType } from '@/constants/theme'

// next.config.ts doit autoriser images.pokemontcg.io (déjà dans le domaine par défaut)
// Fallback automatique si l'image 404

// ── Types ─────────────────────────────────────────────────────────
export interface PokemonMarketCard {
  id:                 string
  name:               string
  set:                string
  number:             string
  energy:             EnergyType
  rarity:             string
  return7d:           number      // % variation 7j
  return30d:          number      // % variation 30j
  psa10Pop:           number | null // population PSA 10
  volume24h:          number      // échanges Cardmarket 24h
  chartData:          number[]    // 10 points de prix
  price:              number      // prix actuel €
  dailyChange:        number      // variation absolue €
  dailyChangePercent: number      // variation % 24h
  imageUrl?:          string      // URL pokemontcg.io image
}

// ── Données mock TCG réalistes ────────────────────────────────────
// Images : pokemontcg.io CDN (format : images.pokemontcg.io/{setId}/{number}_hires.png)
export const TCG_MARKET_DATA: PokemonMarketCard[] = [
  {
    id: '1', name: 'Charizard ex SIR', set: '151', number: '182/165',
    energy: 'fire', rarity: 'Special Illustration',
    return7d: 12.4, return30d: 28.5,
    psa10Pop: 1247, volume24h: 89,
    chartData: [120, 124, 122, 128, 131, 135, 138, 142, 148, 152],
    price: 152.00, dailyChange: 4.50, dailyChangePercent: 3.05,
    imageUrl: 'https://images.pokemontcg.io/sv3pt5/182_hires.png',
  },
  {
    id: '2', name: 'Umbreon VMAX Alt Art', set: 'Évo. Célestes', number: '215/203',
    energy: 'dark', rarity: 'Alt Art',
    return7d: 5.8, return30d: 14.2,
    psa10Pop: 892, volume24h: 34,
    chartData: [280, 285, 290, 288, 295, 300, 305, 308, 310, 313],
    price: 313.00, dailyChange: 3.00, dailyChangePercent: 0.97,
    imageUrl: 'https://images.pokemontcg.io/swsh7/215_hires.png',
  },
  {
    id: '3', name: 'Miraidon ex SIR', set: 'Écarlate & Violet', number: '245/198',
    energy: 'lightning', rarity: 'Special Illustration',
    return7d: 22.1, return30d: 47.3,
    psa10Pop: 2134, volume24h: 156,
    chartData: [38, 40, 42, 45, 48, 51, 54, 57, 60, 64],
    price: 64.00, dailyChange: 4.00, dailyChangePercent: 6.67,
    imageUrl: 'https://images.pokemontcg.io/sv1/245_hires.png',
  },
  {
    id: '4', name: 'Lugia VSTAR Alt Art', set: 'Tempête Argentée', number: '139/195',
    energy: 'colorless', rarity: 'Alt Art',
    return7d: 3.2, return30d: 8.7,
    psa10Pop: 1580, volume24h: 62,
    chartData: [200, 205, 210, 208, 212, 215, 214, 216, 218, 220],
    price: 220.00, dailyChange: 2.00, dailyChangePercent: 0.92,
    imageUrl: 'https://images.pokemontcg.io/swsh12/139_hires.png',
  },
  {
    id: '5', name: 'Giratine VSTAR Alt Art', set: 'Perte d\'Origine', number: '186/196',
    energy: 'psychic', rarity: 'Alt Art',
    return7d: -4.1, return30d: -8.3,
    psa10Pop: 743, volume24h: 28,
    chartData: [95, 93, 91, 90, 88, 87, 85, 84, 82, 80],
    price: 80.00, dailyChange: -3.50, dailyChangePercent: -4.20,
    imageUrl: 'https://images.pokemontcg.io/swsh11/186_hires.png',
  },
  {
    id: '6', name: 'Pikachu VMAX Crown Zenith', set: 'Crown Zenith', number: 'GG29/GG70',
    energy: 'lightning', rarity: 'Hyper Rare',
    return7d: 8.9, return30d: 19.4,
    psa10Pop: 3201, volume24h: 210,
    chartData: [55, 57, 58, 60, 62, 63, 65, 67, 68, 71],
    price: 71.00, dailyChange: 3.00, dailyChangePercent: 4.41,
    imageUrl: 'https://images.pokemontcg.io/swsh12pt5/GG29_hires.png',
  },
  {
    id: '7', name: 'Koraidon ex SIR', set: 'Écarlate & Violet', number: '254/198',
    energy: 'fighting', rarity: 'Special Illustration',
    return7d: 31.5, return30d: 62.8,
    psa10Pop: 891, volume24h: 94,
    chartData: [28, 30, 31, 33, 36, 38, 40, 43, 46, 49],
    price: 49.00, dailyChange: 3.50, dailyChangePercent: 7.69,
    imageUrl: 'https://images.pokemontcg.io/sv1/254_hires.png',
  },
  {
    id: '8', name: 'Mewtwo VSTAR Gold', set: 'Astres Radieux', number: '214/189',
    energy: 'psychic', rarity: 'Hyper Rare',
    return7d: -2.3, return30d: 4.1,
    psa10Pop: 1102, volume24h: 41,
    chartData: [62, 63, 62, 61, 62, 63, 62, 61, 60, 61],
    price: 61.00, dailyChange: -1.00, dailyChangePercent: -1.62,
    imageUrl: 'https://images.pokemontcg.io/swsh10/214_hires.png',
  },
]

// ── Helpers ───────────────────────────────────────────────────────
function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function fmtPct(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

// ── Mini card image (avec fallback gradient) ──────────────────────
function EnergyMini({ energy, imageUrl, name }: { energy: EnergyType; imageUrl?: string; name?: string }) {
  const ec = energyColors[energy]
  const [failed, setFailed] = useState(false)
  const showImage = imageUrl && !failed

  return (
    <div
      className="w-[44px] h-[62px] rounded-[6px] flex-shrink-0 flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(140deg, ${ec.from}, ${ec.via}, ${ec.to})` }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={name ?? energy}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ imageRendering: 'auto' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <>
          {/* Shimmer fallback */}
          <div
            className="absolute inset-0 opacity-30"
            style={{ background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)' }}
          />
          <span
            className="text-[9px] font-bold text-white/50 uppercase relative z-10"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {energy[0].toUpperCase()}
          </span>
        </>
      )}
      {/* Bordure inset */}
      <div className="absolute inset-0 rounded-[5px] z-10 pointer-events-none" style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.1)' }} />
    </div>
  )
}

// ── Badge rareté ──────────────────────────────────────────────────
const RARITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  'Special Illustration': { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)'  },
  'Alt Art':              { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  'Hyper Rare':           { color: '#F472B6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
  'Secret Rare':          { color: '#34D399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  'default':              { color: 'var(--color-text-muted)', bg: 'var(--color-bg-glass-hi)', border: 'var(--color-border)' },
}

function RarityBadge({ rarity }: { rarity: string }) {
  const s = RARITY_STYLES[rarity] ?? RARITY_STYLES['default']
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {rarity}
    </span>
  )
}

// ── Badge % (YTD style) ───────────────────────────────────────────
function PctBadge({ value, small = false }: { value: number; small?: boolean }) {
  const isUp = value >= 0
  return (
    <span
      className={`px-1.5 py-0.5 rounded border font-semibold ${small ? 'text-[9px]' : 'text-[11px]'}`}
      style={{
        color:       isUp ? 'var(--color-positive)' : 'var(--color-negative)',
        background:  isUp ? 'rgba(16,185,129,0.1)'   : 'rgba(239,68,68,0.1)',
        borderColor: isUp ? 'rgba(16,185,129,0.25)'  : 'rgba(239,68,68,0.25)',
        fontFamily:  'var(--font-mono)',
      }}
    >
      {fmtPct(value)}
    </span>
  )
}

// ── Sparkline ─────────────────────────────────────────────────────
function Sparkline({ data, isUp }: { data: number[]; isUp: boolean }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 64
    const y = 18 - ((v - min) / range) * 14
    return `${x},${y}`
  }).join(' ')

  const color = isUp ? '#10B981' : '#EF4444'

  return (
    <div className="w-[68px] h-5">
      <svg width="68" height="20" viewBox="0 0 68 20" className="overflow-visible">
        <defs>
          <linearGradient id={`sg-${isUp}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────
interface PokemonMarketTableProps {
  cards?:       PokemonMarketCard[]
  title?:       string
  className?:   string
  maxRows?:     number
}

// ── Composant principal ───────────────────────────────────────────
export function PokemonMarketTable({
  cards           = TCG_MARKET_DATA,
  title           = 'Marché TCG',
  className       = '',
  maxRows         = 8,
}: PokemonMarketTableProps) {
  const [selected, setSelected]   = useState<string | null>(cards[0]?.id ?? null)
  const [liveCards, setLiveCards] = useState(cards.slice(0, maxRows))
  const shouldReduceMotion        = useReducedMotion()

  // Simulation live — fluctuations toutes les 4 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCards(prev => prev.map(card => {
        const last      = card.chartData[card.chartData.length - 1]
        const variation = (Math.random() - 0.48) * (last * 0.012)
        const newPrice  = Math.max(1, last + variation)
        const newChart  = [...card.chartData.slice(1), parseFloat(newPrice.toFixed(2))]
        const dailyChange    = newPrice - last
        const dailyChangePct = (dailyChange / last) * 100
        return {
          ...card,
          chartData:          newChart,
          price:              parseFloat(newPrice.toFixed(2)),
          dailyChange:        parseFloat(dailyChange.toFixed(2)),
          dailyChangePercent: parseFloat(dailyChangePct.toFixed(2)),
        }
      }))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Tri : cartes qui explosent en tête
  const sorted = [...liveCards].sort((a, b) => b.dailyChangePercent - a.dailyChangePercent)

  // Colonnes
  const COLS = '200px 72px 72px 1fr 72px 68px 90px 108px'

  return (
    <div
      className={`w-full rounded-[var(--radius-md)] overflow-hidden border ${className}`}
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg-glass)',
        backdropFilter: 'blur(12px)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >

      {/* Header tableau */}
      <div
        className="grid items-center px-4 py-3 border-b"
        style={{
          gridTemplateColumns: COLS,
          columnGap: 8,
          background:   'rgba(255,255,255,0.02)',
          borderColor:  'var(--color-border)',
        }}
      >
        {[
          { label: title,       align: 'left'  },
          { label: '7j',        align: 'left'  },
          { label: '30j',       align: 'left'  },
          { label: 'Rareté',   align: 'left'  },
          { label: 'Éch. 24h', align: 'left'  },
          { label: 'Cours 7j', align: 'left'  },
          { label: 'Prix',      align: 'right' },
          { label: 'Variation 24h', align: 'right' },
        ].map(({ label, align }) => (
          <span
            key={label}
            className="text-[9px] font-semibold uppercase tracking-[0.9px]"
            style={{ color: 'var(--color-text-muted)', textAlign: align as 'left' | 'right' }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Rows — animation directe sans propagation variant (Framer Motion v12) */}
      <div>
        {sorted.map((card, idx) => {
          const isUp       = card.dailyChangePercent >= 0
          const isSelected = selected === card.id
          const isHot      = card.dailyChangePercent > 5
          const isCold     = card.dailyChangePercent < -3

          return (
            <motion.div
              key={card.id}
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.35, delay: shouldReduceMotion ? 0 : idx * 0.055, ease: 'easeOut' }}
              suppressHydrationWarning
              onClick={() => setSelected(isSelected ? null : card.id)}
              className="grid items-center px-4 py-2.5 cursor-pointer transition-colors duration-150 border-b last:border-b-0"
              style={{
                gridTemplateColumns: COLS,
                columnGap:    8,
                borderColor:  'var(--color-border)',
                background:   isSelected
                  ? 'rgba(26,111,255,0.06)'
                  : 'var(--color-bg-glass)',
              }}
            >
              {/* ── Carte ── */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <EnergyMini energy={card.energy} imageUrl={card.imageUrl} name={card.name} />
                  {/* Badge rank */}
                  <div
                    className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold"
                    style={{
                      background: idx === 0 ? '#FFCC00' : idx === 1 ? '#94A3B8' : idx === 2 ? '#F97316' : 'var(--color-bg-glass-hi)',
                      color: idx < 3 ? '#000' : 'var(--color-text-muted)',
                    }}
                  >
                    {idx + 1}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="text-[12px] font-semibold truncate"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                    >
                      {card.name}
                    </p>
                    {isHot && <Flame size={10} color="#FF6B35" />}
                    {isCold && <span className="text-[10px]">🧊</span>}
                  </div>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {card.set} · {card.number}
                  </p>
                </div>
              </div>

              {/* ── 7j ── */}
              <div>
                <PctBadge value={card.return7d} />
              </div>

              {/* ── 30j ── */}
              <div>
                <PctBadge value={card.return30d} />
              </div>

              {/* ── Rareté ── */}
              <div className="min-w-0">
                <RarityBadge rarity={card.rarity} />
              </div>

              {/* ── Échanges 24h ── */}
              <div>
                <p className="text-[12px] font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
                  {card.volume24h}
                </p>
                <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>trades</p>
              </div>

              {/* ── Sparkline ── */}
              <div className="flex items-center">
                <Sparkline data={card.chartData} isUp={isUp} />
              </div>

              {/* ── Prix ── */}
              <div className="text-right">
                <motion.p
                  key={card.price}
                  initial={false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                  className="text-[13px] font-bold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
                  suppressHydrationWarning
                >
                  {fmtEur(card.price)}
                </motion.p>
                {card.psa10Pop && (
                  <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>
                    PSA10: {card.psa10Pop.toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              {/* ── Variation 24h ── */}
              <div className="flex flex-col items-end gap-0.5">
                <span
                  className="text-[12px] font-bold flex items-center gap-1"
                  style={{ fontFamily: 'var(--font-mono)', color: isUp ? 'var(--color-positive)' : 'var(--color-negative)' }}
                >
                  {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {card.dailyChange >= 0 ? '+' : ''}{card.dailyChange.toFixed(2)} €
                </span>
                <PctBadge value={card.dailyChangePercent} small />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
