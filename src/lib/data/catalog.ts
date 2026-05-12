'use server'

import { createClient } from '@/lib/supabase/server'
import type { CardCatalog } from '@/types/db'

// Récupère une carte du catalog (lecture publique)
export async function fetchCatalogCard(id: string): Promise<CardCatalog | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('card_catalog')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data as CardCatalog
}
