'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gamepad2, Swords, Trophy, Archive, User } from 'lucide-react'

const NAV = [
  { href: '/game',             icon: Gamepad2, label: 'Jeu', accent: true },
  { href: '/game/battle',      icon: Swords,   label: 'Battles' },
  { href: '/game/jackpot',     icon: Trophy,   label: 'Jackpot' },
  { href: '/game/collection',  icon: Archive,  label: 'Collec' },
  { href: '/game/profile',     icon: User,     label: 'Profil' },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex items-center justify-around px-2 py-2 border-t"
      style={{
        background: 'rgba(5,7,16,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
      }}
    >
      {NAV.map(({ href, icon: Icon, label, accent }) => {
        // /game match strict (sinon /game/battle activerait aussi /game)
        const isActive = href === '/game'
          ? pathname === '/game' || pathname === '/game/open' || pathname.startsWith('/game/open/')
          : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-[var(--radius-sm)] transition-all relative"
            style={{
              color: isActive
                ? 'var(--color-text-primary)'
                : 'var(--color-text-muted)',
            }}
          >
            {isActive && (
              <span
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                style={{ background: 'var(--color-brand)', boxShadow: '0 0 8px var(--color-brand-glow)' }}
              />
            )}
            <div
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
              style={{
                background: accent && !isActive
                  ? 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))'
                  : isActive
                    ? 'var(--color-brand-soft)'
                    : 'transparent',
                color: accent && !isActive ? 'white' : undefined,
                boxShadow: isActive ? '0 0 12px var(--color-brand-glow)' : 'none',
              }}
            >
              <Icon size={accent && !isActive ? 16 : 16} strokeWidth={isActive ? 2.2 : 1.8} />
            </div>
            <span className="text-[9px] font-semibold tracking-tight">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
