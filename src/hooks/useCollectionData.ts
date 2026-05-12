'use client'

// Hook hybride : retourne les données Supabase si configuré, sinon les mocks.
// Les prix Cardmarket sont fetchés en live depuis /api/prices (pokemontcg.io)
// et fusionnés avec les données de la collection.

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { env } from '@/constants/env'
import { fetchUserCards, type UserCardRow } from '@/lib/data/cards'
import { fetchUserSealed, type SealedRow } from '@/lib/data/sealed'
import { MOCK_CARDS, MOCK_SEALED, type MockCard, type MockSealedProduct } from '@/lib/mock'
import { useLivePrices } from './useLivePrices'

// ── Adapteurs : transforment mocks → format UserCardRow / SealedRow ──

function mockToUserCardRow(c: MockCard): UserCardRow {
  return {
    id:                  c.id,
    user_id:             'demo',
    card_id:             c.id,
    language:            'fr',
    variant:             'normal',
    condition:           c.condition,
    graded:              c.grade !== null,
    grade:               c.grade,
    quantity:            1,
    purchase_price_eur:  c.purchasePrice,
    purchase_date:       null,
    notes:               null,
    is_for_sale:         false,
    name_fr:             c.name,
    name_en:             c.name,
    set_name_fr:         c.set,
    set_name_en:         c.set,
    catalog_number:      c.number,
    rarity:              null,
    image_url_low:       c.imageUrl ?? null,
    image_url_high:      c.imageUrl ?? null,
    types:               [c.energy],
    current_price_eur:   c.value,
  }
}

function mockToSealedRow(s: MockSealedProduct): SealedRow {
  return {
    id:                 s.id,
    user_id:            'demo',
    name:               s.name,
    type:               s.type,
    set_name:           s.set,
    language:           s.language as 'fr',
    state:              s.condition,
    quantity:           s.quantity,
    purchase_price_eur: s.purchasePrice,
    current_value_eur:  s.value,
    purchase_date:      null,
    notes:              null,
    image_url:          s.imageUrl ?? null,
    created_at:         new Date().toISOString(),
  }
}

// ── Hook principal ──────────────────────────────────────────────────
export function useCollectionData() {
  const cardsQuery = useQuery<UserCardRow[]>({
    queryKey: ['user-cards'],
    queryFn: async () => {
      if (env.isDemoMode) return MOCK_CARDS.map(mockToUserCardRow)
      return fetchUserCards()
    },
    staleTime: 30_000,
  })

  const sealedQuery = useQuery<SealedRow[]>({
    queryKey: ['user-sealed'],
    queryFn: async () => {
      if (env.isDemoMode) return MOCK_SEALED.map(mockToSealedRow)
      return fetchUserSealed()
    },
    staleTime: 30_000,
  })

  // IDs TCGdex pour fetch les prix live (= card_id dans card_catalog = tcgdex_id)
  const tcgdexIds = useMemo(() => {
    if (env.isDemoMode) return []
    return (cardsQuery.data ?? []).map(c => c.card_id).filter(Boolean)
  }, [cardsQuery.data])

  // Prix live depuis Cardmarket via pokemontcg.io
  const { data: livePrices, isLoading: pricesLoading } = useLivePrices(tcgdexIds)

  // Fusionner les prix live avec les cartes
  const cardsWithPrices = useMemo<UserCardRow[]>(() => {
    const cards = cardsQuery.data ?? []
    if (!livePrices || env.isDemoMode) return cards

    return cards.map(card => ({
      ...card,
      // Prix live Cardmarket en priorité, fallback sur prix DB
      current_price_eur: livePrices[card.card_id] ?? card.current_price_eur ?? 0,
    }))
  }, [cardsQuery.data, livePrices])

  return {
    cards:      cardsWithPrices,
    sealed:     sealedQuery.data ?? [],
    isLoading:  cardsQuery.isLoading || sealedQuery.isLoading || pricesLoading,
    isDemo:     env.isDemoMode,
    error:      cardsQuery.error || sealedQuery.error,
  }
}
