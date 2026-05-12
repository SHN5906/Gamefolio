'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, X, LayoutGrid, List, SlidersHorizontal,
  TrendingUp, TrendingDown, Plus, Package, Lock, PackageOpen, Loader2, Database
} from 'lucide-react'
import {
  SEALED_TYPE_LABELS, type MockCard, type MockSealedProduct
} from '@/lib/mock'
import { useCollectionData } from '@/hooks/useCollectionData'
import { CollectionCard } from '@/components/cards/CollectionCard'
import { CollectionRow }  from '@/components/cards/CollectionRow'
import type { UserCardRow } from '@/lib/data/cards'
import type { SealedRow } from '@/lib/data/sealed'

// ── Adapteurs UserCardRow → MockCard pour compat avec les composants existants ──
function rowToMockCard(r: UserCardRow): MockCard {
  return {
    id:            r.id,
    name:          r.name_fr ?? r.name_en ?? 'Carte sans nom',
    set:           r.set_name_fr ?? r.set_name_en ?? '—',
    number:        r.catalog_number ?? '',
    energy:        (r.types?.[0]?.toLowerCase() ?? 'colorless') as MockCard['energy'],
    condition:     r.condition,
    language:      r.language.toUpperCase(),
    grade:         r.grade,
    value:         r.current_price_eur ?? 0,
    changePct:     0,
    purchasePrice: r.purchase_price_eur ?? 0,
    imageUrl:      r.image_url_high ?? r.image_url_low ?? null,
  }
}

function rowToMockSealed(r: SealedRow): MockSealedProduct {
  return {
    id:            r.id,
    name:          r.name,
    type:          r.type,
    set:           r.set_name ?? '',
    language:      r.language.toUpperCase(),
    condition:     r.state,
    quantity:      r.quantity,
    purchasePrice: r.purchase_price_eur ?? 0,
    value:         r.current_value_eur ?? 0,
    changePct:     0,
    imageUrl:      r.image_url ?? null,
  }
}

// ── Types ─────────────────────────────────────────────────────────
type ViewMode   = 'grid' | 'list'
type SortKey    = 'name' | 'value' | 'pnl' | 'pnlPct'
type FilterCond = 'ALL' | 'NM' | 'EX' | 'GD' | 'PL' | 'PO'
type TabFilter  = 'tout' | 'cartes' | 'scelles'

// ── Helpers ───────────────────────────────────────────────────────
function fmtEur(n: number): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

// ── Stats strip ───────────────────────────────────────────────────
function StatsStrip({ cards, sealed }: { cards: MockCard[]; sealed: MockSealedProduct[] }) {
  const cardsValue  = cards.reduce((acc, c) => acc + c.value, 0)
  const cardsCost   = cards.reduce((acc, c) => acc + c.purchasePrice, 0)
  const sealedValue = sealed.reduce((acc, s) => acc + s.value * s.quantity, 0)
  const sealedCost  = sealed.reduce((acc, s) => acc + s.purchasePrice * s.quantity, 0)
  const sealedCount = sealed.reduce((acc, s) => acc + s.quantity, 0)

  const totalValue = cardsValue + sealedValue
  const totalCost  = cardsCost + sealedCost
  const pnl        = totalValue - totalCost
  const pnlPct     = totalCost > 0 ? (pnl / totalCost) * 100 : 0
  const isUp       = pnl >= 0

  // Sets uniques
  const sets = new Set(cards.map(c => c.set))

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-6 stagger-children">
      {[
        { label: 'Valeur totale', value: fmtEur(totalValue), sub: null, mono: true, positive: undefined },
        { label: 'P&L total',     value: totalCost > 0 ? (isUp ? '+' : '') + fmtEur(pnl) : '—',  sub: totalCost > 0 ? (isUp ? '+' : '') + pnlPct.toFixed(2) + '%' : 'Prix d\'achat manquant', mono: true, positive: totalCost > 0 ? isUp : undefined },
        { label: 'Cartes',        value: cards.length.toString(),          sub: `${sets.size} sets`,        mono: false, positive: undefined },
        { label: 'Scellés',       value: sealedCount.toString(),           sub: `${sealed.length} produits`, mono: false, positive: undefined },
      ].map(({ label, value, sub, positive, mono }) => (
        <div key={label} className="rounded-[var(--radius-md)] border px-4 py-3 transition-colors duration-200" style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}>
          <p className="text-[11px] mb-1 uppercase tracking-[1px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-[18px] font-bold tracking-tight leading-none"
            style={{
              fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
              color: positive === true ? 'var(--color-positive)' : positive === false ? 'var(--color-negative)' : 'var(--color-text-primary)',
            }}
          >{value}</p>
          {sub && <p className="text-[11px] mt-0.5" style={{ color: positive != null ? (positive ? 'var(--color-positive)' : 'var(--color-negative)') : 'var(--color-text-muted)' }}>{sub}</p>}
        </div>
      ))}
    </div>
  )
}

