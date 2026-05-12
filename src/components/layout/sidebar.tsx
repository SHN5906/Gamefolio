'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2, Swords, Trophy, Archive, ShoppingCart, Gift, User } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useProfile } from '@/hooks/useGame'

const NAV = [
  { href: '/game',             icon: Gamepad2,    label: 'Jeu',        accent: true },
  { href: '/game/battle',      icon: Swords,      label: 'Battles' },
  { href: '/game/jackpot',     icon: Trophy,      label: 'Jackpot',    pro: true },
  { href: '/game/collection',  icon: Archive,     label: 'Ma collection' },
  { href: '/game/missions',    icon: Gift,        label: 'Missions' },
  { href: '/game/shop',        icon: ShoppingCart,label: 'Boutique' },
]

const FOOTER_NAV = [
  { href: '/game/profile', icon: User, label: 'Profil' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile } = useProfile()
  const displayName = profile.username || 'Dresseur'
  const initial = displayName.charAt(0).toUpperCase()
  const avatarColor = profile.avatarColor || '#2A7DFF'

  return (
    <aside
      className="w-[60px] flex-shrink-0 flex flex-col items-center py-4 gap-1.5 border-r z-10 relative"
      style={{
        borderColor: 'var(--color-border)',
        background: 'rgba(5,7,16,0.65)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Logo avec halo */}
      <Link
        href="/dashboard"
        className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-4 text-white text-[13px] font-extrabold flex-shrink-0 relative group"
        style={{
          fontFamily: 'var(--font-display)',
          background: 'linear-gradient(140deg, var(--color-brand) 0%, var(--color-cyan) 100%)',
          boxShadow: '0 0 20px var(--color-brand-glow), inset 0 1px 0 rgba(255,255,255,0.2)',
          letterSpacing: '-0.03em',
        }}
        title="CardFolio"
      >
        CF
        <span
          className="absolute inset-0 rounded-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: 'linear-gradient(140deg, var(--color-brand-hi), var(--color-cyan))',
            filter: 'blur(8px)',
            zIndex: -1,
          }}
        />
      </Link>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1">
        {NAV.map(({ href, icon: Icon, label, accent, pro }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={twMerge(
                'group relative w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-200',
                'border border-transparent',
                isActive
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
              )}
              style={{
                background: isActive ? 'var(--color-brand-soft)' : 'transparent',
                borderColor: isActive ? 'rgba(42,125,255,0.3)' : 'transparent',
                boxShadow: isActive ? '0 0 16px var(--color-brand-glow), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-bg-glass-hi)'
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              {/* Indicateur actif - barre verticale */}
              {isActive && (
                <span
                  className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{
                    background: 'var(--color-brand)',
                    boxShadow: '0 0 8px var(--color-brand-glow)',
                  }}
                />
              )}
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {/* Dot Pro */}
              {pro && !isActive && (
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{
                    background: 'var(--color-warning)',
                    boxShadow: '0 0 4px var(--color-warning)',
                  }}
                />
              )}

              {/* Tooltip */}
              <span
                className="absolute left-full ml-3 px-2 py-1 rounded-[6px] text-[11px] font-medium whitespace-nowrap opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-30 border"
                style={{
                  background: 'var(--color-bg-elevated)',
                  borderColor: 'var(--color-border-strong)',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-body)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex-1" />

      {/* Footer nav */}
      <nav className="flex flex-col items-center gap-1 mb-3">
        {FOOTER_NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className="group relative w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center transition-all duration-150"
              style={{
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                background: isActive ? 'var(--color-bg-glass-hi)' : 'transparent',
              }}
            >
              <Icon size={15} strokeWidth={1.8} />
            </Link>
          )
        })}
      </nav>

      {/* Avatar — clique pour aller au profil */}
      <Link
        href="/game/profile"
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold cursor-pointer transition-all relative group hover:scale-110"
        style={{
          fontFamily: 'var(--font-display)',
          background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}AA)`,
          boxShadow: `0 0 0 2px var(--color-bg-base), 0 0 12px ${avatarColor}80`,
        }}
        title={`${displayName} · Profil`}
        aria-label="Mon profil"
      >
        {initial}
        {/* Status dot */}
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{
            background: 'var(--color-positive)',
            borderColor: 'var(--color-bg-base)',
          }}
        />
        {/* Tooltip */}
        <span
          className="absolute left-full ml-3 px-2 py-1 rounded-[6px] text-[11px] font-medium whitespace-nowrap opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-30 border"
          style={{
            background: 'var(--color-bg-elevated)',
            borderColor: 'var(--color-border-strong)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {displayName}
        </span>
      </Link>
    </aside>
  )
}
