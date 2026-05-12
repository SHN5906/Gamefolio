'use client'

import { useQueries, useQuery } from '@tanstack/react-query'
import type { GameCard } from '@/types/game'

export interface TCGdexCardData {
  id: string
  localId: string
  name: string
  image?: string
  rarity?: string
  hp?: number
  category?: string
  set?: {
    id: string
    name: string
  }
}

const STALE_24H = 24 * 60 * 60 * 1000
const GC_7D = 7 * 24 * 60 * 60 * 1000

async function fetchCard(id: string): Promise<TCGdexCardData> {
  // cache: 'force-cache' permet au navigateur de réutiliser la réponse HTTP entre hard refreshes
  const res = await fetch(`https://api.tcgdex.net/v2/fr/cards/${id}`, { cache: 'force-cache' })
  if (res.ok) return res.json()
  // Fallback EN si pas de version FR
  const enRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${id}`, { cache: 'force-cache' })
  if (!enRes.ok) {
    const err = new Error(`Card ${id} not found`) as Error & { status: number }
    err.status = enRes.status
    throw err
  }
  return enRes.json()
}

// 404 = la carte n'existe pas, inutile de retry
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as { status?: number })?.status
  if (status === 404) return false
  return failureCount < 1
}

/** Récupère une seule carte TCGdex avec cache 24h. */
export function useTCGdexCard(id: string | null | undefined) {
  return useQuery({
    queryKey: ['tcgdex-card', id],
    queryFn: () => fetchCard(id!),
    enabled: !!id,
    staleTime: STALE_24H,
    gcTime: GC_7D,
    retry: shouldRetry,
  })
}

/** Récupère plusieurs cartes en batch (préfetch un pool entier). */
export function useTCGdexCards(ids: string[]) {
  return useQueries({
    queries: ids.map(id => ({
      queryKey: ['tcgdex-card', id],
      queryFn: () => fetchCard(id),
      staleTime: STALE_24H,
      gcTime: GC_7D,
      retry: shouldRetry,
    })),
  })
}

/** Construit l'URL d'une image TCGdex à partir de son champ `image`. */
export function tcgdexImageUrl(
  card: TCGdexCardData | undefined | null,
  quality: 'low' | 'high' = 'high',
  ext: 'webp' | 'png' | 'jpg' = 'webp'
): string | null {
  if (!card?.image) return null
  return `${card.image}/${quality}.${ext}`
}

interface EnrichedCard {
  imageUrl: string | null
  displayName: string
  setName: string
  localId: string
  isLoading: boolean
}

/**
 * Hook DRY qui combine card statique + données TCGdex.
 * Source unique de vérité : si TCGdex répond, on utilise ses données.
 * Sinon, fallback sur les données statiques (qui peuvent être null/incomplètes).
 */
export function useEnrichedCard(card: GameCard, quality: 'low' | 'high' = 'high'): EnrichedCard {
  const { data: tcgCard, isLoading } = useTCGdexCard(card.id)
  return {
    imageUrl: tcgdexImageUrl(tcgCard, quality) ?? card.imageUrl,
    displayName: tcgCard?.name ?? card.nameFr,
    setName: tcgCard?.set?.name ?? card.setFr,
    localId: tcgCard?.localId ?? card.number,
    isLoading,
  }
}
