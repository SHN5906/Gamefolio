// ╔════════════════════════════════════════════════════════════════════╗
// ║  sync-prices — Edge Function Supabase                             ║
// ║                                                                   ║
// ║  Récupère les prix Cardmarket via pokemontcg.io (qui agrège       ║
// ║  les prix officiels Cardmarket quotidiennement).                  ║
// ║                                                                   ║
// ║  Stratégie :                                                      ║
// ║   - Ne sync que les cartes "actives" (dans user_cards/wishlist)  ║
// ║     sauf si ?full=1                                               ║
// ║   - Insert au lieu d'upsert → garde l'historique pour courbes    ║
// ║   - Fallback TCGdex si pokemontcg.io n'a pas la carte            ║
// ║                                                                   ║
// ║  Cron recommandé : toutes les 6h                                  ║
// ╚════════════════════════════════════════════════════════════════════╝

// @ts-expect-error Deno-only import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'
declare const Deno: { env: { get(key: string): string | undefined } }

const PTCG_BASE   = 'https://api.pokemontcg.io/v2/cards'
const TCGDEX_BASE = 'https://api.tcgdex.net/v2/fr/cards'
const SLEEP_MS    = 120
const BATCH_SIZE  = 5

// ── Types ────────────────────────────────────────────────────────────

interface PTCGCardmarketPrices {
  averageSellPrice:   number | null
  lowPrice:           number | null
  trendPrice:         number | null
  reverseHoloSell:    number | null
  reverseHoloLow:     number | null
  reverseHoloTrend:   number | null
  lowPriceExPlus:     number | null
  avg1:               number | null
  avg7:               number | null
  avg30:              number | null
}

interface PTCGCard {
  id: string
  cardmarket?: {
    updatedAt?: string
    prices?: PTCGCardmarketPrices
  }
}

interface TCGdexPricing {
  cardmarket?: {
    avg?: number
    low?: number
    trend?: number
    'reverse-holo-low'?:   number
    'reverse-holo-trend'?: number
    'reverse-holo-avg30'?: number
  }
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'CardFolio/sync-prices', ...headers } })
    if (!r.ok) return null
    return await r.json() as T
  } catch (e) {
    console.error(`[fetch] ${url}`, e)
    return null
  }
}

async function fetchPTCGPrice(id: string, apiKey?: string) {
  const headers: Record<string, string> = apiKey ? { 'X-Api-Key': apiKey } : {}
  const res = await fetchJson<{ data: PTCGCard }>(`${PTCG_BASE}/${id}`, headers)
  if (!res?.data?.cardmarket?.prices) return null
  return res.data.cardmarket.prices
}

async function fetchTCGdexPrice(id: string) {
  const card = await fetchJson<{ pricing?: TCGdexPricing }>(`${TCGDEX_BASE}/${id}`)
  return card?.pricing?.cardmarket ?? null
}

