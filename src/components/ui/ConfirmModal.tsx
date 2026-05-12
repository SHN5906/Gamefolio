'use client'

// Modal de confirmation pour actions destructives
// Usage : const confirm = useConfirm(); const ok = await confirm({ title: '...', danger: true });

import { useState, createContext, useContext, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmOptions {
  title:        string
  message?:     string
  confirmText?: string
  cancelText?:  string
  danger?:      boolean
}

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return ctx
}

interface PendingConfirm {
  options: ConfirmOptions
  resolve: (v: boolean) => void
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending({ options, resolve })
    })
  }, [])

  const respond = (value: boolean) => {
    if (pending) {
      pending.resolve(value)
      setPending(null)
    }
  }

  const opts = pending?.options
  const isDanger = opts?.danger

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {pending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={() => respond(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-[var(--radius-lg)] border overflow-hidden"
              style={{
                background: 'var(--color-bg-elevated)',
                borderColor: 'var(--color-border-strong)',
                boxShadow: 'var(--shadow-xl)',
              }}
            >
              {/* Top highlight */}
              <div className="absolute inset-x-0 top-0 h-px"
                style={{ background: isDanger ? 'linear-gradient(90deg, transparent, rgba(255,77,94,0.5), transparent)' : 'linear-gradient(90deg, transparent, rgba(42,125,255,0.5), transparent)' }}
              />

              <button
                onClick={() => respond(false)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ background: 'var(--color-bg-glass)', color: 'var(--color-text-muted)' }}
              >
                <X size={12} />
              </button>

              <div className="p-6">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-[var(--radius-md)] flex items-center justify-center mb-4 border"
                  style={{
                    background: isDanger ? 'var(--color-negative-soft)' : 'var(--color-brand-soft)',
                    borderColor: 'rgba(255,255,255,0.06)',
                    color: isDanger ? 'var(--color-negative)' : 'var(--color-brand)',
                  }}
                >
                  <AlertTriangle size={20} strokeWidth={2.2} />
                </div>

                {/* Title + message */}
                <h2
                  className="text-[18px] font-bold tracking-tight leading-tight mb-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {opts?.title}
                </h2>
                {opts?.message && (
                  <p className="text-[13px] mb-5" style={{ color: 'var(--color-text-secondary)' }}>
                    {opts.message}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => respond(false)}
                    className="h-9 px-4 rounded-[var(--radius-sm)] text-[12.5px] font-semibold border transition-colors"
                    style={{
                      background: 'var(--color-bg-glass)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {opts?.cancelText ?? 'Annuler'}
                  </button>
                  <button
                    onClick={() => respond(true)}
                    autoFocus
                    className="h-9 px-4 rounded-[var(--radius-sm)] text-[12.5px] font-bold text-white transition-all hover:-translate-y-px"
                    style={{
                      background: isDanger
                        ? 'var(--color-negative)'
                        : 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
                      boxShadow: isDanger
                        ? '0 0 16px var(--color-negative-glow)'
                        : '0 0 16px var(--color-brand-glow)',
                    }}
                  >
                    {opts?.confirmText ?? 'Confirmer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  )
}
