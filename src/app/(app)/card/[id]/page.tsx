'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, Heart, Plus, ShoppingCart,
  Bell, Eye, BarChart2, Award, Sparkles, ExternalLink, Globe2, Hash, Calendar,
} from 'lucide-react'
import { useCollectionData } from '@/hooks/useCollectionData'
import { Card } from '@/components/ui/card'
import { CardArt } from '@/components/cards/CardArt'
import { genChartData, PERIODS, type PeriodKey } from '@/lib/mock'
import { formatEur, formatEurDiff, formatPct } from '@/utils/formatCurrency'
import { energyColors, type EnergyType } from '@/constants/theme'

// ── Constructeurs de liens externes ───────────────────────────────
function buildCardmarketUrl(name: string) {
  return `https://www.cardmarket.com/fr/Pokemon/Products/Search?searchString=${encodeURIComponent(name)}&language=1`
}
function buildTcgdexUrl(cardId: string) {
  // card_id format : "sv03.5-6" → split pour path /database/sv03.5/6
  const parts = cardId.split('-')
  if (parts.length >= 2) {
    return `https://www.tcgdex.net/database/${parts.slice(0, -1).join('-')}/${parts[parts.length - 1]}`
  }
  return `https://www.tcgdex.net/`
}
function buildEbayUrl(name: string) {
  return `https://www.ebay.fr/sch/i.html?_nkw=${encodeURIComponent(name + ' pokemon card')}&_sacat=183454`
}

const CardPriceChart = dynamic(
  () => import('@/components/insights/CardPriceChart').then(m => m.CardPriceChart),
  { ssr: false, loading: () => <div style={{ height: 240 }} /> }
)

const PERIOD_LABELS: Record<PeriodKey, string> = {
  '24h': '24H', '7d': '7J', '30d': '30J', '1y': '1A', 'all': 'TOUT',
}

