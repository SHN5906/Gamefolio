'use client'

import { useState } from 'react'
import { Bell, Search, Command } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { BalancePill } from '@/components/game/BalancePill'
import { DailyBar } from '@/components/game/DailyBar'

interface TopbarProps {
  title?: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const [focused, setFocused] = useState(false)
  const { displayName } = useUser()

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 sm:gap-4 px-4 md:px-8 py-3 border-b"
      style={{
        background: 'rgba(5,7,16,0.72)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo CF visible sur mobile uniquement (sidebar masquée) */}
      <div
        className="md:hidden w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[12px] font-extrabold flex-shrink-0"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(140deg, var(--color-brand) 0%, var(--color-cyan) 100%)',
          boxShadow: '0 0 16px var(--color-brand-glow)',
          letterSpacing: '-0.03em',
        }}
      >
        CF
      </div>

      {/* Greeting (compact) — caché < sm */}
      <div className="hidden sm:flex items-baseline gap-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[1.2px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {subtitle ?? 'Bonjour'}
        </p>
        <p
          className="text-[13px] font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
        >
          {title ?? displayName}
        </p>
      </div>

      {/* Global search */}
      <div className="flex-1 max-w-md sm:mx-auto">
        <div
          className="relative flex items-center h-9 rounded-[var(--radius-sm)] border transition-all duration-200"
          style={{
            background: focused ? 'var(--color-bg-glass-hi)' : 'var(--color-bg-glass)',
            borderColor: focused ? 'var(--color-border-strong)' : 'var(--color-border)',
            boxShadow: focused ? '0 0 0 3px var(--color-brand-soft)' : 'none',
          }}
        >
          <Search size={13} className="absolute left-3" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Rechercher carte, set, transaction…"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full h-full pl-9 pr-16 bg-transparent text-[13px] outline-none"
            style={{ color: 'var(--color-text-primary)' }}
          />
          <kbd
            className="absolute right-2.5 flex items-center gap-0.5 h-5 px-1.5 rounded text-[10px] font-medium border"
            style={{
              borderColor: 'var(--color-border)',
              background: 'var(--color-bg-glass)',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Command size={9} strokeWidth={2.5} />K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:block">
          <DailyBar compact />
        </div>

        <BalancePill />

        <button
          className="relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center border transition-all duration-150 hover:bg-[var(--color-bg-glass-hi)]"
          style={{
            borderColor: 'var(--color-border)',
            background: 'var(--color-bg-glass)',
            color: 'var(--color-text-secondary)',
          }}
          title="Alertes"
        >
          <Bell size={14} strokeWidth={2} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full pulse-live"
            style={{ background: 'var(--color-negative)', boxShadow: '0 0 8px var(--color-negative-glow)' }}
          />
        </button>
      </div>
    </div>
  )
}
