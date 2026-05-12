import Link from 'next/link'
import { Sparkles, Home, ArrowRight } from 'lucide-react'

export const metadata = { title: '404 · Page introuvable' }

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Sparkles size={48} strokeWidth={1.5} className="mx-auto mb-6"
          style={{ color: 'var(--color-pokemon-yellow)' }}/>
        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2"
          style={{ color: 'var(--color-brand-hi)' }}>
          Erreur 404
        </p>
        <h1 className="text-[40px] font-extrabold leading-none mb-3"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
          Cette caisse n&apos;existe pas
        </h1>
        <p className="text-[14px] leading-relaxed mb-8"
          style={{ color: 'var(--color-text-secondary)' }}>
          La page que tu cherches a peut-être été déplacée, supprimée,
          ou n&apos;a jamais existé. Reviens à l&apos;accueil pour ouvrir une vraie caisse.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/game"
            className="flex items-center gap-2 h-11 px-5 rounded-[var(--radius-sm)] text-[13px] font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
              boxShadow: '0 0 16px var(--color-brand-glow)',
            }}>
            <Sparkles size={13} />
            Aller au jeu
            <ArrowRight size={13} />
          </Link>
          <Link href="/"
            className="flex items-center gap-2 h-11 px-5 rounded-[var(--radius-sm)] border text-[13px] font-semibold"
            style={{
              background: 'var(--color-bg-glass)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}>
            <Home size={13} />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
