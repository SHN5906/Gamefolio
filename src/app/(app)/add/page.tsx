'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Sparkles, PackageOpen, CreditCard } from 'lucide-react'
import { useCardSearch, getSetIdFromCard, type TCGCard } from '@/hooks/useCardSearch'
import { CardSearchResult } from '@/components/cards/CardSearchResult'
import { Skeleton } from '@/components/ui/skeleton'
import { SealedForm } from '@/components/sealed/SealedForm'

type Tab = 'cartes' | 'scelles'

// ── Squelettes chargement ─────────────────────────────────────────
function SearchSkeletons() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-[var(--radius-md)] overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <Skeleton className="w-full aspect-[2.5/3.5]" />
          <div className="p-2 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
        </div>
      ))}
    </>
  )
}

// ── État vide / accueil carte ─────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  if (query.length > 0 && query.length < 2) {
    return (
      <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Continue à taper…</p>
      </div>
    )
  }
  if (query.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center gap-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-bg-glass-hi)' }}>
          <Sparkles size={24} style={{ color: 'var(--color-brand)' }} />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Recherche une carte
          </p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            Tape un nom Pokémon pour trouver une carte à ajouter.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="col-span-full flex flex-col items-center gap-2 py-16 text-center">
      <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
        Aucun résultat pour <strong>&ldquo;{query}&rdquo;</strong>
      </p>
    </div>
  )
}

// ── Onglet recherche cartes ───────────────────────────────────────
function CardsTab() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const { data, isLoading, isFetching } = useCardSearch(query)

  const results      = data ?? []
  const showSkeleton = (isLoading || isFetching) && query.length >= 2

  function handleAdd(card: TCGCard) {
    const setId = getSetIdFromCard(card)
    router.push(
      `/add/${encodeURIComponent(card.id)}?name=${encodeURIComponent(card.name)}&set=${encodeURIComponent(setId)}${card.image ? `&img=${encodeURIComponent(card.image)}` : ''}`
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Barre de recherche */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Dracaufeu, Mewtwo, Pikachu…"
            autoFocus
            className="w-full h-10 pl-9 pr-9 rounded-[var(--radius-sm)] border text-[14px] outline-none transition-all duration-150"
            style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity">
              <X size={14} style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
        </div>
        {results.length > 0 && !showSkeleton && (
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Grille */}
      <div className="flex-1 overflow-y-auto px-6 pb-5">
        <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
          {showSkeleton ? (
            <SearchSkeletons />
          ) : results.length > 0 ? (
            results.map(card => <CardSearchResult key={card.id} card={card} onAdd={handleAdd} />)
          ) : (
            <EmptyState query={query} />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function AddPage() {
  const [tab, setTab] = useState<Tab>('cartes')

  const TABS = [
    { key: 'cartes'  as Tab, label: 'Carte',    icon: CreditCard,  desc: 'Ajoute une carte individuelle depuis la base TCGdex' },
    { key: 'scelles' as Tab, label: 'Scellé',   icon: PackageOpen, desc: 'Display, ETB, coffret, blister, tin…' },
  ]

  return (
    <div className="flex flex-col h-full">

      {/* ── HEADER ── */}
      <div className="px-8 pt-7 pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[1.3px] mb-1" style={{ color: 'var(--color-text-muted)' }}>
          Nouvelle entrée
        </p>
        <h1 className="text-[28px] font-bold tracking-tight leading-none mb-4" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
          Ajouter un article
        </h1>

        {/* Onglets */}
        <div className="flex gap-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2 h-9 px-4 rounded-[var(--radius-sm)] border text-[13px] font-semibold transition-all duration-150"
              style={{
                background:  tab === key ? 'var(--color-brand)'  : 'var(--color-bg-glass)',
                borderColor: tab === key ? 'var(--color-brand)'  : 'var(--color-border)',
                color:       tab === key ? 'white'                : 'var(--color-text-muted)',
                boxShadow:   tab === key ? '0 0 16px var(--color-brand-glow)' : 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Sous-titre de l'onglet actif */}
        <p className="text-[12px] mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          {TABS.find(t => t.key === tab)?.desc}
        </p>
      </div>

      {/* ── CONTENU ── */}
      <div className="flex-1 flex flex-col min-h-0 pt-5">
        {tab === 'cartes' ? <CardsTab /> : <SealedForm />}
      </div>
    </div>
  )
}
