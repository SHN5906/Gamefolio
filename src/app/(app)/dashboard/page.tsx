'use client'

import { useMemo } from 'react'
import { HeroValueCard } from '@/components/portfolio/HeroValueCard'
import { AllocationDonut } from '@/components/portfolio/AllocationDonut'
import { CardArt } from '@/components/cards/CardArt'
import { Card } from '@/components/ui/card'
import { PokemonMarketTable } from '@/components/ui/pokemon-market-table'
import { OnboardingModal } from '@/components/onboarding/OnboardingModal'
import { useCollectionData } from '@/hooks/useCollectionData'
import { usePortfolioStats } from '@/hooks/usePortfolioStats'
import { formatEur, formatPct } from '@/utils/formatCurrency'
import type { EnergyType } from '@/constants/theme'
import { Trophy, Award, Flame, Zap, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { cards } = useCollectionData()
  const stats = usePortfolioStats()

  // Top movers perso : les plus chères en tête
  const topMovers = useMemo(() => {
    if (cards.length === 0) return []
    return [...cards]
      .sort((a, b) => (b.current_price_eur ?? 0) - (a.current_price_eur ?? 0))
      .slice(0, 5)
      .map(c => ({
        id:        c.id,
        name:      c.name_fr ?? c.name_en ?? 'Carte',
        set:       c.set_name_fr ?? c.set_name_en ?? '',
        energy:    (c.types?.[0]?.toLowerCase() ?? 'colorless') as EnergyType,
        value:     c.current_price_eur ?? 0,
        changePct: c.purchase_price_eur && c.current_price_eur
          ? ((c.current_price_eur - c.purchase_price_eur) / c.purchase_price_eur) * 100
          : 0,
        imageUrl:  c.image_url_high ?? c.image_url_low ?? null,
      }))
  }, [cards])

  // KPIs dynamiques calculés depuis les vraies données
  const STATS = useMemo(() => [
    {
      icon: Trophy,
      iconColor: 'var(--color-pokemon-yellow)',
      iconBg: 'var(--color-pokemon-yellow-soft)',
      lbl: 'Top asset',
      val: stats.topAsset?.name ?? '—',
      sub: stats.topAsset
        ? `${formatEur(stats.topAsset.value)}${stats.topAsset.grade ? ` · ${stats.topAsset.grade}` : ''}`
        : 'Aucune carte',
    },
    {
      icon: Award,
      iconColor: 'var(--color-cyan)',
      iconBg: 'var(--color-cyan-soft)',
      lbl: 'Cartes gradées',
      val: String(stats.gradedCount),
      sub: stats.gradedCount > 0 ? 'PSA 9–10' : 'Aucune',
    },
    {
      icon: Flame,
      iconColor: 'var(--color-negative)',
      iconBg: 'var(--color-negative-soft)',
      lbl: 'P&L total',
      val: stats.pnl >= 0 ? `+${formatEur(stats.pnl)}` : formatEur(stats.pnl),
      sub: `${formatPct(stats.pnlPct)} vs achat`,
    },
    {
      icon: Zap,
      iconColor: 'var(--color-brand)',
      iconBg: 'var(--color-brand-soft)',
      lbl: 'Sets',
      val: String(stats.setCount),
      sub: `${stats.cardCount} cartes au total`,
    },
  ], [stats])

  return (
    <div className="min-h-full page-enter" style={{ position: 'relative', zIndex: 1 }}>
      <OnboardingModal />
      <div className="px-4 sm:px-6 md:px-8 pt-6 pb-12 mx-auto" style={{ maxWidth: 1280 }}>

        {/* ── HERO ── */}
        <HeroValueCard
          totalValue={stats.totalValue}
          pnl={stats.pnl}
          pnlPct={stats.pnlPct}
          cardCount={stats.cardCount}
          setCount={stats.setCount}
          isLoading={stats.isLoading}
        />

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-7 stagger-children">
          {STATS.map(({ icon: Icon, iconColor, iconBg, lbl, val, sub }) => (
            <div
              key={lbl}
              className="group relative rounded-[var(--radius-md)] border p-4 transition-all duration-200 cursor-default"
              style={{
                background: 'var(--color-bg-glass)',
                borderColor: 'var(--color-border)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center mb-3 border"
                style={{ background: iconBg, borderColor: 'rgba(255,255,255,0.06)', color: iconColor }}
              >
                <Icon size={14} strokeWidth={2} />
              </div>

              <p
                className="text-[9.5px] font-semibold uppercase tracking-[1px] mb-1"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {lbl}
              </p>
              <p
                className="text-[16px] font-bold leading-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--color-text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {val}
              </p>
              <p
                className="text-[10.5px] mt-1"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
              >
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── MARKET TABLE ── */}
        <div className="mb-7">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-1.5 h-1.5 rounded-full pulse-live"
                  style={{ background: 'var(--color-positive)', boxShadow: '0 0 6px var(--color-positive-glow)' }}
                />
                <p
                  className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Marché live
                </p>
              </div>
              <h2
                className="text-[20px] font-bold tracking-tight leading-none"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
              >
                Top Movers TCG
              </h2>
              <p className="text-[12px] mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                Cartes les plus cotées et celles qui explosent en ce moment
              </p>
            </div>
            <Link
              href="/collection"
              className="group flex items-center gap-1.5 text-[12px] font-medium transition-all"
              style={{ color: 'var(--color-brand)' }}
            >
              Voir ma collection
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <PokemonMarketTable />
        </div>

        {/* ── GRID : Top Movers perso + Allocation ── */}
        <div className="grid gap-4 grid-cols-1 lg:[grid-template-columns:1fr_320px]">

          {/* Top Movers de ma collection */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[1.2px]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Ma collection
                </p>
                <h3
                  className="text-[14px] font-bold tracking-tight mt-0.5"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                >
                  Top Performers
                </h3>
              </div>
              <Link href="/collection" className="text-[11px] font-medium" style={{ color: 'var(--color-brand)' }}>
                Tout voir →
              </Link>
            </div>
            <div className="flex flex-col">
              {topMovers.length === 0 ? (
                <p className="text-[12px] py-6 text-center" style={{ color: 'var(--color-text-muted)' }}>
                  Pas encore de cartes — <Link href="/add" style={{ color: 'var(--color-brand)' }}>ajouter</Link>
                </p>
              ) : topMovers.map((card, i) => {
                const isUp = card.changePct >= 0
                return (
                  <Link
                    key={card.id}
                    href={`/card/${encodeURIComponent(card.id)}`}
                    className="group flex items-center gap-3 py-2.5 border-b last:border-b-0 last:pb-0 cursor-pointer transition-all"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span
                      className="text-[10px] w-5 flex-shrink-0 text-right tabular-nums"
                      style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <CardArt energy={card.energy} size="lg" imageUrl={card.imageUrl} name={card.name} />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12.5px] font-semibold truncate transition-colors group-hover:text-[var(--color-brand-hi)]"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {card.name}
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
                      >
                        {card.set} · {formatEur(card.value)}
                      </p>
                    </div>
                    <span
                      className="text-[12px] font-bold flex-shrink-0 px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        color: isUp ? 'var(--color-positive)' : 'var(--color-negative)',
                        background: isUp ? 'var(--color-positive-soft)' : 'var(--color-negative-soft)',
                      }}
                    >
                      {formatPct(card.changePct)}
                    </span>
                  </Link>
                )
              })}
            </div>
          </Card>

          {/* Allocation */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[1.2px]"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Répartition
                </p>
                <h3
                  className="text-[14px] font-bold tracking-tight mt-0.5"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
                >
                  Par set
                </h3>
              </div>
              <Link href="/insights" className="text-[11px] font-medium" style={{ color: 'var(--color-brand)' }}>
                Détails →
              </Link>
            </div>
            <AllocationDonut totalValue={stats.totalValue} />
          </Card>
        </div>
      </div>
    </div>
  )
}