// ── Row scellé ────────────────────────────────────────────────────
function SealedRow({ product }: { product: MockSealedProduct }) {
  const isUp = product.changePct >= 0
  const pnl  = (product.value - product.purchasePrice) * product.quantity
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-[var(--radius-sm)] border"
      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}
    >
      {/* Icône type */}
      <div className="w-9 h-[50px] rounded flex-shrink-0 flex items-center justify-center"
        style={{ background: 'linear-gradient(140deg, #0C2057, #1A6FFF)' }}
      >
        {product.condition === 'sealed'
          ? <Lock size={14} color="rgba(255,255,255,0.7)" />
          : <PackageOpen size={14} color="rgba(255,255,255,0.7)" />
        }
      </div>

      {/* Nom + détails */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
          {product.name}
        </p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {SEALED_TYPE_LABELS[product.type]} · {product.set} · {product.language}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: product.condition === 'sealed' ? 'rgba(26,111,255,0.15)' : 'rgba(245,158,11,0.15)', color: product.condition === 'sealed' ? 'var(--color-brand)' : 'var(--color-warning)' }}
        >
          {product.condition === 'sealed' ? 'Scellé' : 'Ouvert'}
        </span>
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>×{product.quantity}</span>
      </div>

      {/* Prix achat */}
      <div className="w-20 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Achat</p>
        <p className="text-[12px] font-medium" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>
          {(product.purchasePrice * product.quantity).toFixed(2)} €
        </p>
      </div>

      {/* Valeur */}
      <div className="w-24 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Valeur</p>
        <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
          {(product.value * product.quantity).toFixed(2)} €
        </p>
      </div>

      {/* P&L — uniquement si prix d'achat connu */}
      <div className="w-24 text-right flex-shrink-0">
        <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>P&amp;L</p>
        {product.purchasePrice > 0 ? (
          <p className="text-[13px] font-bold flex items-center justify-end gap-0.5"
            style={{ fontFamily: 'var(--font-mono)', color: pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)' }}
          >
            {pnl >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} €
          </p>
        ) : (
          <p className="text-[13px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>—</p>
        )}
      </div>
    </div>
  )
}

