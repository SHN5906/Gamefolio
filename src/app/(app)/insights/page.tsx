'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, TrendingDown, Flame, Activity, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { MOCK_CARDS, MOCK_ALLOCATION, genChartData, PERIODS, type PeriodKey } from '@/lib/mock'
import { formatEur, formatEurDiff, formatPct } from '@/utils/formatCurrency'
import { Card } from '@/components/ui/card'
import { CardArt } from '@/components/cards/CardArt'
import { MiniSparkline } from '@/components/insights/MiniSparkline'
import { AllocationCharts } from '@/components/insights/AllocationCharts'
import { useCollectionData } from '@/hooks/useCollectionData'
import type { EnergyType } from '@/constants/theme'

// Chart (client only, uses browser APIs)
const CardPriceChart = dynamic(
  () => import('@/components/insights/CardPriceChart').then(m => m.CardPriceChart),
  { ssr: false, loading: () => <div style={{ height: 220 }} /> }
)
const PeriodChart = dynamic(
  () => import('@/components/portfolio/PeriodChart').then(m => m.PeriodChart),
  { ssr: false, loading: () => <div style={{ height: 180 }} /> }
)

// ── Constantes ────────────────────────────────────────────────────
const PERIOD_LABELS: Record<PeriodKey, string> = {
  '24h': '24H', '7d': '7J', '30d': '30J', '1y': '1A', 'all': 'TOUT',
}

const GAINERS = [...MOCK_CARDS].sort((a, b) => b.changePct - a.changePct)
const LOSERS  = [...MOCK_CARDS].sort((a, b) => a.changePct - b.changePct)

// Volatilité fictive
const VOLATILITY = 4.8

// Sparkline data per card (stable, generated once at module level)
const CARD_SPARKS: Record<string, number[]> = Object.fromEntries(
  MOCK_CARDS.map(c => [
    c.id,
    genChartData(20, c.value * 0.9, c.changePct > 0 ? 0.002 : -0.002, 0.01, c.value)
      .map(p => p.value),
  ])
)

// ── Sub-composants ────────────────────────────────────────────────

function PeriodTabs({ value, onChange }: { value: PeriodKey; onChange: (k: PeriodKey) => void }) {
  return (
    <div className="flex gap-1">
      {(Object.keys(PERIODS) as PeriodKey[]).map(key => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className="px-3 py-1 rounded-[6px] transition-all duration-150 border"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.5px',
            color: value === key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            background: value === key ? 'var(--color-bg-glass-hi)' : 'transparent',
            borderColor: value === key ? 'var(--color-border-strong)' : 'transparent',
          }}
        >
          {PERIOD_LABELS[key]}
        </button>
      ))}
    </div>
  )
}

