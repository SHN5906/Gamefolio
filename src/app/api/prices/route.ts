// ─────────────────────────────────────────────────────────────────────
//  GET /api/prices?ids=sv1-6,base1-4,cel25-25
//  Retourne les prix Cardmarket pour une liste de IDs de cartes
//  Source : pokemontcg.io (agrège Cardmarket quotidiennement)
// ─────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server'

const PTCG_BASE = 'https://api.pokemontcg.io/v2/cards'

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get('ids')
  if (!idsParam) return NextResponse.json({})

  const ids = idsParam.split(',').filter(Boolean).slice(0, 50) // max 50 cartes par appel
  const apiKey = process.env.POKEMONTCG_API_KEY

  const headers: HeadersInit = {
    'User-Agent': 'CardFolio/1.0',
    ...(apiKey ? { 'X-Api-Key': apiKey } : {}),
  }

  // Construire la query pokemontcg.io : id:sv1-6 OR id:base1-4 ...
  const query = ids.map(id => `id:${id}`).join(' OR ')

  try {
    const res = await fetch(
      `${PTCG_BASE}?q=${encodeURIComponent(query)}&select=id,cardmarket&pageSize=50`,
      { headers, next: { revalidate: 3600 } } // cache 1h
    )

    if (!res.ok) {
      console.error('[api/prices] pokemontcg.io error:', res.status, await res.text())
      return NextResponse.json({})
    }

    const json = await res.json()
    const cards: Array<{ id: string; cardmarket?: { prices?: Record<string, number | null> } }> = json.data ?? []

    // Construire la map id → prix (trendPrice en priorité, sinon averageSellPrice)
    const priceMap: Record<string, number> = {}
    for (const card of cards) {
      const prices = card.cardmarket?.prices
      if (!prices) continue
      const price = prices.trendPrice ?? prices.averageSellPrice ?? prices.lowPrice
      if (price && price > 0) {
        priceMap[card.id] = price
      }
    }

    return NextResponse.json(priceMap, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (e) {
    console.error('[api/prices]', e)
    return NextResponse.json({})
  }
}
