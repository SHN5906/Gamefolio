'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Heart, Plus, Bell, BellOff, Trash2, Search, X,
  TrendingDown, TrendingUp, Target, SlidersHorizontal,
  ChevronDown, ChevronUp, AlertTriangle, Check, Database, Loader2
} from 'lucide-react'
import {
  type MockWishItem, type WishPriority
} from '@/lib/mock'
import { useWishlistData } from '@/hooks/useWishlistData'
import { useDeleteWishlistItem } from '@/hooks/useWishlist'
import { env } from '@/constants/env'
import { useConfirm } from '@/components/ui/ConfirmModal'
import { toast } from '@/components/ui/Toaster'
import type { WishlistRow } from '@/lib/data/wishlist'
import { energyColors, type EnergyType } from '@/constants/theme'

// Adapter pour réutiliser le rendu existant qui attend MockWishItem
function rowToMockWish(r: WishlistRow): MockWishItem {
  return {
    id:           r.id,
    name:         r.name_fr ?? r.name_en ?? 'Carte',
    set:          r.set_name_fr ?? r.set_name_en ?? '—',
    number:       r.catalog_number ?? '',
    energy:       'colorless' as EnergyType,
    currentPrice: r.current_price_eur ?? 0,
    targetPrice:  r.target_price_eur,
    maxPrice:     r.max_price_eur,
    priority:     r.priority,
    notes:        r.notes,
    addedAt:      r.created_at,
    tcgdexImage:  r.image_url_low,
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtEur(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

const PRIORITY_CONFIG: Record<WishPriority, { label: string; color: string; bg: string; dot: string }> = {
  urgent:   { label: 'Urgent',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   dot: '#EF4444' },
  want:     { label: 'Je veux',   color: '#FFCC00', bg: 'rgba(255,204,0,0.12)',   dot: '#FFCC00' },
  watching: { label: 'Surveille', color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', dot: '#94A3B8' },
}

type SortKey = 'priority' | 'price_asc' | 'price_desc' | 'gap' | 'name'

// ── Stat d'en-tête ────────────────────────────────────────────────
function WishlistStats({ items }: { items: MockWishItem[] }) {
  const totalBudget   = items.reduce((s, i) => s + (i.maxPrice ?? i.currentPrice), 0)
  const urgentCount   = items.filter(i => i.priority === 'urgent').length
  const alertCount    = items.filter(i => i.targetPrice !== null && i.currentPrice <= (i.targetPrice ?? 0) * 1.05).length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mb-6">
      {[
        { label: 'Articles suivis',  value: items.length.toString(),  sub: `${urgentCount} urgent${urgentCount > 1 ? 's' : ''}`, mono: false },
        { label: 'Budget estimé',    value: fmtEur(totalBudget),      sub: 'budget max total',                                    mono: true  },
        { label: 'Alertes proches',  value: alertCount.toString(),    sub: 'dans les 5% du seuil',                                mono: false, alert: alertCount > 0 },
      ].map(({ label, value, sub, mono, alert }) => (
        <div key={label}
          className="rounded-[var(--radius-md)] border px-4 py-3"
          style={{ background: alert ? 'rgba(255,204,0,0.06)' : 'var(--color-bg-glass)', borderColor: alert ? 'rgba(255,204,0,0.3)' : 'var(--color-border)' }}
        >
          <p className="text-[11px] mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
          <p className="text-[18px] font-bold tracking-tight leading-none"
            style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)', color: alert ? '#FFCC00' : 'var(--color-text-primary)' }}
          >{value}</p>
          <p className="text-[11px] mt-0.5" style={{ color: alert ? '#FFCC00' : 'var(--color-text-muted)' }}>{sub}</p>
        </div>
      ))}
    </div>
  )
}

// ── Card wishlist ─────────────────────────────────────────────────
function WishCard({
  item, onDelete, expanded, onToggle
}: {
  item: MockWishItem
  onDelete: (id: string) => void
  expanded: boolean
  onToggle: () => void
}) {
  const ec       = energyColors[item.energy] ?? energyColors.colorless
  const cfg      = PRIORITY_CONFIG[item.priority]
  const hasAlert = item.targetPrice !== null
  const isNearTarget = hasAlert && item.currentPrice <= (item.targetPrice ?? 0) * 1.05
  const gap      = item.maxPrice ? item.currentPrice - item.maxPrice : null
  const gapPct   = item.maxPrice ? ((item.currentPrice - item.maxPrice) / item.maxPrice) * 100 : null
  const isPricedOk = gap !== null && gap <= 0

  return (
    <div
      className="rounded-[var(--radius-md)] border overflow-hidden transition-all duration-200"
      style={{
        borderColor:    isNearTarget ? 'rgba(255,204,0,0.4)' : 'var(--color-border)',
        background:     'var(--color-bg-glass)',
        backdropFilter: 'blur(16px)',
        boxShadow:      isNearTarget ? '0 0 16px rgba(255,204,0,0.08)' : 'none',
      }}
    >
      {/* Alerte prix proche */}
      {isNearTarget && (
        <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-semibold border-b"
          style={{ background: 'rgba(255,204,0,0.08)', borderColor: 'rgba(255,204,0,0.2)', color: '#FFCC00' }}
        >
          <AlertTriangle size={12} />
          Prix proche de ton seuil d&apos;alerte — maintenant à {fmtEur(item.currentPrice)} !
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-3">
        {/* Mini card art */}
        <div className="w-10 h-14 rounded flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ background: `linear-gradient(140deg, ${ec.from}, ${ec.via}, ${ec.to})` }}
        >
          <span className="text-[10px] font-bold text-white/30 uppercase" style={{ fontFamily: 'var(--font-display)' }}>
            {item.energy[0].toUpperCase()}
          </span>
        </div>

        {/* Infos principales */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}>
              {item.name}
            </p>
            {/* Badge priorité */}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
            {item.set} · {item.number}
          </p>
        </div>

        {/* Prix actuel */}
        <div className="text-right flex-shrink-0">
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Prix actuel</p>
          <p className="text-[14px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
            {fmtEur(item.currentPrice)}
          </p>
        </div>

        {/* Budget max vs prix → gap */}
        {item.maxPrice && (
          <div className="text-right flex-shrink-0 w-28">
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Budget max</p>
            <p className="text-[13px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: isPricedOk ? 'var(--color-positive)' : 'var(--color-negative)' }}>
              {fmtEur(item.maxPrice)}
            </p>
            <p className="text-[10px] flex items-center justify-end gap-0.5"
              style={{ color: isPricedOk ? 'var(--color-positive)' : 'var(--color-negative)' }}
            >
              {isPricedOk
                ? <><Check size={9} />Dans le budget</>
                : <><TrendingUp size={9} />+{gap?.toFixed(2)} €</>
              }
            </p>
          </div>
        )}

        {/* Alerte seuil */}
        <div className="flex-shrink-0 w-28 text-right">
          <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>Seuil alerte</p>
          {item.targetPrice ? (
            <p className="text-[13px] font-bold flex items-center justify-end gap-1"
              style={{ fontFamily: 'var(--font-mono)', color: isNearTarget ? '#FFCC00' : 'var(--color-text-secondary)' }}
            >
              <Bell size={10} />
              {fmtEur(item.targetPrice)}
            </p>
          ) : (
            <p className="text-[11px] flex items-center justify-end gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <BellOff size={10} />
              Aucune
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggle}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors hover:bg-[var(--color-bg-glass-hi)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={() => onDelete(item.id)}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors hover:bg-[rgba(239,68,68,0.1)] hover:border-[rgba(239,68,68,0.3)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Détails expandables */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <div className="pt-3 flex flex-col gap-3">
            {/* Barre de progression prix */}
            {item.maxPrice && (
              <div>
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
                  <span>Progression vers budget</span>
                  <span>{Math.min(100, Math.round((item.maxPrice / item.currentPrice) * 100))}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-glass-hi)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (item.maxPrice / item.currentPrice) * 100)}%`,
                      background: isPricedOk ? 'var(--color-positive)' : `linear-gradient(90deg, var(--color-brand), #EF4444)`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Alerte seuil éditable */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                  Seuil d&apos;alerte (€)
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={item.targetPrice ?? ''}
                    placeholder="ex: 150"
                    className="flex-1 h-8 px-3 rounded-[var(--radius-sm)] border text-[12px] outline-none"
                    style={{ background: 'var(--color-bg-glass-hi)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  />
                  <button className="h-8 px-2.5 rounded-[var(--radius-sm)] text-[11px] font-semibold text-white transition-all"
                    style={{ background: 'var(--color-brand)' }}
                  >
                    <Bell size={12} />
                  </button>
                </div>
              </div>

              {/* Priorité */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>
                  Priorité
                </p>
                <div className="flex gap-1.5">
                  {(Object.entries(PRIORITY_CONFIG) as [WishPriority, typeof PRIORITY_CONFIG[WishPriority]][]).map(([key, cfg]) => (
                    <button key={key}
                      className="h-8 px-2.5 rounded-[var(--radius-sm)] text-[11px] font-semibold border transition-all"
                      style={{
                        background:  item.priority === key ? cfg.bg : 'var(--color-bg-glass)',
                        borderColor: item.priority === key ? cfg.color : 'var(--color-border)',
                        color:       item.priority === key ? cfg.color : 'var(--color-text-muted)',
                      }}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {item.notes && (
              <p className="text-[12px] px-3 py-2 rounded-[var(--radius-sm)]"
                style={{ background: 'var(--color-bg-glass-hi)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}
              >
                &ldquo;{item.notes}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function WishlistPage() {
  const { items: rawItems, isLoading, isDemo } = useWishlistData()
  const [search,   setSearch]   = useState('')
  const [sort,     setSort]     = useState<SortKey>('priority')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // Adapter rows → MockWishItem (compat avec le rendu existant)
  const items = useMemo(
    () => rawItems.map(rowToMockWish).filter(i => !deletedIds.has(i.id)),
    [rawItems, deletedIds]
  )

  // Filtrage + tri
  const filtered = useMemo(() => {
    let list = [...items]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.set.toLowerCase().includes(q))
    }
    const PRIO_ORDER: Record<WishPriority, number> = { urgent: 0, want: 1, watching: 2 }
    list.sort((a, b) => {
      switch (sort) {
        case 'priority':   return PRIO_ORDER[a.priority] - PRIO_ORDER[b.priority]
        case 'price_asc':  return a.currentPrice - b.currentPrice
        case 'price_desc': return b.currentPrice - a.currentPrice
        case 'gap': {
          const gA = a.maxPrice ? a.currentPrice - a.maxPrice : 999999
          const gB = b.maxPrice ? b.currentPrice - b.maxPrice : 999999
          return gA - gB
        }
        case 'name': return a.name.localeCompare(b.name)
        default: return 0
      }
    })
    return list
  }, [items, search, sort])

  const deleteMutation = useDeleteWishlistItem()
  const confirm = useConfirm()
  async function handleDelete(id: string) {
    const item = items.find(i => i.id === id)
    const name = item?.name ?? 'cette carte'

    const ok = await confirm({
      title: 'Retirer de la wishlist ?',
      message: `${name} sera retirée de ta liste. Tu pourras toujours l'ajouter à nouveau.`,
      confirmText: 'Retirer',
      danger: true,
    })
    if (!ok) return

    // Optimistic delete
    setDeletedIds(prev => new Set(prev).add(id))
    toast.success('Retirée de ta wishlist', name)

    // Real delete en prod (le mode démo ne persiste pas)
    if (!env.isDemoMode) {
      deleteMutation.mutate(id, {
        onError: () => {
          setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next })
          toast.error('Suppression échouée', 'On a remis l\'article dans ta liste.')
        },
      })
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── HEADER ── */}
      <div className="px-4 sm:px-6 md:px-8 pt-6 md:pt-7 pb-5">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-[1.3px] flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                <Heart size={11} fill="currentColor" style={{ color: 'var(--color-pink)' }} />
                Cartes surveillées
              </p>
              {isDemo && (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)', border: '1px solid rgba(245,166,35,0.25)' }}
                >
                  <Database size={9} />
                  Mode démo
                </span>
              )}
            </div>
            <h1 className="text-[28px] font-bold tracking-tight leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Ma wishlist
            </h1>
            <p className="text-[12px] mt-2" style={{ color: 'var(--color-text-secondary)' }}>
              {isLoading ? 'Chargement…' : `${items.length} article${items.length > 1 ? 's' : ''} suivi${items.length > 1 ? 's' : ''} avec alertes prix`}
            </p>
          </div>

          {/* Bouton ajouter */}
          <Link href="/wishlist/add"
            className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white transition-all hover:-translate-y-px"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 20px var(--color-brand-glow)' }}
          >
            <Plus size={14} />Ajouter
          </Link>
        </div>

        {/* Stats */}
        <WishlistStats items={filtered} />

        {/* Contrôles */}
        <div className="flex items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
              className="w-full h-9 pl-8 pr-8 rounded-[var(--radius-sm)] border text-[13px] outline-none"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"><X size={12} style={{ color: 'var(--color-text-muted)' }} /></button>}
          </div>

          {/* Filtre priorité rapide */}
          <div className="flex items-center gap-1">
            {(Object.entries(PRIORITY_CONFIG) as [WishPriority, typeof PRIORITY_CONFIG[WishPriority]][]).map(([key, cfg]) => {
              const count = items.filter(i => i.priority === key).length
              return (
                <button key={key}
                  className="h-8 px-2.5 rounded-[var(--radius-sm)] text-[11px] font-semibold border flex items-center gap-1.5 transition-all"
                  style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
                  {cfg.label}
                  <span className="text-[9px] opacity-60">({count})</span>
                </button>
              )
            })}
          </div>

          {/* Tri */}
          <div className="flex items-center gap-1.5 ml-auto">
            <SlidersHorizontal size={13} style={{ color: 'var(--color-text-muted)' }} />
            <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
              className="h-8 px-2 pr-6 rounded-[var(--radius-sm)] border text-[12px] outline-none appearance-none"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <option value="priority">Priorité</option>
              <option value="price_asc">Prix ↑</option>
              <option value="price_desc">Prix ↓</option>
              <option value="gap">Écart budget</option>
              <option value="name">Nom A→Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── LISTE ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-glass-hi)' }}>
              <Heart size={24} style={{ color: 'var(--color-text-muted)' }} />
            </div>
            <div>
              <p className="text-[15px] font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                {search ? `Aucun résultat pour "${search}"` : 'Ta wishlist est vide'}
              </p>
              <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Ajoute des cartes à surveiller et configure des alertes de prix.
              </p>
            </div>
            {!search && (
              <Link href="/wishlist/add"
                className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-semibold text-white"
                style={{ background: 'var(--color-brand)' }}
              >
                <Plus size={14} />Ajouter une carte
              </Link>
            )}
          </div>
        ) : (
          /* Groupé par priorité */
          <>
            {(['urgent', 'want', 'watching'] as WishPriority[]).map(prio => {
              const group = filtered.filter(i => i.priority === prio)
              if (group.length === 0) return null
              const cfg = PRIORITY_CONFIG[prio]
              return (
                <div key={prio} className="mb-6">
                  {/* Séparateur de groupe */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2 h-2 rounded-full" style={{ background: cfg.dot }} />
                    <p className="text-[11px] font-semibold uppercase tracking-widest"
                      style={{ color: cfg.color, fontFamily: 'var(--font-display)' }}
                    >
                      {cfg.label} ({group.length})
                    </p>
                    <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
                  </div>

                  <div className="flex flex-col gap-2">
                    {group.map(item => (
                      <WishCard
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        expanded={expanded === item.id}
                        onToggle={() => setExpanded(prev => prev === item.id ? null : item.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
