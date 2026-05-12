'use client'

// Hook qui fetche les prix Cardmarket live pour une liste de cartes
// via /api/prices (pokemontcg.io, clé serveur, cache 1h)

import { useQuery } from '@tanstack/react-query'

async function fetchLivePrices(tcgdexIds: string[]): Promise<Record<string, number>> {
  if (tcgdexIds.length === 0) return {}
  const ids = tcgdexIds.join(',')
  const res = await fetch(`/api/prices?ids=${encodeURIComponent(ids)}`)
  if (!res.ok) return {}
  return res.json()
}

export function useLivePrices(tcgdexIds: string[]) {
  // On crée une clé stable basée sur les IDs triés
  const key = [...tcgdexIds].sort().join(',')

  return useQuery<Record<string, number>>({
    queryKey: ['live-prices', key],
    queryFn:  () => fetchLivePrices(tcgdexIds),
    enabled:  tcgdexIds.length > 0,
    staleTime: 60 * 60 * 1000, // 1h — les prix Cardmarket changent peu en 1h
    gcTime:    2 * 60 * 60 * 1000,
  })
}
