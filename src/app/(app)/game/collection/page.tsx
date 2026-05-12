'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Archive, DollarSign, TrendingUp, Clock, Filter, Sparkles } from 'lucide-react'
import { useInventory, useBalance, useSellCard, useSellAllCards } from '@/hooks/useGame'
import { useTCGdexCard, tcgdexImageUrl } from '@/hooks/useTCGdexCard'
import type { GameCard } from '@/types/game'

type SortMode = 'recent' | 'value-desc' | 'value-asc'

export default function GameCollectionPage() {
  const { items, totalValue, count } = useInventory()
  const { balance } = useBalance()
  const sell = useSellCard()
  const sellAll = useSellAllCards()
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [confirmSellAll, setConfirmSellAll] = useState(false)

  const sorted = useMemo(() => {
    const arr = [...items]
    switch (sortMode) {
      case 'recent':
        return arr.sort((a, b) =>
          new Date(b.firstAcquiredAt).getTime() - new Date(a.firstAcquiredAt).getTime()
        )
      case 'value-desc':
        return arr.sort((a, b) => b.card.value - a.card.value)
      case 'value-asc':
        return arr.sort((a, b) => a.card.value - b.card.value)
    }
  }, [items, sortMode])

  const handleSellAll = () => {
    if (!confirmSellAll) {
      setConfirmSellAll(true)
      setTimeout(() => setConfirmSellAll(false), 3000)
      return
    }
    const r = sellAll()
    alert(`Vendu ${r.cardsSold} carte(s) pour $${r.totalGained.toFixed(2)}`)
    setConfirmSellAll(false)
  }

  return (
    <div className="min-h-full page-enter" style={{ position: 'relative', zIndex: 1 }}>
      <div className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto" style={{ maxWidth: 1280 }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Archive size={14} style={{ color: 'var(--color-brand)' }} />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Ma collection · {count} cartes
              </p>
            </div>
            <h1
              className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Mes cartes Pokémon
            </h1>
            <p className="text-[13px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              Vends une carte pour récupérer sa valeur et rejouer.
            </p>
          </div>
          <Link
            href="/game"
            className="flex items-center gap-2 h-10 px-4 rounded-[var(--radius-sm)] border text-[13px] font-semibold transition-all hover:bg-[var(--color-bg-glass-hi)]"
            style={{
              borderColor: 'var(--color-border-strong)',
              background: 'var(--color-bg-glass)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Sparkles size={13} />
            Ouvrir des caisses
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatTile
            icon={<DollarSign size={14} />}
            label="Solde"
            value={`$${balance.toFixed(2)}`}
            color="var(--color-positive)"
            bg="var(--color-positive-soft)"
          />
          <StatTile
            icon={<Archive size={14} />}
            label="Cartes"
            value={String(count)}
            color="var(--color-brand)"
            bg="var(--color-brand-soft)"
          />
          <StatTile
            icon={<TrendingUp size={14} />}
            label="Valeur totale"
            value={`$${totalValue.toFixed(2)}`}
            color="var(--color-pokemon-yellow)"
            bg="var(--color-pokemon-yellow-soft)"
          />
        </div>

        {/* Filters + Sell all */}
        {items.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[1.2px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <Filter size={11} />
                Trier par
              </span>
              <FilterBtn
                active={sortMode === 'recent'}
                onClick={() => setSortMode('recent')}
                icon={<Clock size={11} />}
              >
                Plus récent
              </FilterBtn>
              <FilterBtn
                active={sortMode === 'value-desc'}
                onClick={() => setSortMode('value-desc')}
                icon={<TrendingUp size={11} />}
              >
                Plus chères
              </FilterBtn>
              <FilterBtn
                active={sortMode === 'value-asc'}
                onClick={() => setSortMode('value-asc')}
              >
                Moins chères
              </FilterBtn>
            </div>

            <button
              onClick={handleSellAll}
              className="h-9 px-4 rounded-[var(--radius-sm)] text-[12px] font-bold transition-all"
              style={{
                fontFamily: 'var(--font-display)',
                background: confirmSellAll
                  ? 'var(--color-negative)'
                  : 'var(--color-bg-glass-hi)',
                color: confirmSellAll ? '#fff' : 'var(--color-text-secondary)',
                border: '1px solid ' + (confirmSellAll ? 'var(--color-negative)' : 'var(--color-border-strong)'),
              }}
            >
              {confirmSellAll
                ? `Confirmer : vendre tout pour $${totalValue.toFixed(2)} ?`
                : 'Tout vendre'}
            </button>
          </div>
        )}

        {/* Grid */}
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {sorted.map(entry => (
              <InventoryCard
                key={entry.card.id}
                card={entry.card}
                count={entry.count}
                acquiredAt={entry.firstAcquiredAt}
                onSell={() => {
                  const r = sell(entry.card.id, 1)
                  if (r.success) {
                    // Toast léger via title
                    console.log(`Vendu pour $${r.valueGained.toFixed(2)}`)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sous-composants ─────────────────────────────────────────────────────

function StatTile({
  icon, label, value, color, bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
  bg: string
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-3"
      style={{
        background: 'var(--color-bg-glass)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center mb-2"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <p
        className="text-[9px] font-semibold uppercase tracking-[1.2px]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-[16px] font-bold tabular-nums leading-tight mt-0.5"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        {value}
      </p>
    </div>
  )
}

function FilterBtn({
  active, onClick, children, icon,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-[11px] font-semibold transition-all"
      style={{
        background: active ? 'var(--color-brand-soft)' : 'var(--color-bg-glass)',
        color: active ? 'var(--color-brand-hi)' : 'var(--color-text-secondary)',
        border: '1px solid ' + (active ? 'rgba(42,125,255,0.35)' : 'var(--color-border)'),
      }}
    >
      {icon}
      {children}
    </button>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-[var(--radius-lg)] border p-10 text-center"
      style={{
        background: 'var(--color-bg-glass)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'var(--color-brand-soft)' }}
      >
        <Archive size={24} style={{ color: 'var(--color-brand)' }} />
      </div>
      <h3
        className="text-[18px] font-bold"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
        }}
      >
        Ta collection est vide
      </h3>
      <p className="text-[13px] mt-2 mb-5" style={{ color: 'var(--color-text-secondary)' }}>
        Ouvre ta première caisse pour commencer.
      </p>
      <Link
        href="/game"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[var(--radius-sm)] font-bold text-[13px] text-white transition-all hover:scale-[1.03]"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
          boxShadow: '0 0 16px var(--color-brand-glow)',
        }}
      >
        <Sparkles size={13} />
        Ouvrir une caisse
      </Link>
    </div>
  )
}

function InventoryCard({
  card,
  count,
  acquiredAt,
  onSell,
}: {
  card: GameCard
  count: number
  acquiredAt: string
  onSell: () => void
}) {
  const { data: tcgCard } = useTCGdexCard(card.id)
  const imageUrl = tcgdexImageUrl(tcgCard, 'high') ?? card.imageUrl
  const displayName = tcgCard?.name ?? card.nameFr
  const setName = tcgCard?.set?.name ?? card.setFr
  const [confirming, setConfirming] = useState(false)

  const handleSellClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirming) {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2500)
      return
    }
    onSell()
    setConfirming(false)
  }

  const acquiredAgo = getRelativeTime(acquiredAt)
  const rarityGlow = getRarityGlow(card.rarity)

  return (
    <div
      className="group relative rounded-[var(--radius-md)] overflow-hidden border transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-strong)',
        boxShadow: `0 4px 16px ${rarityGlow}`,
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-[5/7] overflow-hidden"
        style={{ background: 'var(--color-bg-glass)' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold p-3 text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {displayName}
          </div>
        )}

        {/* Count badge (top-right) */}
        {count > 1 && (
          <span
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums"
            style={{
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ×{count}
          </span>
        )}

        {/* Time badge (top-left) */}
        <span
          className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-[0.6px]"
          style={{
            background: 'rgba(0,0,0,0.55)',
            color: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(6px)',
          }}
        >
          {acquiredAgo}
        </span>
      </div>

      {/* Footer */}
      <div className="p-2.5">
        <p
          className="text-[12px] font-bold truncate"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--color-text-primary)',
          }}
        >
          {displayName}
        </p>
        <p
          className="text-[9.5px] truncate mt-0.5"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {setName}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span
            className="text-[12px] font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-positive)',
            }}
          >
            ${card.value.toFixed(2)}
          </span>
          <button
            onClick={handleSellClick}
            className="text-[10px] font-bold uppercase tracking-[1px] px-2 h-7 rounded-[6px] transition-all"
            style={{
              fontFamily: 'var(--font-display)',
              background: confirming
                ? 'var(--color-positive)'
                : 'var(--color-bg-glass-hi)',
              color: confirming ? '#fff' : 'var(--color-text-primary)',
              border: '1px solid ' + (confirming ? 'var(--color-positive)' : 'var(--color-border-strong)'),
            }}
          >
            {confirming ? `+$${card.value.toFixed(2)} ?` : 'Vendre'}
          </button>
        </div>
      </div>
    </div>
  )
}

function getRarityGlow(rarity: string): string {
  switch (rarity) {
    case 'shining':
    case 'gold-star':
    case 'crystal':
    case 'rainbow-rare':
    case 'secret-rare':
      return 'rgba(255,204,0,0.25)'
    case 'tag-team':
    case 'vmax':
    case 'v':
    case 'gx':
    case 'ex':
      return 'rgba(168,85,247,0.22)'
    case 'holo':
      return 'rgba(91,127,255,0.20)'
    default:
      return 'rgba(0,0,0,0.3)'
  }
}

function getRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'À l\'instant'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}j`
}
