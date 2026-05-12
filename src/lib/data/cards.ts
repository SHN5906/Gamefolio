'use server'

// Server Actions pour gérer les user_cards (lecture & mutations)
// Tout passe par Supabase avec RLS — l'auth est garantie par auth.uid() côté SQL.

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Condition, Language } from '@/types/db'
import { syncAndStorePriceForCard } from '@/lib/data/prices'

// ── Types ──────────────────────────────────────────────────────────
export interface UserCardRow {
  id:                  string
  user_id:             string
  card_id:             string
  language:            Language
  variant:             string
  condition:           Condition
  graded:              boolean
  grade:               string | null
  quantity:            number
  purchase_price_eur:  number | null
  purchase_date:       string | null
  notes:               string | null
  is_for_sale:         boolean
  // Joinées via la vue user_cards_enriched :
  name_fr:             string | null
  name_en:             string | null
  set_name_fr:         string | null
  set_name_en:         string | null
  catalog_number:      string | null
  rarity:              string | null
  image_url_low:       string | null
  image_url_high:      string | null
  types:               string[] | null
  current_price_eur:   number | null
}

// ── Lecture : toutes les cartes de l'utilisateur courant ──────────
export async function fetchUserCards(): Promise<UserCardRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_cards_enriched')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchUserCards] error:', error.message)
    return []
  }
  return (data ?? []) as UserCardRow[]
}

// ── Création ───────────────────────────────────────────────────────
export interface CreateCardInput {
  card_id:             string
  language?:           Language
  variant?:            string
  condition?:          Condition
  graded?:             boolean
  grade?:              string | null
  quantity?:           number
  purchase_price_eur?: number | null
  purchase_date?:      string | null
  notes?:              string | null
}

export async function createUserCard(input: CreateCardInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('user_cards')
    .insert({ ...input, user_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  // ── Fetch le prix Cardmarket en live dès l'ajout ──
  // On récupère le tcgdex_id depuis card_catalog pour appeler pokemontcg.io
  const { data: catalogRow } = await supabase
    .from('card_catalog')
    .select('tcgdex_id')
    .eq('id', input.card_id)
    .single()

  if (catalogRow?.tcgdex_id) {
    // Fire-and-forget : on ne bloque pas le retour si ça échoue
    syncAndStorePriceForCard(input.card_id, catalogRow.tcgdex_id).catch(
      (e) => console.error('[createUserCard] price sync failed:', e)
    )
  }

  revalidatePath('/collection')
  revalidatePath('/dashboard')
  return { ok: true, id: data.id }
}

// ── Update ─────────────────────────────────────────────────────────
export async function updateUserCard(id: string, patch: Partial<CreateCardInput>): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('user_cards').update(patch).eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/collection')
  revalidatePath('/dashboard')
  return { ok: true }
}

// ── Delete ─────────────────────────────────────────────────────────
export async function deleteUserCard(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('user_cards').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/collection')
  revalidatePath('/dashboard')
  return { ok: true }
}