function AllocationChartsConnected() {
  const { cards } = useCollectionData()
  return <AllocationCharts cards={cards} />
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-3">
      <h2
        className="text-[13px] font-bold tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
      >
        {children}
      </h2>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{sub}</p>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────
export default function InsightsPage() {
  const [period, setPeriod]       = useState<PeriodKey>('7d')
  const [chartData, setChartData] = useState<Array<{ i: number; value: number }>>([])
  const [selectedId, setSelectedId] = useState(MOCK_CARDS[0].id)
  const [cardData, setCardData]   = useState<Array<{ i: number; value: number }>>([])
  const [open, setOpen]           = useState(false)

  const selectedCard = MOCK_CARDS.find(c => c.id === selectedId)!

  // Portfolio curve
  useEffect(() => {
    const p = PERIODS[period]
    const start = p.up ? p.end * 0.97 : p.end * 1.04
    setChartData(genChartData(p.n, start, p.dr, p.vl, p.end))
  }, [period])

  // Card price curve
  useEffect(() => {
    const p = PERIODS[period]
    const isUp  = selectedCard.changePct >= 0
    const start = selectedCard.value * (isUp ? 0.88 : 1.12)
    setCardData(genChartData(p.n, start, isUp ? 0.002 : -0.002, p.vl * 0.5, selectedCard.value))
  }, [period, selectedId])

  const p    = PERIODS[period]
  const isUp = p.up

  // Best / worst
  const best  = GAINERS[0]
  const worst = LOSERS[0]

  // Heatmap max value for sizing
  const maxValue = Math.max(...MOCK_CARDS.map(c => c.value))

  return (
    <div className="px-4 sm:px-6 md:px-8 pb-12 mx-auto" style={{ maxWidth: 1280 }}>

      {/* ── HEADER ── */}
      <div className="pt-7 pb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[1.3px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
            Analyse de performance
          </p>
          <h1
            className="text-[28px] font-bold tracking-tight leading-none"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
          >
            Insights
          </h1>
          <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Statistiques détaillées et historique de prix de tes positions
          </p>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* ── KPI STRIP ── */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-[var(--radius)] overflow-hidden mb-5"
        style={{ background: 'var(--color-border)' }}
      >
        {[
          {
            icon: <TrendingUp size={13} />,
            color: 'var(--color-positive)',
            lbl: 'Meilleure carte',
            val: `${best.name.split(' ').slice(0,2).join(' ')}`,
            sub: formatPct(best.changePct),
            pos: true,
          },
          {
            icon: <TrendingDown size={13} />,
            color: 'var(--color-negative)',
            lbl: 'Pire carte',
            val: `${worst.name.split(' ').slice(0,2).join(' ')}`,
            sub: formatPct(worst.changePct),
            pos: false,
          },
          {
            icon: <Activity size={13} />,
            color: 'var(--color-brand)',
            lbl: 'Volatilité',
            val: `${VOLATILITY} %`,
            sub: `sur ${PERIOD_LABELS[period]}`,
            pos: null,
          },
          {
            icon: <Flame size={13} />,
            color: 'var(--color-pokemon-yellow)',
            lbl: 'Positions',
            val: String(MOCK_CARDS.length),
            sub: `${MOCK_CARDS.filter(c => c.changePct >= 0).length} en hausse`,
            pos: null,
          },
        ].map(({ icon, color, lbl, val, sub, pos }) => (
          <div
            key={lbl}
            className="py-3 px-4 bg-[var(--color-bg-surface)] hover:bg-[var(--color-bg-glass-hi)] transition-colors duration-150"
          >
            <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
              {icon}
              <p className="text-[9px] font-semibold uppercase tracking-[0.9px]" style={{ color: 'var(--color-text-muted)' }}>
                {lbl}
              </p>
            </div>
            <p
              className="text-[18px] font-bold leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                color: pos === true ? 'var(--color-positive)' : pos === false ? 'var(--color-negative)' : 'var(--color-text-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {val}
            </p>
            <p className="text-[10px] mt-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── PORTFOLIO CURVE ── */}
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle sub="Évolution de la valeur totale du portfolio">
            Courbe du portefeuille
          </SectionTitle>
          <div
            className="flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              fontFamily: 'var(--font-mono)',
              background: isUp ? 'var(--color-positive-soft)' : 'var(--color-negative-soft)',
              color: isUp ? 'var(--color-positive)' : 'var(--color-negative)',
            }}
          >
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatEurDiff(p.abs)}
          </div>
        </div>
        <div className="cursor-crosshair">
          <PeriodChart data={chartData} isUp={isUp} />
        </div>
      </Card>

      {/* ── TOP MOVERS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        {/* Gainers */}
        <Card className="p-4">
          <SectionTitle sub="Progression sur la période">
            <span className="flex items-center gap-1.5">
              <TrendingUp size={13} style={{ color: 'var(--color-positive)' }} />
              Top Gainers
            </span>
          </SectionTitle>
          <div className="flex flex-col">
            {GAINERS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                className="flex items-center gap-2.5 py-2 border-b last:border-b-0 last:pb-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span
                  className="text-[9px] w-4 flex-shrink-0 text-right tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <CardArt energy={card.energy as EnergyType} size="lg" imageUrl={card.imageUrl} name={card.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {card.name}
                  </p>
                  <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {formatEur(card.value)}
                  </p>
                </div>
                <MiniSparkline
                  data={CARD_SPARKS[card.id] ?? []}
                  isUp={card.changePct >= 0}
                />
                <span
                  className="text-[12px] font-bold flex-shrink-0 min-w-[52px] text-right"
                  style={{ fontFamily: 'var(--font-mono)', color: card.changePct >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                >
                  {formatPct(card.changePct)}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Losers */}
        <Card className="p-4">
          <SectionTitle sub="Recul sur la période">
            <span className="flex items-center gap-1.5">
              <TrendingDown size={13} style={{ color: 'var(--color-negative)' }} />
              Sous-performeurs
            </span>
          </SectionTitle>
          <div className="flex flex-col">
            {LOSERS.map((card, i) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06, ease: 'easeOut' }}
                className="flex items-center gap-2.5 py-2 border-b last:border-b-0 last:pb-0"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <span
                  className="text-[9px] w-4 flex-shrink-0 text-right tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <CardArt energy={card.energy as EnergyType} size="lg" imageUrl={card.imageUrl} name={card.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {card.name}
                  </p>
                  <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {formatEur(card.value)}
                  </p>
                </div>
                <MiniSparkline
                  data={CARD_SPARKS[card.id] ?? []}
                  isUp={card.changePct >= 0}
                />
                <span
                  className="text-[12px] font-bold flex-shrink-0 min-w-[52px] text-right"
                  style={{ fontFamily: 'var(--font-mono)', color: card.changePct >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                >
                  {formatPct(card.changePct)}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ALLOCATION CHARTS ── */}
      <Card className="p-5 mb-5">
        <SectionTitle sub="Comment ta valeur est distribuée">
          Répartition du portfolio
        </SectionTitle>
        <AllocationChartsConnected />
      </Card>

      {/* ── HEATMAP (Treemap style) ── */}
      <Card className="p-5 mb-5">
        <SectionTitle sub="Chaque tuile = une carte · Taille ∝ valeur · Couleur ∝ performance">
          Performance Heatmap
        </SectionTitle>

        <div className="flex gap-2 flex-wrap" style={{ minHeight: 120 }}>
          {MOCK_CARDS.sort((a, b) => b.value - a.value).map((card, i) => {
            const isCardUp   = card.changePct >= 0
            const intensity  = Math.min(Math.abs(card.changePct) / 20, 1)
            const pctWidth   = Math.max(12, (card.value / maxValue) * 38)
            const green = `rgba(16,185,129,${0.12 + intensity * 0.35})`
            const red   = `rgba(239,68,68,${0.12 + intensity * 0.35})`
            const border= isCardUp ? `rgba(16,185,129,${0.3 + intensity * 0.4})` : `rgba(239,68,68,${0.3 + intensity * 0.4})`

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' }}
                className="rounded-[var(--radius-md)] border p-3 flex flex-col justify-between cursor-pointer transition-transform duration-150 hover:scale-[1.03]"
                style={{
                  background:  isCardUp ? green : red,
                  borderColor: border,
                  flexBasis: `${pctWidth}%`,
                  minHeight: card.value > 150 ? 110 : 90,
                  flexGrow: 0,
                  flexShrink: 0,
                }}
              >
                <div>
                  <p
                    className="text-[11px] font-bold leading-tight mb-1"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                  >
                    {card.name}
                  </p>
                  <p className="text-[9px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                    {card.set}
                  </p>
                </div>
                <div>
                  <p className="text-[14px] font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                    {formatEur(card.value)}
                  </p>
                  <p
                    className="text-[11px] font-semibold"
                    style={{ fontFamily: 'var(--font-mono)', color: isCardUp ? 'var(--color-positive)' : 'var(--color-negative)' }}
                  >
                    {formatPct(card.changePct)}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Performance :</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239,68,68,0.5)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Baisse forte</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239,68,68,0.15)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Baisse légère</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.2)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Hausse légère</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.5)' }} />
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Hausse forte</span>
          </div>
          <span className="ml-2 text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            · Taille proportionnelle à la valeur
          </span>
        </div>
      </Card>

      {/* ── PRIX PAR CARTE ── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle sub="Historique de prix simulé pour la période sélectionnée">
            Prix par carte
          </SectionTitle>

          {/* Card picker */}
          <div className="relative">
            <button
              onClick={() => setOpen(o => !o)}
              className="flex items-center gap-2 h-8 px-3 rounded-[var(--radius-sm)] border text-[12px] font-medium transition-colors"
              style={{
                background: 'var(--color-bg-glass)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            >
              <CardArt energy={selectedCard.energy as EnergyType} size="sm" />
              <span className="max-w-[140px] truncate">{selectedCard.name}</span>
              <ChevronDown size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
            </button>

            {open && (
              <div
                className="absolute right-0 top-full mt-1 rounded-[var(--radius-md)] border overflow-hidden z-10"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  minWidth: 220,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {MOCK_CARDS.map(card => (
                  <button
                    key={card.id}
                    onClick={() => { setSelectedId(card.id); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                    style={{
                      background: card.id === selectedId ? 'var(--color-bg-glass-hi)' : 'transparent',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <CardArt energy={card.energy as EnergyType} size="lg" imageUrl={card.imageUrl} name={card.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium truncate">{card.name}</p>
                      <p className="text-[10px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {formatEur(card.value)}
                      </p>
                    </div>
                    <span
                      className="text-[11px] font-semibold flex-shrink-0"
                      style={{ fontFamily: 'var(--font-mono)', color: card.changePct >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
                    >
                      {formatPct(card.changePct)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Card stats row */}
        <div className="flex gap-6 mb-4 pb-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { lbl: 'Valeur actuelle', val: formatEur(selectedCard.value), accent: false },
            { lbl: 'Prix d\'achat',   val: formatEur(selectedCard.purchasePrice), accent: false },
            { lbl: 'P&L',            val: formatEurDiff(selectedCard.value - selectedCard.purchasePrice), accent: true },
            { lbl: 'Variation',      val: formatPct(selectedCard.changePct), accent: true },
            { lbl: 'Set',            val: selectedCard.set, accent: false },
            { lbl: 'Grade',          val: selectedCard.grade ?? 'Non gradée', accent: false },
          ].map(({ lbl, val, accent }) => {
            const isPositive = val.startsWith('+')
            return (
              <div key={lbl}>
                <p className="text-[9px] font-semibold uppercase tracking-[0.9px] mb-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {lbl}
                </p>
                <p
                  className="text-[13px] font-bold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: accent
                      ? isPositive ? 'var(--color-positive)' : 'var(--color-negative)'
                      : 'var(--color-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {val}
                </p>
              </div>
            )
          })}
        </div>

        <div className="cursor-crosshair">
          <CardPriceChart
            data={cardData}
            isUp={selectedCard.changePct >= 0}
            height={220}
            showAxes
          />
        </div>
      </Card>
    </div>
  )
}
