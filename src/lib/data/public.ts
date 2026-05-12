'use server'

// Public read-only access to user profiles for /u/[username]
// Uses anon key — RLS on profiles + user_cards permits public select via dedicated policies.

import { createClient } from '@/lib/supabase/server'
import type { ProfileRow } from './profile'
import type { UserCardRow } from './cards'

export async function fetchPublicProfile(username: string): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) return null
  return data as ProfileRow
}

export async function fetchPublicCollection(userId: string): Promise<UserCardRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_cards_enriched')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchPublicCollection]', error.message)
    return []
  }
  return (data ?? []) as UserCardRow[]
}
