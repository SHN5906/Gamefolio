'use client'

import { Gift, Sparkles } from 'lucide-react'
import { useInventory } from '@/hooks/useGame'

interface DailyBarProps {
  compact?: boolean
}

export function DailyBar({ compact = false }: DailyBarProps) {
  const { count, totalValue } = useInventory()

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 h-9 rounded-[var(--radius-sm)] border"
        style={{
          background: 'var(--color-bg-glass)',
          borderColor: 'var(--color-border)',
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--color-pokemon-yellow)' }} />
        <span
          className="text-[12px] font-semibold tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
        >
          {count}
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(16,217,160,0.08), rgba(0,212,255,0.05))',
        borderColor: 'rgba(16,217,160,0.20)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center"
            style={{
              background: 'rgba(16,217,160,0.15)',
              border: '1px solid rgba(16,217,160,0.25)',
            }}
          >
            <Gift size={16} style={{ color: 'var(--color-positive)' }} />
          </div>
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.2px]"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Bonus de bienvenue
            </p>
            <p
              className="text-[15px] font-bold mt-0.5"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              $10 offerts à l&apos;inscription
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className="text-[10px] font-semibold uppercase tracking-[1.2px]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Collection
          </p>
          <p
            className="text-[14px] font-bold tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-positive)',
            }}
          >
            ${totalValue.toFixed(2)} · {count} cartes
          </p>
        </div>
      </div>
    </div>
  )
}
