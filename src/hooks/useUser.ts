'use client'

// Hook qui expose l'utilisateur Supabase courant dans les Client Components.
// Retourne null si non connecté ou si Supabase n'est pas configuré (mode démo).

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { env } from '@/constants/env'
import { createClient } from '@/lib/supabase/client'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (env.isDemoMode) return

    const supabase = createClient()

    // Chargement initial
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Écoute les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Dériver un display name depuis les metadata ou l'email
  const displayName: string = (() => {
    if (!user) return 'Vous'
    const meta = user.user_metadata as Record<string, unknown>
    if (typeof meta?.display_name === 'string' && meta.display_name) return meta.display_name
    if (typeof meta?.full_name === 'string' && meta.full_name) return meta.full_name
    // Fallback : partie avant @ de l'email
    return user.email?.split('@')[0] ?? 'Vous'
  })()

  // Initiale pour l'avatar
  const initial: string = displayName[0]?.toUpperCase() ?? '?'

  return { user, displayName, initial }
}
