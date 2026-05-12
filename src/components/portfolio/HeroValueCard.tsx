'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ArrowUpRight, ArrowDownRight, Sparkles, Plus } from 'lucide-react'
import { animate } from 'framer-motion'
import { formatEur, formatEurDiff, formatPct } from '@/utils/formatCurrency'
import Link from 'next/link'

// Import côté client uniquement (Recharts utilise des APIs browser)
const PeriodChart = dynamic(
  () => import('./PeriodChart').then((m) => m.PeriodChart),
  { ssr: false, loading: () => <div style={{ height: 220 }} /> }
)

// Génère une ligne plate (avec légère variation) autour d'une valeur
function genFlatChart(value: number, n = 30): Array<{ i: number; value: number }> {
  if (value === 0) {
    return Array.from({ length: n }, (_, i) => ({ i, value: 0 }))
  }
  // Légère variation visuelle (~0.5%) pour que ce ne soit pas complètement plat
  return Array.from({ length: n }, (_, i) => ({
    i,
    value: value * (1 + (Math.sin(i * 0.4) * 0.003)),
  }))
}

const PERIOD_LABELS = {
  '7d':  '7J',
  '30d': '30J',
  '1y':  '1A',
  'all': 'TOUT',
} as const
type PeriodKey = keyof typeof PERIOD_LABELS

export interface HeroValueCardProps {
  totalValue: number
  pnl:        number
  pnlPct:     number
  cardCount:  number
  setCount:   number
  isLoading:  boolean
}

