'use client'

// Toast system maison — pas de dépendance externe
// Usage : import { toast } from '@/components/ui/Toaster'; toast.success('Message')

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info, X, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info' | 'loading'

interface Toast {
  id:       string
  type:     ToastType
  title:    string
  message?: string
  duration: number
}

type Listener = (toasts: Toast[]) => void

class ToastStore {
  private toasts: Toast[] = []
  private listeners: Listener[] = []

  subscribe(fn: Listener) {
    this.listeners.push(fn)
    return () => { this.listeners = this.listeners.filter(l => l !== fn) }
  }

  private emit() { this.listeners.forEach(l => l(this.toasts)) }

  add(type: ToastType, title: string, message?: string, duration = 4000): string {
    const id = Math.random().toString(36).slice(2, 9)
    this.toasts = [...this.toasts, { id, type, title, message, duration }]
    this.emit()
    if (type !== 'loading' && duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }
    return id
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.emit()
  }
}

const store = new ToastStore()

export const toast = {
  success: (title: string, message?: string, duration?: number) => store.add('success', title, message, duration),
  error:   (title: string, message?: string, duration?: number) => store.add('error',   title, message, duration ?? 6000),
  info:    (title: string, message?: string, duration?: number) => store.add('info',    title, message, duration),
  loading: (title: string, message?: string) => store.add('loading', title, message, 0),
  dismiss: (id: string) => store.remove(id),
}

// ── Composant Toaster (à monter une fois dans le layout) ──
export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => store.subscribe(setToasts), [])

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <AnimatePresence>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => store.remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const config = {
    success: { icon: Check,        color: 'var(--color-positive)', bg: 'var(--color-positive-soft)', glow: 'var(--color-positive-glow)' },
    error:   { icon: AlertCircle,  color: 'var(--color-negative)', bg: 'var(--color-negative-soft)', glow: 'var(--color-negative-glow)' },
    info:    { icon: Info,         color: 'var(--color-brand)',    bg: 'var(--color-brand-soft)',    glow: 'var(--color-brand-glow)' },
    loading: { icon: Loader2,      color: 'var(--color-brand)',    bg: 'var(--color-brand-soft)',    glow: 'var(--color-brand-glow)' },
  }[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 280 }}
      className="pointer-events-auto rounded-[var(--radius-md)] border overflow-hidden flex items-start gap-3 px-4 py-3 min-w-[280px] max-w-md"
      style={{
        background: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-strong)',
        boxShadow: `var(--shadow-lg), 0 0 24px ${config.glow}`,
        backdropFilter: 'blur(20px)',
      }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: config.bg, color: config.color }}
      >
        <config.icon size={13} strokeWidth={2.4} className={toast.type === 'loading' ? 'animate-spin' : ''} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-semibold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: 'var(--color-text-secondary)' }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity opacity-50 hover:opacity-100 mt-0.5"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <X size={11} strokeWidth={2.4} />
      </button>
    </motion.div>
  )
}
