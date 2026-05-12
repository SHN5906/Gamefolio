'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Currency, Language, SubscriptionTier } from '@/types/db'

export interface ProfileRow {
  id:                     string
  email:                  string | null
  username:               string | null
  display_name:           string | null
  avatar_url:             string | null
  default_currency:       Currency
  default_language:       Language
  subscription_tier:      SubscriptionTier
  subscription_renews_at: string | null
  created_at:             string
}

export async function fetchMyProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('[fetchMyProfile]', error.message)
    return null
  }

  return { ...data, email: user.email ?? null } as ProfileRow
}

export interface UpdateProfileInput {
  username?:         string
  display_name?:     string
  avatar_url?:       string | null
  default_currency?: Currency
  default_language?: Language
}

export async function updateMyProfile(input: UpdateProfileInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Non authentifié' }

  const { error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', user.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { ok: true as const }
}

export async function updateMyEmail(newEmail: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const, message: 'Vérifie ta boîte mail pour confirmer.' }
}

export async function updateMyPassword(newPassword: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