// @ts-expect-error Deno.serve
Deno.serve(async (req: Request) => {
  // Auth
  const authHeader = req.headers.get('Authorization')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!authHeader || !serviceKey || !authHeader.includes(serviceKey)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const ptcgApiKey  = Deno.env.get('POKEMONTCG_API_KEY')
  const supabase    = createClient(supabaseUrl, serviceKey)

  const url      = new URL(req.url)
  const fullSync = url.searchParams.get('full') === '1'
  const limit    = parseInt(url.searchParams.get('limit') ?? '500', 10)

  // ── 1. Récupérer les tcgdex_ids à sync ──
  let tcgdexIds: string[] = []
  let internalIdMap: Record<string, string> = {} // tcgdexId → card_catalog.id

  if (!fullSync) {
    const [userCardsRes, wishRes] = await Promise.all([
      supabase.from('user_cards').select('card_id'),
      supabase.from('wishlist_items').select('card_id'),
    ])
    const ids = new Set<string>()
    userCardsRes.data?.forEach((r: { card_id: string }) => ids.add(r.card_id))
    wishRes.data?.forEach((r: { card_id: string }) => ids.add(r.card_id))

    if (ids.size === 0) {
      return new Response(
        JSON.stringify({ ok: true, synced: 0, note: 'Aucune carte active. Passe ?full=1 pour tout sync.' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }
    const { data: rows } = await supabase
      .from('card_catalog')
      .select('id, tcgdex_id')
      .in('id', [...ids])
      .not('tcgdex_id', 'is', null)
      .limit(limit)
    rows?.forEach((r: { id: string; tcgdex_id: string }) => { internalIdMap[r.tcgdex_id] = r.id; tcgdexIds.push(r.tcgdex_id) })
  } else {
    const { data: rows } = await supabase
      .from('card_catalog')
      .select('id, tcgdex_id')
      .not('tcgdex_id', 'is', null)
      .limit(limit)
    rows?.forEach((r: { id: string; tcgdex_id: string }) => { internalIdMap[r.tcgdex_id] = r.id; tcgdexIds.push(r.tcgdex_id) })
  }

  console.log(`[sync-prices] ${tcgdexIds.length} cartes${ptcgApiKey ? ' (avec clé API PTCG)' : ' (sans clé API)'}`)

  // ── 2. Fetch prix par batch ──
  let inserted = 0
  let skipped  = 0
  let errors   = 0
  let ptcgHits = 0
  let fallbacks = 0
  const now = new Date().toISOString()

  for (let i = 0; i < tcgdexIds.length; i += BATCH_SIZE) {
    const batch = tcgdexIds.slice(i, i + BATCH_SIZE)
    const ptcgResults = await Promise.all(batch.map(id => fetchPTCGPrice(id, ptcgApiKey)))

    const priceRows: Array<Record<string, unknown>> = []

    for (let j = 0; j < batch.length; j++) {
      const tcgdexId   = batch[j]
      const internalId = internalIdMap[tcgdexId]
      if (!internalId) { skipped++; continue }

      const ptcg = ptcgResults[j]

      if (ptcg) {
        // ── Source : Cardmarket via pokemontcg.io ──
        ptcgHits++
        const mainPrice = ptcg.trendPrice ?? ptcg.averageSellPrice ?? ptcg.lowPrice ?? 0

        priceRows.push({
          card_id:         internalId,
          language:        'fr',
          variant:         'normal',
          condition:       'NM',
          graded:          false,
          source:          'cardmarket',
          price_eur:       mainPrice,
          price_low_eur:   ptcg.lowPrice ?? null,
          price_avg_eur:   ptcg.averageSellPrice ?? null,
          price_trend_eur: ptcg.trendPrice ?? null,
          captured_at:     now,
        })

        if (ptcg.reverseHoloTrend || ptcg.reverseHoloSell) {
          priceRows.push({
            card_id:         internalId,
            language:        'fr',
            variant:         'reverse-holo',
            condition:       'NM',
            graded:          false,
            source:          'cardmarket',
            price_eur:       ptcg.reverseHoloTrend ?? ptcg.reverseHoloSell ?? 0,
            price_low_eur:   ptcg.reverseHoloLow ?? null,
            price_avg_eur:   ptcg.reverseHoloSell ?? null,
            price_trend_eur: ptcg.reverseHoloTrend ?? null,
            captured_at:     now,
          })
        }
      } else {
        // ── Fallback : TCGdex ──
        const cm = await fetchTCGdexPrice(tcgdexId)
        if (!cm) { skipped++; continue }

        fallbacks++
        const price = cm.trend ?? cm.avg ?? cm.low ?? 0

        priceRows.push({
          card_id:         internalId,
          language:        'fr',
          variant:         'normal',
          condition:       'NM',
          graded:          false,
          source:          'tcgdex',
          price_eur:       price,
          price_low_eur:   cm.low ?? null,
          price_avg_eur:   cm.avg ?? null,
          price_trend_eur: cm.trend ?? null,
          captured_at:     now,
        })

        if (cm['reverse-holo-trend'] ?? cm['reverse-holo-avg30']) {
          priceRows.push({
            card_id:         internalId,
            language:        'fr',
            variant:         'reverse-holo',
            condition:       'NM',
            graded:          false,
            source:          'tcgdex',
            price_eur:       cm['reverse-holo-trend'] ?? cm['reverse-holo-avg30'] ?? 0,
            price_low_eur:   cm['reverse-holo-low'] ?? null,
            price_avg_eur:   cm['reverse-holo-avg30'] ?? null,
            price_trend_eur: cm['reverse-holo-trend'] ?? null,
            captured_at:     now,
          })
        }
      }
    }

    if (priceRows.length > 0) {
      const { error: insertErr } = await supabase.from('card_prices').insert(priceRows)
      if (insertErr) { console.error('[insert]', insertErr.message); errors++ }
      else inserted += priceRows.length
    }

    await sleep(SLEEP_MS)
  }

  const summary = {
    ok: errors === 0,
    cards: tcgdexIds.length,
    inserted,
    skipped,
    errors,
    sources: { cardmarket_ptcg: ptcgHits, tcgdex_fallback: fallbacks },
    capturedAt: now,
  }
  console.log('[sync-prices] done:', JSON.stringify(summary))

  return new Response(JSON.stringify(summary, null, 2), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
