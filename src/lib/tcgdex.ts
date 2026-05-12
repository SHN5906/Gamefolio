import { env } from '@/constants/env'
import type { TCGdexCard, TCGdexSet } from '@/types/api'

const BASE = env.tcgdex.baseUrl

async function fetcher<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 3600 }, // cache 1h côté Next.js
  })
  if (!res.ok) throw new Error(`TCGdex ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/** Recherche de cartes par nom (param `q`) */
export async function searchCards(query: string, lang = 'fr'): Promise<TCGdexCard[]> {
  return fetcher<TCGdexCard[]>(`/${lang}/cards?name=${encodeURIComponent(query)}`)
}

/** Récupère une carte par son ID */
export async function getCard(id: string, lang = 'fr'): Promise<TCGdexCard> {
  return fetcher<TCGdexCard>(`/${lang}/cards/${id}`)
}

/** Liste tous les sets */
export async function getSets(lang = 'fr'): Promise<TCGdexSet[]> {
  return fetcher<TCGdexSet[]>(`/${lang}/sets`)
}

/** Cartes d'un set */
export async function getSetCards(setId: string, lang = 'fr'): Promise<TCGdexCard[]> {
  return fetcher<TCGdexCard[]>(`/${lang}/sets/${setId}/cards`)
}
