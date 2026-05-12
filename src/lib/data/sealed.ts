'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Language } from '@/types/db'

export type SealedTypeDB = 'display' | 'etb' | 'coffret' | 'blister' | 'deck' | 'tin' | 'bundle' | 'promo'
export type SealedState  = 'sealed' | 'opened'

export interface SealedRow {
  id:                  string
  user_id:             string
  name:                string
  type:                SealedTypeDB
  set_name:            string | null
  language:            Language
  state:               SealedState
  quantity:            number
  purchase_price_eur:  number | null
  current_value_eur:   number | null
  purchase_date:       string | null
  notes:               string | null
  image_url:           string | null
  created_at:          string
}

export async function fetchUserSealed(): Promise<SealedRow[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_sealed')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchUserSealed]', error.message)
    return []
  }
  return data ?? []
}

export interface CreateSealedInput {
  name:                string
  type:                SealedTypeDB
  set_name?:           string
  language?:           Language
  state?:              SealedState
  quantity?:           number
  purchase_price_eur?: number | null
  current_value_eur?:  number | null
  purchase_date?:      string | null
  notes?:              string | null
  image_url?:          string | null
}

export async function createUserSealed(input: CreateSealedInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Non authentifié' }

  const { data, error } = await supabase
    .from('user_sealed')
    .insert({ ...input, user_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/collection')
  revalidatePath('/dashboard')
  return { ok: true as const, id: data.id }
}

export async function deleteUserSealed(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('user_sealed').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  revalidatePath('/collection')
  revalidatePath('/dashboard')
  return { ok: true as const }
}
