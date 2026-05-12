'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryClient'
import { Toaster } from '@/components/ui/Toaster'
import { ConfirmProvider } from '@/components/ui/ConfirmModal'
import { CookieBanner } from '@/components/legal/CookieBanner'

// Point d'entrée de tous les providers client
export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmProvider>
        {children}
        <Toaster />
        <CookieBanner />
      </ConfirmProvider>
    </QueryClientProvider>
  )
}