// ── Card scellé (vue grille) ──────────────────────────────────────
function SealedCard({ product }: { product: MockSealedProduct }) {
  const isUp = product.changePct >= 0

  // Couleur selon type
  const TYPE_GRADIENTS: Record<string, string> = {
    display: 'linear-gradient(140deg, #1E0A4B 0%, #2A7DFF 100%)',
    etb:     'linear-gradient(140deg, #4B0F3F 0%, #EC4899 100%)',
    coffret: 'linear-gradient(140deg, #4B1A0A 0%, #FF6B47 100%)',
    blister: 'linear-gradient(140deg, #0A4B3F 0%, #10D9A0 100%)',
    deck:    'linear-gradient(140deg, #4B3A0A 0%, #FFCC00 100%)',
    tin:     'linear-gradient(140deg, #2A2F3F 0%, #94A3B8 100%)',
    bundle:  'linear-gradient(140deg, #1A0A4B 0%, #8B5CF6 100%)',
    promo:   'linear-gradient(140deg, #4B0A0A 0%, #FF4D5E 100%)',
  }

  return (
    <div className="group flex flex-col rounded-[var(--radius-md)] border overflow-hidden card-lift" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}>
      {/* Visuel produit */}
      <div
        className="relative w-full flex flex-col items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '2.5/3.5',
          background: product.imageUrl ? '#0B0F1A' : (TYPE_GRADIENTS[product.type] || TYPE_GRADIENTS.display),
        }}
      >
        {/* Image réelle si dispo, sinon fallback gradient + icône */}
        {product.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-contain p-2"
              style={{ background: TYPE_GRADIENTS[product.type] || TYPE_GRADIENTS.display }}
            />
          </>
        ) : (
          <>
            {/* Pattern overlay */}
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 8px)',
              }}
            />
            <div className="absolute inset-x-0 top-0 h-1/3" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)' }} />
            <div className="relative flex flex-col items-center gap-2 mt-2">
              {product.condition === 'sealed'
                ? <Lock size={22} strokeWidth={1.5} color="rgba(255,255,255,0.85)" />
                : <PackageOpen size={22} strokeWidth={1.5} color="rgba(255,255,255,0.85)" />
              }
              <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-white/70">
                {SEALED_TYPE_LABELS[product.type].split(' ')[0]}
              </p>
            </div>
          </>
        )}

        {/* Badge type — toujours visible */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded backdrop-blur-md text-[9px] font-bold z-10"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
        >
          {SEALED_TYPE_LABELS[product.type].split(' ')[0]}
        </div>
        {product.quantity > 1 && (
          <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded backdrop-blur-md text-[9px] font-bold z-10"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            ×{product.quantity}
          </div>
        )}

        {/* Bottom shine */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 z-[1]" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.4), transparent)' }} />
      </div>

      <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">
        <p className="text-[12px] font-semibold leading-tight truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
          {product.name}
        </p>
        <p className="text-[10px] truncate" style={{ color: 'var(--color-text-muted)' }}>{product.set}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {(product.value * product.quantity).toFixed(2)} €
          </span>
          <span className="flex items-center gap-0.5 text-[10px] font-semibold"
            style={{ color: isUp ? 'var(--color-positive)' : 'var(--color-negative)' }}
          >
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isUp ? '+' : ''}{product.changePct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function CollectionPage() {
  const [view,      setView]      = useState<ViewMode>('grid')
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState<SortKey>('value')
  const [cond,      setCond]      = useState<FilterCond>('ALL')
  const [tabFilter, setTabFilter] = useState<TabFilter>('tout')

  // Source de données — Supabase si configuré, mocks sinon
  const { cards: rawCards, sealed: rawSealed, isLoading, isDemo } = useCollectionData()

  // Adapter les rows au format MockCard pour compat avec les composants existants
  const allCards = useMemo(() => rawCards.map(rowToMockCard), [rawCards])
  const allSealed = useMemo(() => rawSealed.map(rowToMockSealed), [rawSealed])

  const cards = useMemo<MockCard[]>(() => {
    let list = [...allCards]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.set.toLowerCase().includes(q))
    }
    if (cond !== 'ALL') list = list.filter(c => c.condition === cond)
    list.sort((a, b) => {
      switch (sort) {
        case 'name':   return a.name.localeCompare(b.name)
        case 'value':  return b.value - a.value
        case 'pnl':    return (b.value - b.purchasePrice) - (a.value - a.purchasePrice)
        case 'pnlPct': return b.changePct - a.changePct
        default:       return 0
      }
    })
    return list
  }, [allCards, search, cond, sort])

  const sealed = useMemo<MockSealedProduct[]>(() => {
    if (!search.trim()) return allSealed
    const q = search.toLowerCase()
    return allSealed.filter(s => s.name.toLowerCase().includes(q) || s.set.toLowerCase().includes(q))
  }, [allSealed, search])

  const showCards  = tabFilter === 'tout' || tabFilter === 'cartes'
  const showSealed = tabFilter === 'tout' || tabFilter === 'scelles'
  const isEmpty    = (showCards ? cards.length : 0) + (showSealed ? sealed.length : 0) === 0

  return (
    <div className="flex flex-col h-full page-enter">

      {/* ── HEADER ── */}
      <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-7 pb-5">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[1.3px]" style={{ color: 'var(--color-text-muted)' }}>
                Portefeuille
              </p>
              {isDemo && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'var(--color-warning-soft)',
                    color: 'var(--color-warning)',
                    border: '1px solid rgba(245,166,35,0.25)',
                  }}
                  title="Supabase non configuré — données mockées"
                >
                  <Database size={9} />
                  Mode démo
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-bold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Ma collection
            </h1>
            <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {isLoading ? 'Chargement…' : `${cards.length} cartes · ${sealed.length} produits scellés`}
            </p>
          </div>
          {isLoading && <Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-brand)' }} />}
        </div>

        <StatsStrip cards={cards} sealed={sealed} />

        {/* Contrôles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="w-full h-9 pl-8 pr-8 rounded-[var(--radius-sm)] border text-[13px] outline-none"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"><X size={12} style={{ color: 'var(--color-text-muted)' }} /></button>}
          </div>

          {/* Filtre type */}
          <div className="flex items-center gap-1">
            {(['tout', 'cartes', 'scelles'] as TabFilter[]).map(t => (
              <button key={t} onClick={() => setTabFilter(t)}
                className="h-8 px-2.5 rounded-[var(--radius-sm)] text-[11px] font-semibold border capitalize transition-all duration-150"
                style={{
                  background:  tabFilter === t ? 'var(--color-brand)' : 'var(--color-bg-glass)',
                  borderColor: tabFilter === t ? 'var(--color-brand)' : 'var(--color-border)',
                  color:       tabFilter === t ? 'white'               : 'var(--color-text-muted)',
                }}
              >
                {t === 'scelles' ? 'Scellés' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Filtre condition (cartes uniquement) */}
          {showCards && (
            <div className="flex items-center gap-1">
              {(['ALL', 'NM', 'EX', 'GD', 'PL', 'PO'] as FilterCond[]).map(c => (
                <button key={c} onClick={() => setCond(c)}
                  className="h-8 px-2 rounded-[var(--radius-sm)] text-[11px] font-semibold border transition-all duration-150"
                  style={{
                    background:  cond === c ? 'var(--color-brand)' : 'var(--color-bg-glass)',
                    borderColor: cond === c ? 'var(--color-brand)' : 'var(--color-border)',
                    color:       cond === c ? 'white'               : 'var(--color-text-muted)',
                  }}
                >
                  {c === 'ALL' ? 'Tout' : c}
                </button>
              ))}
            </div>
          )}

          {/* Tri + vue */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal size={13} style={{ color: 'var(--color-text-muted)' }} />
            <div className="relative">
              <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
                className="h-8 pl-2.5 pr-7 rounded-[var(--radius-sm)] border text-[12px] outline-none appearance-none transition-all duration-150"
                style={{
                  background: 'var(--color-bg-glass)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border-strong)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-brand-soft)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="value" style={{ background: '#0B0F1A' }}>Valeur ↓</option>
                <option value="pnl"   style={{ background: '#0B0F1A' }}>P&L ↓</option>
                <option value="pnlPct" style={{ background: '#0B0F1A' }}>% Gain ↓</option>
                <option value="name"  style={{ background: '#0B0F1A' }}>Nom A→Z</option>
              </select>
              {/* Chevron custom */}
              <svg
                className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="10" height="6" viewBox="0 0 10 6" fill="none"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="flex items-center rounded-[var(--radius-sm)] border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              {(['grid', 'list'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="w-9 h-8 flex items-center justify-center transition-colors duration-150"
                  style={{ background: view === v ? 'var(--color-brand)' : 'var(--color-bg-glass)', color: view === v ? 'white' : 'var(--color-text-muted)' }}
                >
                  {v === 'grid' ? <LayoutGrid size={14} /> : <List size={14} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENU ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5">
        {isEmpty ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-glass-hi)' }}>
              <Package size={24} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>Aucun résultat</p>
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                {search ? `Aucun résultat pour "${search}"` : 'Ajoute ta première carte ou ton premier scellé !'}
              </p>
            </div>
            {!search && (
              <Link href="/add" className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white" style={{ background: 'var(--color-brand)' }}>
                <Plus size={14} />Ajouter
              </Link>
            )}
          </div>
        ) : view === 'grid' ? (
          <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))' }}>
            {showCards  && cards.map(c => <CollectionCard key={c.id} card={c} />)}
            {showSealed && sealed.map(s => <SealedCard key={s.id} product={s} />)}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Section cartes */}
            {showCards && cards.length > 0 && (
              <>
                {tabFilter === 'tout' && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 mt-1 px-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                    Cartes ({cards.length})
                  </p>
                )}
                {cards.map(c => <CollectionRow key={c.id} card={c} />)}
              </>
            )}
            {/* Section scellés */}
            {showSealed && sealed.length > 0 && (
              <>
                {tabFilter === 'tout' && (
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-1 mt-4 px-1" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                    Scellés ({sealed.length})
                  </p>
                )}
                {sealed.map(s => <SealedRow key={s.id} product={s} />)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
