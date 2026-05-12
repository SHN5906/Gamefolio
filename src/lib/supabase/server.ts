import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/constants/env'

// Client Supabase pour les Server Components et Route Handlers
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabase.url, env.supabase.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // setAll appelé depuis un Server Component — ignoré (pas d'effet de bord côté serveur)
        }
      },
    },
  })
}
