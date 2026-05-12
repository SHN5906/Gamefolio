'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const KEY = 'cardfolio_cookie_consent_v1'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const consent = localStorage.getItem(KEY)
    if (!consent) {
      // Petit délai pour ne pas spammer dès l'arrivée
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = (mode: 'all' | 'essential') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify({ mode, date: new Date().toISOString() }))
      // Si mode='essential' → désactive PostHog (logique à brancher sur le client)
      if (mode === 'essential' && typeof window !== 'undefined') {
        // @ts-expect-error PostHog runtime
        window.posthog?.opt_out_capturing?.()
      }
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[90] rounded-[var(--radius-md)] border p-4"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-strong)',
            boxShadow: 'var(--shadow-xl)',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-pokemon-yellow-soft)', color: 'var(--color-pokemon-yellow)' }}>
              <Cookie size={16} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                On respecte ta vie privée
              </p>
              <p className="text-[11.5px] leading-relaxed mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                On utilise des cookies <strong>essentiels</strong> (session, sécurité) et un cookie <strong>analytics anonymisé</strong> (PostHog EU) pour améliorer le produit. Pas de pub, pas de tracking. Tu peux refuser.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => accept('all')}
                  className="flex-1 sm:flex-none h-8 px-3.5 rounded-[var(--radius-sm)] text-[12px] font-bold text-white transition-all hover:-translate-y-px"
                  style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 12px var(--color-brand-glow)' }}>
                  Tout accepter
                </button>
                <button onClick={() => accept('essential')}
                  className="flex-1 sm:flex-none h-8 px-3 rounded-[var(--radius-sm)] text-[12px] font-semibold border transition-colors"
                  style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Essentiels uniquement
                </button>
                <Link href="/privacy" className="text-[11px] underline" style={{ color: 'var(--color-text-muted)' }}>
                  En savoir plus
                </Link>
              </div>
            </div>
            <button onClick={() => accept('essential')}
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--color-bg-glass)', color: 'var(--color-text-muted)' }}>
              <X size={11} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
