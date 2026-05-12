// ╔════════════════════════════════════════════════════════════════════╗
// ║  sync-catalog — Edge Function Supabase                            ║
// ║                                                                   ║
// ║  Synchronise la base TCGdex vers la table public.card_catalog.   ║
// ║                                                                   ║
// ║  Stratégie :                                                      ║
// ║    1. Récupère tous les sets depuis TCGdex                       ║
// ║    2. Pour chaque set, récupère le détail (qui contient les      ║
// ║       cartes avec localId, name, image, rarity)                   ║
// ║    3. Upsert dans card_catalog (insert ou update par id)         ║
// ║                                                                   ║
// ║  Déploiement :                                                    ║
// ║    supabase functions deploy sync-catalog                        ║
// ║                                                                   ║
// ║  Invocation :                                                     ║
// ║    curl -X POST https://<projet>.supabase.co/functions/v1/sync-catalog \
// ║      -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"      ║
// ║                                                                   ║
// ║  Cron :                                                           ║
// ║    Voir supabase/SETUP.md §8 pour la config pg_cron               ║
// ╚════════════════════════════════════════════════════════════════════╝

// @ts-expect-error Deno-only import (resolved at runtime)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

// Deno globals — déclarés ici pour bénéficier du typage minimum
declare const Deno: { env: { get(key: string): string | undefined } }

// ── Types TCGdex ────────────────────────────────────────────────────
interface TCGdexSetSummary {
  id: string                  // ex: 'sv03'
  name: string                // ex: '151'
  cardCount: { total: number; official: number }
}

interface TCGdexCardBrief {
  id: string                  // ex: 'sv03-006'
  localId: string             // ex: '006'
  name: string                // ex: 'Dracaufeu ex'
  image?: string              // base URL TCGdex (sans extension)
}

interface TCGdexSetDetail {
  id: string
  name: string
  releaseDate?: string
  cards: TCGdexCardBrief[]
}

interface TCGdexCardFull {
  id: string
  localId: string
  name: string
  image?: string
  illustrator?: string
  rarity?: string
  hp?: number
  types?: string[]
  variants?: Record<string, boolean>
}

// ── Config ──────────────────────────────────────────────────────────
const TCGDEX_BASE = 'https://api.tcgdex.net/v2'
const LANG_FR = 'fr'
const LANG_EN = 'en'

// Throttle pour ne pas spammer TCGdex
const SLEEP_MS_BETWEEN_REQUESTS = 100

// ── Helpers ─────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'CardFolio/sync-catalog' } })
    if (!res.ok) {
      console.warn(`[fetch] ${url} → ${res.status}`)
      return null
    }
    return await res.json() as T
  } catch (e) {
    console.error(`[fetch] ${url} →`, e)
    return null
  }
}

// Construit l'URL d'image (haute qualité)
function buildImageUrl(image: string | undefined, quality: 'low' | 'high'): string | null {
  if (!image) return null
  // TCGdex retourne une base sans extension → on ajoute /high.png ou /low.png
  return `${image}/${quality}.png`
}

// ── Main ────────────────────────────────────────────────────────────
// @ts-expect-error Deno.serve is a global in Edge Functions
Deno.serve(async (req: Request) => {
  // Auth check — n'autorise que via le service role key
  const authHeader = req.headers.get('Authorization')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!authHeader || !serviceKey || !authHeader.includes(serviceKey)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Permet de limiter le sync à un set spécifique : ?setId=sv03
  const url = new URL(req.url)
  const onlySetId = url.searchParams.get('setId')
  const dryRun = url.searchParams.get('dryRun') === '1'

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabase    = createClient(supabaseUrl, serviceKey)

  // ── 1. Récupérer la liste des sets ──
  console.log('[sync-catalog] fetching sets list…')
  const sets = await fetchJson<TCGdexSetSummary[]>(`${TCGDEX_BASE}/${LANG_FR}/sets`)
  if (!sets) return jsonError('Failed to fetch sets', 502)

  const setsToSync = onlySetId ? sets.filter(s => s.id === onlySetId) : sets
  console.log(`[sync-catalog] ${setsToSync.length} sets to sync`)

  // ── 2. Pour chaque set, récupérer le détail + cartes ──
  let totalCards = 0
  let totalErrors = 0
  const summary: Array<{ set: string; cards: number; ok: boolean }> = []

  for (const set of setsToSync) {
    const detailFr = await fetchJson<TCGdexSetDetail>(`${TCGDEX_BASE}/${LANG_FR}/sets/${set.id}`)
    const detailEn = await fetchJson<TCGdexSetDetail>(`${TCGDEX_BASE}/${LANG_EN}/sets/${set.id}`)
    await sleep(SLEEP_MS_BETWEEN_REQUESTS)

    if (!detailFr) {
      summary.push({ set: set.id, cards: 0, ok: false })
      totalErrors++
      continue
    }

    // Map id → name EN pour fallback
    const enById = new Map<string, string>()
    detailEn?.cards.forEach(c => enById.set(c.id, c.name))

    // Pour chaque carte, on a besoin de plus d'infos (rarity, types) → fetch détail
    // Optimisation : on traite par batches de 5 en parallèle
    const BATCH = 5
    const upsertRows: Array<Record<string, unknown>> = []

    for (let i = 0; i < detailFr.cards.length; i += BATCH) {
      const batch = detailFr.cards.slice(i, i + BATCH)
      const fullCards = await Promise.all(
        batch.map(c => fetchJson<TCGdexCardFull>(`${TCGDEX_BASE}/${LANG_FR}/cards/${c.id}`))
      )

      fullCards.forEach((full, idx) => {
        const brief = batch[idx]
        const card  = full ?? (brief as unknown as TCGdexCardFull)
        upsertRows.push({
          id:             card.id,
          tcgdex_id:      card.id,
          name_fr:        card.name,
          name_en:        enById.get(card.id) ?? null,
          set_id:         set.id,
          set_name_fr:    detailFr.name,
          set_name_en:    detailEn?.name ?? null,
          number:         card.localId,
          rarity:         card.rarity ?? null,
          illustrator:    card.illustrator ?? null,
          image_url_low:  buildImageUrl(card.image, 'low'),
          image_url_high: buildImageUrl(card.image, 'high'),
          release_date:   detailFr.releaseDate ?? null,
          hp:             card.hp ?? null,
          types:          card.types ?? null,
          variants:       card.variants ?? null,
          updated_at:     new Date().toISOString(),
        })
      })

      await sleep(SLEEP_MS_BETWEEN_REQUESTS)
    }

    // Upsert dans Supabase
    if (!dryRun && upsertRows.length > 0) {
      const { error } = await supabase
        .from('card_catalog')
        .upsert(upsertRows, { onConflict: 'id' })

      if (error) {
        console.error(`[sync-catalog] upsert failed for ${set.id}:`, error.message)
        summary.push({ set: set.id, cards: 0, ok: false })
        totalErrors++
        continue
      }
    }

    totalCards += upsertRows.length
    summary.push({ set: set.id, cards: upsertRows.length, ok: true })
    console.log(`[sync-catalog] ✓ ${set.id} → ${upsertRows.length} cards`)
  }

  return new Response(
    JSON.stringify({
      ok:        totalErrors === 0,
      sets:      setsToSync.length,
      cards:     totalCards,
      errors:    totalErrors,
      dryRun,
      summary,
    }, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
})

function jsonError(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