interface CardDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { cards, isLoading } = useCollectionData()
  const [period, setPeriod] = useState<PeriodKey>('30d')
  const [chartData, setChartData] = useState<Array<{ i: number; value: number }>>([])

  // Trouve la carte (depuis la collection — en mode prod faudra un fetch direct du catalog)
  const card = cards.find(c => c.id === decodeURIComponent(id))

  // Génère un historique de prix simulé
  useEffect(() => {
    if (!card) return
    const p = PERIODS[period]
    const value = card.current_price_eur ?? 100
    const isUp = (card.purchase_price_eur ?? 0) < value
    const start = value * (isUp ? 0.85 : 1.15)
    setChartData(genChartData(p.n, start, isUp ? 0.002 : -0.002, p.vl * 0.7, value))
  }, [card, period])

  if (isLoading) {
    return (
      <div className="px-8 pt-8 mx-auto" style={{ maxWidth: 1200 }}>
        <div className="shimmer h-8 w-32 rounded mb-6" />
        <div className="shimmer h-96 w-full rounded-[var(--radius-lg)]" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="px-8 pt-12 mx-auto text-center" style={{ maxWidth: 800 }}>
        <p className="text-[14px] mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Carte introuvable.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[12px] font-semibold border"
          style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
        >
          <ArrowLeft size={13} /> Retour
        </button>
      </div>
    )
  }

  const name      = card.name_fr ?? card.name_en ?? 'Carte'
  const setName   = card.set_name_fr ?? card.set_name_en ?? '—'
  const number    = card.catalog_number ?? '—'
  const energy    = (card.types?.[0]?.toLowerCase() ?? 'colorless') as EnergyType
  const ec        = energyColors[energy] ?? energyColors.colorless
  const value     = card.current_price_eur ?? 0
  const cost      = (card.purchase_price_eur ?? 0) * card.quantity
  const totalVal  = value * card.quantity
  const pnl       = totalVal - cost
  const pnlPct    = cost > 0 ? (pnl / cost) * 100 : 0
  const isUp      = pnl >= 0

  return (
    <div className="px-4 sm:px-6 md:px-8 pt-6 pb-12 mx-auto" style={{ maxWidth: 1280 }}>

      {/* Breadcrumb */}
      <button
        onClick={() => router.back()}
        className="group flex items-center gap-1.5 text-[12px] mb-5 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        Retour
      </button>

      <div className="grid gap-6 grid-cols-1 lg:[grid-template-columns:320px_1fr]">

        {/* ── Visuel carte ── */}
        <div>
          <div
            className="relative rounded-[var(--radius-lg)] overflow-hidden border"
            style={{
              aspectRatio: '2.5/3.5',
              borderColor: 'var(--color-border-strong)',
              background: card.image_url_high
                ? `url(${card.image_url_high}) center/cover no-repeat`
                : `linear-gradient(140deg, ${ec.from}, ${ec.via}, ${ec.to})`,
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Pattern + highlight si pas d'image */}
            {!card.image_url_high && (
              <>
                <div
                  className="absolute inset-0 opacity-25 mix-blend-overlay"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 6px)',
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-1/4" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)' }} />
                <div className="absolute inset-x-0 bottom-0 h-1/3 p-3 flex items-end" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent)' }}>
                  <div>
                    <p className="text-[18px] font-extrabold leading-tight" style={{ fontFamily: 'var(--font-display)', color: 'white', letterSpacing: '-0.02em' }}>
                      {name}
                    </p>
                    <p className="text-[10px] font-mono opacity-80 mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {number}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Badge gradé */}
            {card.grade && (
              <div
                className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  color: '#FCD34D',
                  border: '1px solid rgba(252,211,77,0.4)',
                  boxShadow: '0 0 16px rgba(252,211,77,0.25)',
                }}
              >
                <Award size={9} />
                {card.grade}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link
              href="/wishlist"
              className="flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-all hover:-translate-y-px"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              <Heart size={12} />
              Wishlist
            </Link>
            <a
              href={buildCardmarketUrl(name)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-sm)] text-[12px] font-semibold text-white transition-all hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 16px var(--color-brand-glow)' }}
            >
              <ShoppingCart size={12} />
              Acheter
            </a>
          </div>

          {/* Liens externes */}
          <div className="mt-3 flex flex-col gap-1.5">
            {[
              {
                label: 'Cardmarket',
                href:  buildCardmarketUrl(name),
                icon:  ShoppingCart,
                color: 'var(--color-cyan)',
                sub:   'Voir les offres',
              },
              {
                label: 'TCGdex',
                href:  buildTcgdexUrl(card.card_id),
                icon:  ExternalLink,
                color: 'var(--color-text-muted)',
                sub:   'Fiche carte',
              },
              {
                label: 'eBay',
                href:  buildEbayUrl(name),
                icon:  ShoppingCart,
                color: 'var(--color-warning)',
                sub:   'Enchères',
              },
            ].map(({ label, href, icon: Icon, color, sub }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between h-9 px-3 rounded-[var(--radius-sm)] text-[11px] font-medium border transition-all hover:-translate-y-px hover:border-[var(--color-border-strong)]"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}
              >
                <span className="flex items-center gap-2">
                  <Icon size={11} style={{ color }} />
                  <span style={{ color: 'var(--color-text-primary)' }}>{label}</span>
                  <span className="text-[9.5px]" style={{ color: 'var(--color-text-muted)' }}>{sub}</span>
                </span>
                <ArrowUpRight size={10} style={{ color: 'var(--color-text-muted)' }} />
              </a>
            ))}
          </div>
        </div>

        {/* ── Infos & chart ── */}
        <div className="flex flex-col gap-5">

          {/* Header */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1.3px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {setName} · #{number}
            </p>
            <h1
              className="text-[34px] font-extrabold leading-none tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)', letterSpacing: '-0.025em' }}
            >
              {name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                {card.condition}
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <Globe2 size={9} className="inline mr-1" />
                {card.language.toUpperCase()}
              </span>
              {card.rarity && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                  style={{ background: 'var(--color-purple-soft)', borderColor: 'rgba(139,92,246,0.25)', color: 'var(--color-purple)' }}>
                  <Sparkles size={9} className="inline mr-1" />
                  {card.rarity}
                </span>
              )}
              {card.grade && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{ background: 'rgba(252,211,77,0.12)', borderColor: 'rgba(252,211,77,0.3)', color: '#FCD34D' }}>
                  <Award size={9} className="inline mr-1" />
                  {card.grade}
                </span>
              )}
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <Hash size={9} className="inline mr-1" />
                Qté {card.quantity}
              </span>
            </div>
          </div>

          {/* Big stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-[var(--radius)] overflow-hidden border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-border)' }}>
            {[
              { lbl: 'Prix actuel',  val: formatEur(value),         sub: 'par unité',         emphasis: false },
              { lbl: 'Valeur totale', val: formatEur(totalVal),     sub: `${card.quantity} unité${card.quantity>1?'s':''}`, emphasis: true },
              { lbl: 'Prix d\'achat', val: card.purchase_price_eur ? formatEur(card.purchase_price_eur) : '—', sub: 'par unité', emphasis: false },
              { lbl: 'P&L', val: cost > 0 ? formatEurDiff(pnl) : '—', sub: cost > 0 ? formatPct(pnlPct) : 'aucun coût', emphasis: true, color: cost > 0 ? (isUp ? 'var(--color-positive)' : 'var(--color-negative)') : 'var(--color-text-primary)' },
            ].map(({ lbl, val, sub, emphasis, color }) => (
              <div
                key={lbl}
                className="px-4 py-3"
                style={{ background: 'var(--color-bg-glass)' }}
              >
                <p className="text-[9.5px] font-semibold uppercase tracking-[0.9px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  {lbl}
                </p>
                <p
                  className="text-[18px] font-bold leading-none"
                  style={{
                    fontFamily: emphasis ? 'var(--font-display)' : 'var(--font-mono)',
                    color: color ?? 'var(--color-text-primary)',
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: emphasis ? '-0.02em' : '0',
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

          {/* Chart card */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: 'var(--color-text-muted)' }}>
                  Historique de prix
                </p>
                <h3 className="text-[14px] font-bold tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                  Évolution Cardmarket
                </h3>
              </div>
              {/* Period tabs */}
              <div className="flex gap-1">
                {(Object.keys(PERIODS) as PeriodKey[]).map(key => (
                  <button
                    key={key}
                    onClick={() => setPeriod(key)}
                    className="px-2.5 py-1 rounded-[6px] transition-all duration-150 border text-[10px] font-semibold"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.5px',
                      color:       period === key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                      background:  period === key ? 'var(--color-bg-glass-hi)' : 'transparent',
                      borderColor: period === key ? 'var(--color-border-strong)' : 'transparent',
                    }}
                  >
                    {PERIOD_LABELS[key]}
                  </button>
                ))}
              </div>
            </div>
            <div className="cursor-crosshair">
              <CardPriceChart data={chartData} isUp={isUp} height={240} showAxes />
            </div>
          </Card>

          {/* Notes & purchase info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                <Calendar size={10} className="inline mr-1" />
                Acheté le
              </p>
              <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {card.purchase_date ?? '—'}
              </p>
              {!card.purchase_date && (
                <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Date non renseignée</p>
              )}
            </Card>
            <Card className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[1.2px] mb-2" style={{ color: 'var(--color-text-muted)' }}>
                <Eye size={10} className="inline mr-1" />
                Notes
              </p>
              <p className="text-[12px]" style={{ color: card.notes ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                {card.notes ?? 'Aucune note pour cette carte'}
              </p>
            </Card>
          </div>

          {/* Comparables section */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[1.2px]" style={{ color: 'var(--color-text-muted)' }}>
                  À découvrir
                </p>
                <h3 className="text-[14px] font-bold tracking-tight mt-0.5" style={{ fontFamily: 'var(--font-display)' }}>
                  Cartes similaires
                </h3>
              </div>
              <Link href="/collection" className="text-[11px] font-medium" style={{ color: 'var(--color-brand)' }}>
                Tout voir →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {cards.filter(c => c.id !== card.id).slice(0, 4).map(c => {
                const cName   = c.name_fr ?? c.name_en ?? 'Carte'
                const cEnergy = (c.types?.[0]?.toLowerCase() ?? 'colorless') as EnergyType
                return (
                  <Link
                    key={c.id}
                    href={`/card/${encodeURIComponent(c.id)}`}
                    className="group flex items-center gap-2.5 p-2.5 rounded-[var(--radius-sm)] border card-lift"
                    style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}
                  >
                    <CardArt energy={cEnergy} size="md" imageUrl={c.image_url_high ?? c.image_url_low ?? null} name={cName} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-semibold truncate group-hover:text-[var(--color-brand-hi)] transition-colors" style={{ color: 'var(--color-text-primary)' }}>
                        {cName}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                        {formatEur(c.current_price_eur ?? 0)}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
