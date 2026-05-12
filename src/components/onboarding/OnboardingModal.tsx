'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Search, Heart, BarChart3, Zap, ArrowRight, Check } from 'lucide-react'

const ONBOARDING_KEY = 'cardfolio_onboarded_v1'

interface Step {
  icon: React.ElementType
  iconColor: string
  iconBg: string
  title: string
  description: string
  highlights: string[]
}

const STEPS: Step[] = [
  {
    icon: Sparkles,
    iconColor: 'var(--color-brand)',
    iconBg: 'var(--color-brand-soft)',
    title: 'Bienvenue dans CardFolio',
    description: 'Le portfolio Pokémon TCG comme un broker financier. Suis la valeur de ta collection en temps réel, comme tes actions.',
    highlights: [
      'Cartes individuelles (TCGdex) + produits scellés',
      'Prix Cardmarket synchronisés toutes les 6h',
      'Courbes historiques 24h / 7j / 30j / 1a',
    ],
  },
  {
    icon: Search,
    iconColor: 'var(--color-cyan)',
    iconBg: 'var(--color-cyan-soft)',
    title: 'Ajoute ta première carte',
    description: 'Recherche dans la base TCGdex (Dracaufeu, Mewtwo, Pikachu…) et précise condition, langue, prix d\'achat.',
    highlights: [
      'Recherche instantanée en français',
      'Photos officielles haute qualité',
      'Pour les scellés : upload ta propre photo',
    ],
  },
  {
    icon: Heart,
    iconColor: 'var(--color-pink)',
    iconBg: 'var(--color-pink-soft)',
    title: 'Ta wishlist + tes alertes',
    description: 'Définis tes seuils d\'alerte sur les cartes que tu surveilles. On te prévient quand le prix baisse sous ta cible.',
    highlights: [
      'Priorités : Urgent · Je veux · Surveille',
      'Budget max + seuil d\'alerte',
      'Notifications quand le prix descend',
    ],
  },
]

export function OnboardingModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Check first visit
  useEffect(() => {
    if (typeof window === 'undefined') return
    const done = localStorage.getItem(ONBOARDING_KEY)
    if (!done) setOpen(true)
  }, [])

  const close = (skipped = false) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARDING_KEY, new Date().toISOString())
    }
    setOpen(false)
    if (!skipped) {
      setTimeout(() => router.push('/add'), 200)
    }
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else close(false)
  }

  if (!open) return null

  const current = STEPS[step]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          key={step}
          initial={{ y: 20, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-[var(--radius-lg)] border overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-surface))',
            borderColor: 'var(--color-border-strong)',
            boxShadow: 'var(--shadow-xl), 0 0 60px var(--color-brand-glow)',
          }}
        >
          {/* Highlight haut */}
          <div
            className="absolute inset-x-0 top-0 h-px pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(42,125,255,0.5), transparent)' }}
          />

          {/* Close */}
          <button
            onClick={() => close(true)}
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--color-bg-glass)', color: 'var(--color-text-muted)' }}
          >
            <X size={13} />
          </button>

          <div className="p-7 pt-9">
            {/* Step indicator */}
            <div className="flex items-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? 28 : 6,
                    background: i <= step ? 'var(--color-brand)' : 'var(--color-border-strong)',
                    boxShadow: i === step ? '0 0 8px var(--color-brand-glow)' : 'none',
                  }}
                />
              ))}
              <span className="ml-auto text-[10px] font-mono" style={{ color: 'var(--color-text-muted)' }}>
                {step + 1}/{STEPS.length}
              </span>
            </div>

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center mb-5 border"
              style={{
                background: current.iconBg,
                borderColor: 'rgba(255,255,255,0.06)',
                color: current.iconColor,
                boxShadow: `0 0 24px ${current.iconColor}40`,
              }}
            >
              <current.icon size={26} strokeWidth={2} />
            </div>

            {/* Title */}
            <h2
              className="text-[24px] font-extrabold leading-tight tracking-tight mb-2"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
            >
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-[13.5px] leading-relaxed mb-5" style={{ color: 'var(--color-text-secondary)' }}>
              {current.description}
            </p>

            {/* Highlights */}
            <ul className="flex flex-col gap-2.5 mb-6">
              {current.highlights.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-start gap-2.5 text-[12.5px]"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'var(--color-positive-soft)', color: 'var(--color-positive)' }}
                  >
                    <Check size={9} strokeWidth={3} />
                  </div>
                  {h}
                </motion.li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Retour
                </button>
              ) : (
                <button
                  onClick={() => close(true)}
                  className="text-[12px] font-medium transition-colors"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Passer
                </button>
              )}

              <button
                onClick={next}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-[var(--radius-sm)] text-[13px] font-bold text-white transition-all hover:-translate-y-px"
                style={{
                  background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
                  boxShadow: '0 0 20px var(--color-brand-glow)',
                }}
              >
                {step < STEPS.length - 1 ? 'Continuer' : 'Ajouter ma 1ère carte'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
