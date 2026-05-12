import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/constants/env'

// Client Supabase pour les composants browser (React Client Components)
export function createClient() {
  return createBrowserClient(env.supabase.url, env.supabase.anonKey)
}
