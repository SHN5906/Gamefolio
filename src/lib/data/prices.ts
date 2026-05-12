'use server'

// ─────────────────────────────────────────────────────────────────────
//  Prices — server actions pour récupérer les prix Cardmarket en live
//
//  Source principale : pokemontcg.io (agrège les prix officiels
//  Cardmarket quotidiennement, accès gratuit, clé API optionnelle)
//
//  Fallback : TCGdex (si pokemontcg.io ne connaît pas la carte)
// ─────────────────────────────────────────────────────────────────────

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const PTCG_BASE   = 'https://api.pokemontcg.io/v2/cards'
const TCGDEX_BASE = 'https://api.tcgdex.net/v2/fr/cards'

export interface CardMarketPrice {
  trendPrice:         number | null
  averageSellPrice:   number | null
  lowPrice:           number | null
  avg1:               number | null
  avg7:               number | null
  avg30:              number | null
  reverseHoloTrend:   number | null
  reverseHoloSell:    number | null
  source:             'cardmarket' | 'tcgdex'
  updatedAt:          string
}

// ── Fetch depuis pokemontcg.io ──────────────────────────────────────
async function fetchPTCGCardPrice(tcgdexId: string): Promise<CardMarketPrice | null> {
  try {
    const headers: HeadersInit = {}
    const apiKey = process.env.POKEMONTCG_API_KEY
    if (apiKey) (headers as Record<string, string>)['X-Api-Key'] = apiKey

    const res = await fetch(`${PTCG_BASE}/${tcgdexId}`, {
      headers,
      next: { revalidate: 3600 }, // cache 1h côté Next.js
    })
    if (!res.ok) return null

    const { data } = await res.json()
    const cm = data?.cardmarket?.prices
    if (!cm) return null

    return {
      trendPrice:       cm.trendPrice       ?? null,
      averageSellPrice: cm.averageSellPrice  ?? null,
      lowPrice:         cm.lowPrice         ?? null,
      avg1:             cm.avg1             ?? null,
      avg7:             cm.avg7             ?? null,
      avg30:            cm.avg30            ?? null,
      reverseHoloTrend: cm.reverseHoloTrend ?? null,
      reverseHoloSell:  cm.reverseHoloSell  ?? null,
      source:           'cardmarket',
      updatedAt:        data.cardmarket.updatedAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

// ── Fallback : TCGdex ───────────────────────────────────────────────
async function fetchTCGdexCardPrice(tcgdexId: string): Promise<CardMarketPrice | null> {
  try {
    const res = await fetch(`${TCGDEX_BASE}/${tcgdexId}`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    const cm = data?.pricing?.cardmarket
    if (!cm) return null

    const trend = cm.trend ?? cm.avg ?? cm.low ?? null
    if (!trend) return null

    return {
      trendPrice:       cm.trend  ?? null,
      averageSellPrice: cm.avg    ?? null,
      lowPrice:         cm.low    ?? null,
      avg1:             cm.avg1   ?? null,
      avg7:             cm.avg7   ?? null,
      avg30:            cm.avg30  ?? null,
      reverseHoloTrend: cm['reverse-holo-trend'] ?? null,
      reverseHoloSell:  null,
      source:           'tcgdex',
      updatedAt:        new Date().toISOString(),
    }
  } catch {
    return null
  }
}

// ── API publique : récupérer le prix d'une carte par tcgdex_id ──────
export async function fetchLiveCardPrice(tcgdexId: string): Promise<CardMarketPrice | null> {
  const ptcg = await fetchPTCGCardPrice(tcgdexId)
  if (ptcg) return ptcg
  return fetchTCGdexCardPrice(tcgdexId)
}

// ── Stocker un prix dans card_prices et mettre à jour card_catalog ──
export async function syncAndStorePriceForCard(
  catalogId: string,
  tcgdexId: string,
): Promise<{ ok: boolean; price: number | null }> {
  const price = await fetchLiveCardPrice(tcgdexId)
  if (!price) return { ok: false, price: null }

  const supabase = await createClient()
  const now = new Date().toISOString()
  const mainPrice = price.trendPrice ?? price.averageSellPrice ?? price.lowPrice ?? 0

  // Insert dans card_prices (historique)
  await supabase.from('card_prices').insert({
    card_id:         catalogId,
    language:        'fr',
    variant:         'normal',
    condition:       'NM',
    graded:          false,
    source:          price.source,
    price_eur:       mainPrice,
    price_low_eur:   price.lowPrice,
    price_avg_eur:   price.averageSellPrice,
    price_trend_eur: price.trendPrice,
    captured_at:     now,
  })

  // Si reverse-holo dispo → row supplémentaire
  if (price.reverseHoloTrend || price.reverseHoloSell) {
    await supabase.from('card_prices').insert({
      card_id:         catalogId,
      language:        'fr',
      variant:         'reverse-holo',
      condition:       'NM',
      graded:          false,
      source:          price.source,
      price_eur:       price.reverseHoloTrend ?? price.reverseHoloSell ?? 0,
      price_avg_eur:   price.reverseHoloSell,
      price_trend_eur: price.reverseHoloTrend,
      captured_at:     now,
    })
  }

  revalidatePath('/collection')
  revalidatePath('/dashboard')

  return { ok: true, price: mainPrice }
}

// ── Récupérer les derniers prix pour une carte depuis la DB ─────────
export async function getStoredCardPrices(catalogId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('card_prices')
    .select('price_eur, price_low_eur, price_avg_eur, price_trend_eur, source, captured_at, variant')
    .eq('card_id', catalogId)
    .order('captured_at', { ascending: false })
    .limit(60) // ~30 jours de données (2 sync/jour)

  return data ?? []
}