export function HeroValueCard({
  totalValue,
  pnl,
  pnlPct,
  cardCount,
  setCount,
  isLoading,
}: HeroValueCardProps) {
  const [period, setPeriod]   = useState<PeriodKey>('all')
  const [chartData, setChartData] = useState<Array<{ i: number; value: number }>>([])
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  // Re-génère le graphe à chaque changement de valeur totale
  useEffect(() => {
    setChartData(genFlatChart(totalValue, 40))
  }, [totalValue])

  // Anime le compteur quand totalValue change
  useEffect(() => {
    if (isLoading) return
    const from = prevRef.current
    const to   = totalValue
    prevRef.current = to

    const ctrl = animate(from, to, {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(v),
    })
    return () => ctrl.stop()
  }, [totalValue, isLoading])

  const isUp    = pnl >= 0
  const hasData = totalValue > 0
  const pnlColor = isUp ? 'var(--color-positive)' : 'var(--color-negative)'

  return (
    <div
      className="relative mb-6 rounded-[var(--radius-lg)] border overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(42,125,255,0.08) 0%, rgba(0,212,255,0.04) 50%, rgba(11,15,26,0.6) 100%)',
        borderColor: 'var(--color-border-strong)',
        boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Highlight top edge */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(42,125,255,0.4), transparent)' }}
      />

      {/* Glow accent */}
      <div
        className="absolute top-0 right-0 w-[40%] h-full pointer-events-none opacity-50"
        style={{
          background: 'radial-gradient(ellipse at top right, var(--color-brand-soft) 0%, transparent 60%)',
        }}
      />

      <div className="relative p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-1.5 h-1.5 rounded-full pulse-live"
                style={{ background: 'var(--color-positive)', boxShadow: '0 0 8px var(--color-positive-glow)' }}
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Valeur du portefeuille · Live
              </p>
            </div>

            {/* Valeur principale */}
            {isLoading ? (
              <div
                className="h-14 w-48 rounded-[var(--radius-sm)] mb-3"
                style={{ background: 'var(--color-bg-glass-hi)', animation: 'pulse 1.5s ease-in-out infinite' }}
              />
            ) : (
              <p
                className="text-[34px] sm:text-[48px] lg:text-[60px] font-extrabold leading-none tracking-[-1.5px] sm:tracking-[-3px] tabular-nums"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                  textShadow: '0 2px 24px rgba(0,0,0,0.5)',
                }}
              >
                {formatEur(display)}
              </p>
            )}

            {/* Badge variation P&L */}
            <div className="flex items-center gap-2.5 mt-3">
              {hasData && !isLoading ? (
                <>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: isUp ? 'var(--color-positive-soft)' : 'var(--color-negative-soft)',
                      borderColor: isUp ? 'rgba(16,217,140,0.25)' : 'rgba(255,77,94,0.25)',
                      color: pnlColor,
                      boxShadow: isUp ? '0 0 16px var(--color-positive-glow)' : '0 0 16px var(--color-negative-glow)',
                    }}
                  >
                    {isUp ? <ArrowUpRight size={11} strokeWidth={2.8} /> : <ArrowDownRight size={11} strokeWidth={2.8} />}
                    {pnl !== 0 ? `${formatEurDiff(pnl)} · ${formatPct(pnlPct)}` : '+0,00 € · 0,0%'}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                    depuis l&apos;achat
                  </span>
                </>
              ) : !isLoading ? (
                <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                  Ajoute tes premières cartes pour voir ton P&L
                </span>
              ) : null}
            </div>
          </div>

          {/* Mini-stats + AI button */}
          <div className="flex items-start gap-3 sm:gap-5 flex-wrap">
            {isLoading ? (
              <>
                {[0,1,2].map(i => (
                  <div key={i} className="text-right">
                    <div className="h-4 w-10 rounded mb-1" style={{ background: 'var(--color-bg-glass-hi)' }} />
                    <div className="h-2 w-8 rounded" style={{ background: 'var(--color-bg-glass-hi)' }} />
                  </div>
                ))}
              </>
            ) : (
              <>
                {[
                  { val: String(cardCount), lbl: 'Cartes', color: 'var(--color-text-primary)' },
                  {
                    val: pnl !== 0 ? (pnl >= 0 ? `+${formatEur(pnl)}` : formatEur(pnl)) : '—',
                    lbl: 'P&L',
                    color: pnl > 0 ? 'var(--color-positive)' : pnl < 0 ? 'var(--color-negative)' : 'var(--color-text-muted)',
                  },
                  { val: String(setCount), lbl: 'Sets', color: 'var(--color-text-primary)' },
                ].map(({ val, lbl, color }) => (
                  <div key={lbl} className="text-right">
                    <p
                      className="text-[15px] font-bold tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)', color }}
                    >
                      {val}
                    </p>
                    <p
                      className="text-[9px] uppercase tracking-[1px] mt-0.5"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {lbl}
                    </p>
                  </div>
                ))}
              </>
            )}
            <button
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand) 0%, var(--color-cyan) 100%)',
                color: 'white',
                boxShadow: '0 0 12px var(--color-brand-glow)',
                fontFamily: 'var(--font-body)',
              }}
            >
              <Sparkles size={10} strokeWidth={2.5} />
              IA
            </button>
          </div>
        </div>

        {/* Chart ou Empty state */}
        {!isLoading && !hasData ? (
          /* ── Empty state : compte vide ── */
          <div
            className="flex flex-col items-center justify-center py-10 rounded-[var(--radius-md)] border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)', minHeight: 180 }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: 'var(--color-brand-soft)' }}
            >
              <Plus size={22} style={{ color: 'var(--color-brand)' }} />
            </div>
            <p
              className="text-[14px] font-bold mb-1"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              Ton portefeuille est vide
            </p>
            <p className="text-[12px] mb-4 text-center max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
              Ajoute tes premières cartes ou scellés pour commencer à suivre la valeur de ta collection.
            </p>
            <Link
              href="/add"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[12px] font-bold text-white transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
                boxShadow: '0 0 16px var(--color-brand-glow)',
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Ajouter ma première carte
            </Link>
          </div>
        ) : (
          /* ── Graphe ── */
          <>
            <div className="cursor-crosshair -mx-1">
              <PeriodChart data={chartData} isUp={isUp} />
            </div>
            {/* Period tabs */}
            <div className="flex gap-1 mt-3">
              {(Object.keys(PERIOD_LABELS) as PeriodKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setPeriod(key)}
                  className="px-3 py-1.5 rounded-[8px] transition-all duration-200 border"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.6px',
                    color: period === key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    background: period === key ? 'var(--color-bg-glass-hi)' : 'transparent',
                    borderColor: period === key ? 'var(--color-border-strong)' : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {PERIOD_LABELS[key]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
