'use client'

import type { ReactNode } from 'react'

interface StatTileProps {
  icon: ReactNode
  label: string
  value: string
  sub?: string
  color: string
  bg: string
  size?: 'sm' | 'md'
}

export function StatTile({ icon, label, value, sub, color, bg, size = 'md' }: StatTileProps) {
  const padding = size === 'sm' ? 'p-3' : 'p-4'
  const iconSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const valueSize = size === 'sm' ? 'text-[15px]' : 'text-[16px]'

  return (
    <div
      className={`rounded-[var(--radius-md)] border ${padding}`}
      style={{
        background: 'var(--color-bg-glass)',
        borderColor: 'var(--color-border)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        className={`${iconSize} rounded-[var(--radius-sm)] flex items-center justify-center mb-2 border`}
        style={{ background: bg, borderColor: 'rgba(255,255,255,0.06)', color }}
      >
        {icon}
      </div>
      <p
        className="text-[9.5px] font-semibold uppercase tracking-[1px] mb-1"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </p>
      <p
        className={`${valueSize} font-bold leading-tight tabular-nums`}
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[10.5px] mt-1"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
