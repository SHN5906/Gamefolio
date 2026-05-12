// ╔════════════════════════════════════════════════════════════════════╗
// ║  daily-snapshot — Edge Function Supabase                          ║
// ║                                                                   ║
// ║  Calcule pour chaque user la valeur totale de son portfolio       ║
// ║  et l'enregistre dans portfolio_snapshots.                        ║
// ║                                                                   ║
// ║  Utilisé pour générer les courbes historiques (24h / 7j / 30j…). ║
// ║                                                                   ║
// ║  Cron recommandé : tous les jours à 3h UTC                        ║
// ╚════════════════════════════════════════════════════════════════════╝

// @ts-expect-error Deno-only import (resolved at runtime)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4'

declare const Deno: { env: { get(key: string): string | undefined } }

interface UserCardEnriched {
  user_id:           string
  quantity:          number
  purchase_price_eur: number | null
  current_price_eur: number | null
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
  const supabase    = createClient(supabaseUrl, serviceKey)

  // Récupérer toutes les cartes de tous les users (en bypass RLS via service role)
  const { data: cards, error } = await supabase
    .from('user_cards_enriched')
    .select('user_id, quantity, purchase_price_eur, current_price_eur')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  // Grouper par user_id
  const byUser = new Map<string, {
    totalValue: number
    totalCost:  number
    cardCount:  number
    uniqueCards: Set<string>
  }>()

  for (const c of (cards ?? []) as UserCardEnriched[]) {
    const u = byUser.get(c.user_id) ?? { totalValue: 0, totalCost: 0, cardCount: 0, uniqueCards: new Set() }
    const value = (c.current_price_eur ?? 0) * c.quantity
    const cost  = (c.purchase_price_eur ?? 0) * c.quantity
    u.totalValue += value
    u.totalCost  += cost
    u.cardCount  += c.quantity
    byUser.set(c.user_id, u)
  }

  // Insert un snapshot pour chaque user
  const now = new Date().toISOString()
  const snapshots = [...byUser.entries()].map(([user_id, stats]) => ({
    user_id,
    total_value_eur:   Number(stats.totalValue.toFixed(2)),
    total_cost_eur:    Number(stats.totalCost.toFixed(2)),
    card_count:        stats.cardCount,
    unique_card_count: stats.uniqueCards.size,
    captured_at:       now,
  }))

  if (snapshots.length === 0) {
    return new Response(JSON.stringify({ ok: true, snapshots: 0, note: 'no users with cards' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { error: insertError } = await supabase
    .from('portfolio_snapshots')
    .insert(snapshots)

  if (insertError) {
    return new Response(JSON.stringify({ error: insertError.message }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ ok: true, snapshots: snapshots.length, capturedAt: now }, null, 2),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
})
