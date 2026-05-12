import Link from 'next/link'
import {
  TrendingUp, BarChart3, Bell, Globe2, Heart, Sparkles,
  ArrowRight, ArrowUpRight, TrendingDown,
} from 'lucide-react'

export const metadata = {
  title: 'GameFolio — Ouvre des caisses Pokémon, $10 offerts',
  description: 'Le casino TCG Pokémon : 15 caisses, battles PvP, jackpot communautaire. $10 offerts à l\'inscription. 50 caisses gratuites par jour.',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>

      {/* ── NAV ── */}
      <nav className="px-6 md:px-10 py-5 border-b sticky top-0 z-30"
        style={{
          background: 'rgba(5,7,16,0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[12px] font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(140deg, var(--color-brand), var(--color-cyan))',
                boxShadow: '0 0 16px var(--color-brand-glow)',
              }}
            >
              CF
            </div>
            <span className="text-[15px] font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
              CardFolio
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link href="#features" className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Fonctionnalités</Link>
            <Link href="/pricing" className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Tarifs</Link>
            <Link href="/u/hugo_marceau" className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>Démo</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] hidden sm:inline" style={{ color: 'var(--color-text-secondary)' }}>
              Connexion
            </Link>
            <Link
              href="/game"
              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-bold text-white transition-all hover:-translate-y-px"
              style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 16px var(--color-brand-glow)' }}
            >
              Commencer
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="px-6 md:px-10 pt-16 md:pt-24 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-6 border"
            style={{ background: 'var(--color-brand-soft)', borderColor: 'rgba(42,125,255,0.3)', color: 'var(--color-brand-hi)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: 'var(--color-positive)' }} />
            Live · Cardmarket synchronisé toutes les 6h
          </div>

          <h1 className="text-[40px] md:text-[68px] font-extrabold tracking-tight leading-[1.05] mb-5"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.035em' }}
          >
            Ta collection Pokémon,
            <br />
            <span className="gradient-text">en portefeuille.</span>
          </h1>

          <p className="text-[16px] md:text-[18px] max-w-2xl mx-auto leading-relaxed mb-8"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Suis la valeur de tes cartes en temps réel. Comme un broker, mais pour Dracaufeu, Mewtwo et Lugia VSTAR.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Link
              href="/game"
              className="flex items-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] text-[14px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
                boxShadow: '0 0 24px var(--color-brand-glow)',
              }}
            >
              Créer mon portfolio gratuit
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/u/hugo_marceau"
              className="flex items-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] text-[14px] font-semibold border transition-colors"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Voir une démo
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            Pas de carte bancaire requise · Annulable en 1 clic · 100% RGPD
          </p>
        </div>

        {/* Hero mockup — mini-dashboard */}
        <div className="max-w-5xl mx-auto mt-16 relative">
          {/* Glow sous le mockup */}
          <div
            className="absolute -inset-4 rounded-[32px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(42,125,255,0.18) 0%, transparent 70%)' }}
          />
          <div
            className="relative rounded-[var(--radius-lg)] border overflow-hidden"
            style={{
              background: 'rgba(11,15,26,0.85)',
              borderColor: 'var(--color-border-strong)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Top edge highlight */}
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(42,125,255,0.5), rgba(0,212,255,0.3), transparent)' }} />

            {/* Barre de chrome du navigateur */}
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-negative)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-warning)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-positive)' }} />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-48 rounded-full flex items-center justify-center gap-1.5 border px-3"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--color-border)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-positive)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>cardfolio.app/dashboard</span>
                </div>
              </div>
            </div>

            {/* Contenu dashboard */}
            <div className="p-5 md:p-7">
              {/* Hero value */}
              <div
                className="rounded-[var(--radius-md)] border p-5 mb-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(42,125,255,0.08) 0%, rgba(0,212,255,0.03) 100%)',
                  borderColor: 'var(--color-border-strong)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-positive)', boxShadow: '0 0 6px var(--color-positive-glow)' }} />
                  <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                    Valeur du portefeuille · Live
                  </span>
                </div>
                <p className="text-[36px] md:text-[48px] font-extrabold leading-none mb-2"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '-2px', color: 'var(--color-text-primary)' }}
                >
                  4 832,50 €
                </p>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                  style={{
                    background: 'var(--color-positive-soft)',
                    borderColor: 'rgba(16,217,140,0.25)',
                    color: 'var(--color-positive)',
                  }}
                >
                  <TrendingUp size={10} strokeWidth={2.5} />
                  +342,80 € · +7,6% depuis l&apos;achat
                </span>
              </div>

              {/* Mini stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                {[
                  { label: 'Cartes', value: '147', color: 'var(--color-text-primary)' },
                  { label: 'Scellés', value: '12', color: 'var(--color-text-primary)' },
                  { label: 'Top asset', value: 'Dracaufeu', color: 'var(--color-brand-hi)' },
                  { label: 'Sets', value: '23', color: 'var(--color-text-primary)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-[var(--radius-sm)] border px-3 py-2.5"
                    style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}
                  >
                    <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                    <p className="text-[14px] font-bold truncate" style={{ fontFamily: 'var(--font-display)', color }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Mini top movers */}
              <div className="rounded-[var(--radius-sm)] border overflow-hidden"
                style={{ borderColor: 'var(--color-border)' }}
              >
                {[
                  { name: 'Dracaufeu VMAX', set: 'Épée et Bouclier', value: '189,90 €', pct: '+12,4%', up: true,  bg: 'linear-gradient(140deg, #7C2D12, #FF6B47)' },
                  { name: 'Mewtwo V',       set: 'Légendes Brillantes', value: '67,50 €', pct: '+5,2%', up: true,  bg: 'linear-gradient(140deg, #4338CA, #C77DFF)' },
                  { name: 'Lugia VSTAR',    set: 'Paradoxe Temporel', value: '43,20 €',  pct: '-2,1%', up: false, bg: 'linear-gradient(140deg, #374151, #D1D5DB)' },
                ].map((card, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0"
                    style={{ borderColor: 'var(--color-border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  >
                    <span className="text-[9px] w-4 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div
                      className="w-7 h-10 rounded-[4px] flex-shrink-0 border"
                      style={{
                        background: card.bg,
                        borderColor: 'rgba(255,255,255,0.12)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{card.name}</p>
                      <p className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{card.set}</p>
                    </div>
                    <span className="text-[11px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{card.value}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: card.up ? 'var(--color-positive-soft)' : 'var(--color-negative-soft)',
                        color: card.up ? 'var(--color-positive)' : 'var(--color-negative)',
                      }}
                    >
                      {card.pct}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="px-6 md:px-10 py-12 border-y" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-center mb-6"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Données synchronisées avec
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70">
            {['TCGdex', 'Cardmarket', 'PSA', 'eBay'].map(b => (
              <span key={b} className="text-[18px] font-extrabold tracking-tight"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-secondary)' }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--color-brand-hi)' }}>
              Tout pour ta collection
            </p>
            <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
            >
              Plus qu'un tracker.<br />
              Un véritable portefeuille.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: TrendingUp, title: 'Valorisation live',  desc: 'Prix Cardmarket synchronisés toutes les 6h. Variation 24h, 7j, 30j, 1 an.', color: 'var(--color-positive)', bg: 'var(--color-positive-soft)' },
              { icon: Bell,        title: 'Alertes prix',       desc: 'Notifications quand le prix passe sous ton seuil. Plus jamais de carte ratée.', color: 'var(--color-pokemon-yellow)', bg: 'var(--color-pokemon-yellow-soft)' },
              { icon: BarChart3,   title: 'Analytics avancées', desc: 'Heatmap performance, répartition par set/énergie/rareté, top movers.', color: 'var(--color-cyan)', bg: 'var(--color-cyan-soft)' },
              { icon: Sparkles,    title: 'Cartes + Scellés',   desc: 'Displays, ETB, coffrets : ajoute tes produits scellés avec photo perso.', color: 'var(--color-brand)', bg: 'var(--color-brand-soft)' },
              { icon: Heart,       title: 'Wishlist intelligente', desc: 'Définis budget max + seuil d\'alerte. Priorités : urgent, je veux, surveille.', color: 'var(--color-pink)', bg: 'var(--color-pink-soft)' },
              { icon: Globe2,      title: 'Profil public',      desc: 'Partage ta collection sur cardfolio.app/u/{ton-username}. Style et flex.', color: 'var(--color-purple)', bg: 'var(--color-purple-soft)' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="rounded-[var(--radius-md)] border p-6 transition-all card-lift"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}
              >
                <div className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center mb-4"
                  style={{ background: bg, color }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3 className="text-[16px] font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 md:px-10 py-20 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--color-brand-hi)' }}>
              Comment ça marche
            </p>
            <h2 className="text-[32px] md:text-[40px] font-extrabold tracking-tight leading-tight"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
            >
              3 étapes pour démarrer
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { num: '01', title: 'Créer ton compte',   desc: 'Email + mot de passe. C\'est gratuit, 30 secondes.' },
              { num: '02', title: 'Ajouter tes cartes', desc: 'Recherche dans la base TCGdex. Photos officielles haute qualité.' },
              { num: '03', title: 'Suivre la valeur',   desc: 'Dashboard temps réel. Alertes prix. Profil public à partager.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="rounded-[var(--radius-md)] border p-6"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}
              >
                <p className="text-[36px] font-extrabold leading-none mb-3"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-brand)', letterSpacing: '-0.03em' }}
                >
                  {num}
                </p>
                <h3 className="text-[16px] font-bold mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
                  {title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-6 md:px-10 py-20">
        <div className="max-w-3xl mx-auto rounded-[var(--radius-lg)] border p-10 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(42,125,255,0.15) 0%, rgba(0,212,255,0.08) 50%, rgba(11,15,26,0.6) 100%)',
            borderColor: 'var(--color-border-strong)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 60px var(--color-brand-glow)',
          }}
        >
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(42,125,255,0.6), transparent)' }}
          />
          <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight mb-3"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}
          >
            Prêt à transformer ta passion en portfolio ?
          </h2>
          <p className="text-[14px] mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Gratuit pour démarrer. Pro pour les vrais collectionneurs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/game"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] text-[14px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))',
                boxShadow: '0 0 24px var(--color-brand-glow)',
              }}
            >
              Créer mon portfolio
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] text-[14px] font-semibold border transition-colors"
              style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 md:px-10 py-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center text-white text-[11px] font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(140deg, var(--color-brand), var(--color-cyan))',
              }}
            >
              CF
            </div>
            <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
              © 2026 CardFolio · Made with 💙 in France
            </span>
          </div>
          <div className="flex items-center gap-5 text-[12px]">
            <Link href="/pricing" style={{ color: 'var(--color-text-muted)' }}>Tarifs</Link>
            <Link href="/privacy" style={{ color: 'var(--color-text-muted)' }}>Confidentialité</Link>
            <Link href="/terms" style={{ color: 'var(--color-text-muted)' }}>CGU</Link>
            <a href="mailto:hello@cardfolio.app" style={{ color: 'var(--color-text-muted)' }}>Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
