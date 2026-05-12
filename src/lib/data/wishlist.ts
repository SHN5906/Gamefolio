'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Condition, Language } from '@/types/db'
import { syncAndStorePriceForCard } from '@/lib/data/prices'

export type WishPriority = 'urgent' | 'want' | 'watching'

export interface WishlistRow {
  id:                string
  user_id:           string
  card_id:           string
  language:          Language
  variant:           string
  condition:         Condition
  priority:          WishPriority
  target_price_eur:  number | null
  max_price_eur:     number | null
  alert_enabled:     boolean
  notes:             string | null
  created_at:        string
  // Joinées :
  name_fr:           string | null
  name_en:           string | null
  set_name_fr:       string | null
  set_name_en:       string | null
  catalog_number:    string | null
  image_url_low:     string | null
  current_price_eur: number | null
}

export async function fetchWishlist(): Promise<WishlistRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('wishlist_items')
    .select(`
      id, user_id, card_id, language, variant, condition,
      priority, target_price_eur, max_price_eur, alert_enabled,
      notes, created_at,
      card_catalog (
        name_fr, name_en, set_name_fr, set_name_en, number, image_url_low
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchWishlist]', error.message)
    return []
  }

  // Récupérer les derniers prix connus pour toutes ces cartes en une seule requête
  const cardIds = [...new Set((data ?? []).map(r => r.card_id))]
  const priceMap: Record<string, number | null> = {}

  if (cardIds.length > 0) {
    const { data: priceRows } = await supabase
      .from('card_prices')
      .select('card_id, price_eur, captured_at')
      .in('card_id', cardIds)
      .order('captured_at', { ascending: false })

    // Garder uniquement le prix le plus récent par carte
    priceRows?.forEach(p => {
      if (!(p.card_id in priceMap)) {
        priceMap[p.card_id] = p.price_eur
      }
    })
  }

  return (data ?? []).map((row) => {
    const cat = (row as unknown as { card_catalog?: Record<string, unknown> }).card_catalog ?? {}
    return {
      id:                row.id,
      user_id:           row.user_id,
      card_id:           row.card_id,
      language:          row.language,
      variant:           row.variant,
      condition:         row.condition,
      priority:          row.priority,
      target_price_eur:  row.target_price_eur,
      max_price_eur:     row.max_price_eur,
      alert_enabled:     row.alert_enabled,
      notes:             row.notes,
      created_at:        row.created_at,
      name_fr:           (cat.name_fr ?? null) as string | null,
      name_en:           (cat.name_en ?? null) as string | null,
      set_name_fr:       (cat.set_name_fr ?? null) as string | null,
      set_name_en:       (cat.set_name_en ?? null) as string | null,
      catalog_number:    (cat.number ?? null) as string | null,
      image_url_low:     (cat.image_url_low ?? null) as string | null,
      current_price_eur: priceMap[row.card_id] ?? null,
    }
  })
}

export interface CreateWishInput {
  card_id:           string
  language?:         Language
  variant?:          string
  condition?:        Condition
  priority?:         WishPriority
  target_price_eur?: number | null
  max_price_eur?:    number | null
  notes?:            string | null
}

export async function createWishlistItem(input: CreateWishInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ ...input, user_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false as const, error: error.message }

  // Sync le prix en live au moment de l'ajout
  const { data: catRow } = await supabase
    .from('card_catalog')
    .select('tcgdex_id')
    .eq('id', input.card_id)
    .single()

  if (catRow?.tcgdex_id) {
    syncAndStorePriceForCard(input.card_id, catRow.tcgdex_id).catch(
      e => console.error('[createWishlistItem] price sync:', e)
    )
  }

  revalidatePath('/wishlist')
  return { ok: true as const, id: data.id }
}

export async function deleteWishlistItem(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/wishlist')
  return { ok: true as const }
}

export interface UpdateWishInput {
  priority?:         WishPriority
  target_price_eur?: number | null
  max_price_eur?:    number | null
  notes?:            string | null
  alert_enabled?:    boolean
}

export async function updateWishlistItem(id: string, input: UpdateWishInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Non authentifié' }

  const { error } = await supabase
    .from('wishlist_items')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/wishlist')
  return { ok: true as const }
}

export interface CreateWishFromTCGInput {
  tcgdexId:       string
  name:           string
  setId:          string
  imageUrl:       string | null
  priority?:      WishPriority
  targetPriceEur?: number | null
  maxPriceEur?:   number | null
  notes?:         string | null
}

export async function createWishlistFromTCGCard(input: CreateWishFromTCGInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Non authentifié' }

  // Upsert carte dans le catalogue
  const { data: cat, error: catErr } = await supabase
    .from('card_catalog')
    .upsert(
      {
        tcgdex_id:     input.tcgdexId,
        name_fr:       input.name,
        set_name_fr:   input.setId,
        image_url_low: input.imageUrl,
      },
      { onConflict: 'tcgdex_id' }
    )
    .select('id')
    .single()

  if (catErr || !cat) return { ok: false as const, error: catErr?.message ?? 'Erreur catalogue' }

  const { error } = await supabase.from('wishlist_items').insert({
    user_id:         user.id,
    card_id:         cat.id,
    priority:        input.priority ?? 'want',
    target_price_eur: input.targetPriceEur ?? null,
    max_price_eur:   input.maxPriceEur ?? null,
    notes:           input.notes ?? null,
  })

  if (error) return { ok: false as const, error: error.message }

  // Sync le prix en live
  syncAndStorePriceForCard(cat.id, input.tcgdexId).catch(
    e => console.error('[createWishlistFromTCGCard] price sync:', e)
  )

  revalidatePath('/wishlist')
  return { ok: true as const }
}
