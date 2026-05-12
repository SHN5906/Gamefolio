'use client'

import { useQuery } from '@tanstack/react-query'
import { useDebounce } from './useDebounce'

// Structure réelle retournée par TCGdex /v2/fr/cards?name=...
export interface TCGCard {
  id:       string   // ex: "cel25-5" (setId-localId)
  localId:  string   // ex: "5"
  name:     string   // ex: "Pikachu"
  image?:   string   // URL de base — on ajoute "/high.webp" pour l'image HD
                     // ex: "https://assets.tcgdex.net/fr/swsh/cel25/5"
}

/** Extrait le nom du set depuis l'id de la carte (ex: "cel25-5" → "cel25") */
export function getSetIdFromCard(card: TCGCard): string {
  const parts = card.id.split('-')
  parts.pop()   // enlève le localId
  return parts.join('-')
}

async function searchCards(query: string): Promise<TCGCard[]> {
  if (!query.trim()) return []

  // ⚠️ TCGdex ne supporte pas orderBy/orderDir dans /cards — on enlève ces params
  const res = await fetch(
    `https://api.tcgdex.net/v2/fr/cards?name=${encodeURIComponent(query)}`
  )

  if (!res.ok) throw new Error(`TCGdex error ${res.status}`)
  const data = await res.json()

  // L'API retourne directement un tableau
  return Array.isArray(data) ? data : []
}

export function useCardSearch(query: string) {
  const debouncedQuery = useDebounce(query, 350)

  return useQuery({
    queryKey:  ['card-search', debouncedQuery],
    queryFn:   () => searchCards(debouncedQuery),
    enabled:   debouncedQuery.length >= 2,   // on attend au moins 2 caractères
    staleTime: 60_000,                        // résultats frais 1 min
    placeholderData: (prev) => prev,          // garde les anciens résultats pendant la recherche
  })
}
