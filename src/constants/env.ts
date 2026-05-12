// Validation des variables d'environnement au démarrage
// Plante explicitement si une var publique critique est manquante

export const env = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  // Mode démo : true si Supabase n'est pas configuré (tombe sur les mocks)
  isDemoMode: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  tcgdex: {
    baseUrl: process.env.NEXT_PUBLIC_TCGDEX_BASE_URL ?? 'https://api.tcgdex.net/v2',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
  },
  posthog: {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
  },
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  },
} as const
