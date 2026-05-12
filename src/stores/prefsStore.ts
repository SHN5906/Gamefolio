import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Currency, Language } from '@/types/db'

interface PrefsState {
  currency: Currency
  language: Language
  dashboardPeriod: '24h' | '7d' | '30d' | '1y' | 'all'
  setCurrency: (currency: Currency) => void
  setLanguage: (language: Language) => void
  setDashboardPeriod: (period: PrefsState['dashboardPeriod']) => void
}

// Persisté en localStorage pour mémoriser les préférences UI
export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      currency: 'EUR',
      language: 'fr',
      dashboardPeriod: '7d',
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
      setDashboardPeriod: (dashboardPeriod) => set({ dashboardPeriod }),
    }),
    { name: 'cardfolio-prefs' }
  )
)
