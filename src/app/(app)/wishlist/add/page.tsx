'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, X, Bell, Target, Heart, Check } from 'lucide-react'
import { useCardSearch, getSetIdFromCard, type TCGCard } from '@/hooks/useCardSearch'
import { CardSearchResult } from '@/components/cards/CardSearchResult'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { WishPriority } from '@/lib/mock'

const PRIORITY_CONFIG = {
  urgent:   { label: 'Urgent',    desc: 'Je cherche activement', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  want:     { label: 'Je veux',   desc: 'Dans mes plans',        color: '#FFCC00', bg: 'rgba(255,204,0,0.12)' },
  watching: { label: 'Surveille', desc: 'Je garde un œil',       color: '#94A3B8', bg: 'rgba(148,163,184,0.10)' },
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-medium border transition-all duration-150"
      style={{
        background:  active ? 'var(--color-brand)' : 'var(--color-bg-glass)',
        borderColor: active ? 'var(--color-brand)' : 'var(--color-border)',
        color:       active ? 'white'               : 'var(--color-text-secondary)',
        boxShadow:   active ? '0 0 12px var(--color-brand-glow)' : 'none',
      }}
    >{children}</button>
  )
}

// ── Étape 1 : Recherche ───────────────────────────────────────────
function SearchStep({ onSelect }: { onSelect: (card: TCGCard) => void }) {
  const [query, setQuery] = useState('')
  const { data, isLoading, isFetching } = useCardSearch(query)
  const results      = data ?? []
  const showSkeleton = (isLoading || isFetching) && query.length >= 2

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-6 pb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Recherche la carte à surveiller…"
            autoFocus
            className="w-full h-10 pl-9 pr-9 rounded-[var(--radius-sm)] border text-[14px] outline-none"
            style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
          {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100"><X size={14} style={{ color: 'var(--color-text-muted)' }} /></button>}
        </div>
        {results.length > 0 && !showSkeleton && (
          <p className="text-[11px] mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {results.length} résultat{results.length > 1 ? 's' : ''} — clique pour configurer une alerte
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-5">
        {query.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-glass-hi)' }}>
              <Bell size={20} style={{ color: 'var(--color-brand)' }} />
            </div>
            <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              Tape un nom pour trouver une carte à ajouter à ta wishlist.
            </p>
          </div>
        ) : showSkeleton ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col rounded-[var(--radius-md)] overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                <Skeleton className="w-full aspect-[2.5/3.5]" />
                <div className="p-2 flex flex-col gap-1.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {results.map(card => <CardSearchResult key={card.id} card={card} onAdd={onSelect} />)}
          </div>
        ) : (
          <p className="text-center text-[13px] py-12" style={{ color: 'var(--color-text-muted)' }}>
            Aucun résultat pour &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}

// ── Étape 2 : Config alerte ───────────────────────────────────────
function AlertStep({ card, onSave, onBack }: { card: TCGCard; onSave: () => void; onBack: () => void }) {
  const [priority,    setPriority]    = useState<WishPriority>('want')
  const [targetPrice, setTargetPrice] = useState('')
  const [maxPrice,    setMaxPrice]    = useState('')
  const [notes,       setNotes]       = useState('')
  const [saved,       setSaved]       = useState(false)
  const setId = getSetIdFromCard(card)

  async function handleSave() {
    // Mode démo — simule un save
    await new Promise(r => setTimeout(r, 400))
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(26,111,255,0.12)' }}>
          <Heart size={28} style={{ color: 'var(--color-brand)' }} fill="currentColor" />
        </div>
        <div className="text-center">
          <p className="text-[20px] font-bold tracking-tight mb-1" style={{ fontFamily: 'var(--font-display)' }}>Ajoutée à ta wishlist !</p>
          <p className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            {card.name} est maintenant surveillée.{targetPrice ? ` Tu seras alerté sous ${targetPrice} €.` : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" onClick={onBack} style={{ background: 'var(--color-bg-glass-hi)', color: 'var(--color-text-primary)' }}>
            Ajouter une autre
          </Button>
          <Button type="button" onClick={onSave}>Voir ma wishlist</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 pb-8">
      <div className="max-w-lg flex flex-col gap-5">

        {/* Carte sélectionnée */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}>
          <div className="w-8 h-11 rounded flex-shrink-0" style={{ background: 'linear-gradient(140deg, var(--color-brand), #00C3FF)' }} />
          <div>
            <p className="text-[13px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{card.name}</p>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{setId}</p>
          </div>
          <button onClick={onBack} className="ml-auto text-[11px] flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
            <X size={11} />Changer
          </button>
        </div>

        {/* Priorité */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>Priorité</p>
          <div className="flex gap-2">
            {(Object.entries(PRIORITY_CONFIG) as [WishPriority, typeof PRIORITY_CONFIG[WishPriority]][]).map(([key, cfg]) => (
              <button key={key} type="button" onClick={() => setPriority(key)}
                className="flex-1 py-2.5 rounded-[var(--radius-sm)] border text-center transition-all"
                style={{
                  background:  priority === key ? cfg.bg      : 'var(--color-bg-glass)',
                  borderColor: priority === key ? cfg.color   : 'var(--color-border)',
                }}
              >
                <p className="text-[12px] font-bold" style={{ color: priority === key ? cfg.color : 'var(--color-text-secondary)' }}>{cfg.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{cfg.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Prix */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              label="Seuil d'alerte (€)"
              type="number"
              placeholder="150.00"
              step="0.01"
              icon={<Bell size={13} />}
              value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Notif quand le prix passe sous ce seuil</p>
          </div>
          <div>
            <Input
              label="Budget max (€)"
              type="number"
              placeholder="160.00"
              step="0.01"
              icon={<Target size={13} />}
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Prix max que tu es prêt à payer</p>
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-display)' }}>Notes</p>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="PSA 10 si possible, version FR uniquement…"
            rows={3}
            className="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-[13px] resize-none outline-none"
            style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
          />
        </div>

        <Button onClick={handleSave} className="w-full justify-center">
          <Heart size={14} fill="currentColor" />
          Ajouter à ma wishlist
        </Button>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────────
export default function WishlistAddPage() {
  const router = useRouter()
  const [selectedCard, setSelectedCard] = useState<TCGCard | null>(null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => selectedCard ? setSelectedCard(null) : router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] border transition-colors"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-glass)' }}
          >
            <ArrowLeft size={14} style={{ color: 'var(--color-text-muted)' }} />
          </button>
          <div>
            <h1 className="text-[17px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {selectedCard ? 'Configurer l\'alerte' : 'Ajouter à la wishlist'}
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {selectedCard ? 'Définis ton budget et ton seuil d\'alerte' : 'Étape 1 : Trouve la carte'}
            </p>
          </div>

          {/* Stepper */}
          <div className="ml-auto flex items-center gap-2">
            {[1, 2].map(step => {
              const active = step === (selectedCard ? 2 : 1)
              const done   = step < (selectedCard ? 2 : 1)
              return (
                <div key={step} className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    style={{
                      background: done ? 'var(--color-positive)' : active ? 'var(--color-brand)' : 'var(--color-bg-glass-hi)',
                      color: done || active ? 'white' : 'var(--color-text-muted)',
                    }}
                  >
                    {done ? <Check size={10} strokeWidth={3} /> : step}
                  </div>
                  {step < 2 && <div className="w-8 h-px" style={{ background: 'var(--color-border)' }} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-h-0 pt-5">
        {selectedCard
          ? <AlertStep card={selectedCard} onSave={() => router.push('/wishlist')} onBack={() => setSelectedCard(null)} />
          : <SearchStep onSelect={setSelectedCard} />
        }
      </div>
    </div>
  )
}
