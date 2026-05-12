import Link from 'next/link'
import { Check, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react'

export const metadata = {
  title: 'Tarifs · CardFolio',
  description: 'Gratuit pour démarrer. Pro pour les vrais collectionneurs. Trader pour les pros du flip.',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'Gratuit pour toujours',
    desc: 'Pour découvrir l\'app.',
    cta: 'Créer un compte',
    highlight: false,
    features: [
      { txt: 'Jusqu\'à 50 cartes',          ok: true },
      { txt: 'Wishlist illimitée',           ok: true },
      { txt: 'Profil public',                ok: true },
      { txt: 'Prix Cardmarket (mis à jour 1×/jour)', ok: true },
      { txt: 'Alertes prix',                 ok: false },
      { txt: 'Insights avancés',             ok: false },
      { txt: 'Export CSV / PDF',             ok: false },
      { txt: 'Multi-devises',                ok: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '4,99',
    period: '/ mois',
    desc: 'Pour les vrais collectionneurs.',
    cta: 'Essayer 14 jours gratuit',
    highlight: true,
    badge: 'Le plus choisi',
    features: [
      { txt: 'Cartes illimitées',                    ok: true },
      { txt: 'Wishlist illimitée + alertes mail',    ok: true },
      { txt: 'Profil public + suivis',               ok: true },
      { txt: 'Prix synchronisés 4×/jour',            ok: true },
      { txt: 'Alertes prix push (mobile)',           ok: true },
      { txt: 'Insights avancés (heatmap, charts)',   ok: true },
      { txt: 'Export CSV / PDF',                     ok: true },
      { txt: 'API publique',                         ok: false },
    ],
  },
  {
    id: 'trader',
    name: 'Trader',
    price: '14,99',
    period: '/ mois',
    desc: 'Pour les pros du flip.',
    cta: 'Devenir Trader',
    highlight: false,
    features: [
      { txt: 'Tout du plan Pro',                          ok: true },
      { txt: 'Prix synchronisés en temps réel',           ok: true },
      { txt: 'Alertes en temps réel (websocket)',         ok: true },
      { txt: 'Multi-devises (EUR, USD, GBP)',             ok: true },
      { txt: 'API publique (10k req/jour)',               ok: true },
      { txt: 'Webhooks (Zapier, Make, n8n)',              ok: true },
      { txt: 'Support prioritaire (réponse < 4h)',        ok: true },
      { txt: 'Historique illimité (tous les snapshots)',  ok: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>

      {/* Nav */}
      <nav className="px-6 md:px-10 py-5 border-b sticky top-0 z-30"
        style={{
          background: 'rgba(5,7,16,0.72)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--color-border)',
        }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[12px] font-extrabold"
              style={{
                fontFamily: 'var(--font-display)',
                background: 'linear-gradient(140deg, var(--color-brand), var(--color-cyan))',
                boxShadow: '0 0 16px var(--color-brand-glow)',
              }}>CF</div>
            <span className="text-[15px] font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>CardFolio</span>
          </Link>
          <Link href="/signup"
            className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 16px var(--color-brand-glow)' }}>
            Commencer<ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 md:px-10 pt-16 md:pt-24 pb-12 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--color-brand-hi)' }}>
          Tarification simple
        </p>
        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
          Le plan qui te ressemble
        </h1>
        <p className="text-[15px] max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Gratuit pour démarrer. Annulable à tout moment, sans engagement.
        </p>
      </section>

      {/* Plans */}
      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const Icon = plan.id === 'free' ? Sparkles : plan.id === 'pro' ? Crown : Zap
            return (
              <div key={plan.id}
                className="rounded-[var(--radius-lg)] border p-7 relative flex flex-col"
                style={{
                  background: plan.highlight
                    ? 'linear-gradient(135deg, rgba(42,125,255,0.15), rgba(0,212,255,0.08), rgba(11,15,26,0.7))'
                    : 'var(--color-bg-glass)',
                  borderColor: plan.highlight ? 'var(--color-brand)' : 'var(--color-border-strong)',
                  boxShadow: plan.highlight
                    ? 'var(--shadow-lg), 0 0 40px var(--color-brand-glow)'
                    : 'var(--shadow-sm)',
                }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', color: 'white', boxShadow: '0 0 16px var(--color-brand-glow)' }}>
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center"
                    style={{
                      background: plan.id === 'free' ? 'var(--color-bg-glass-hi)' : plan.id === 'pro' ? 'var(--color-pokemon-yellow-soft)' : 'var(--color-brand-soft)',
                      color: plan.id === 'free' ? 'var(--color-text-secondary)' : plan.id === 'pro' ? 'var(--color-pokemon-yellow)' : 'var(--color-brand)',
                    }}>
                    <Icon size={14} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-[20px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    {plan.name}
                  </h3>
                </div>

                <p className="text-[12.5px] mb-6" style={{ color: 'var(--color-text-secondary)' }}>{plan.desc}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[40px] font-extrabold leading-none" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
                      {plan.price === '0' ? '0 €' : `${plan.price} €`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>{plan.period}</span>
                    )}
                  </div>
                  {plan.price === '0' && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>{plan.period}</p>
                  )}
                </div>

                <Link href="/signup"
                  className="flex items-center justify-center gap-2 h-11 px-4 rounded-[var(--radius-sm)] text-[13px] font-bold mb-6 transition-all hover:-translate-y-px"
                  style={{
                    background: plan.highlight ? 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))' : 'var(--color-bg-glass-hi)',
                    color: plan.highlight ? 'white' : 'var(--color-text-primary)',
                    boxShadow: plan.highlight ? '0 0 16px var(--color-brand-glow)' : 'none',
                    border: plan.highlight ? 'none' : '1px solid var(--color-border)',
                  }}>
                  {plan.cta}
                </Link>

                <ul className="flex flex-col gap-2.5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px]"
                      style={{ color: f.ok ? 'var(--color-text-primary)' : 'var(--color-text-subtle)' }}>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: f.ok ? 'var(--color-positive-soft)' : 'transparent',
                          color: f.ok ? 'var(--color-positive)' : 'var(--color-text-subtle)',
                        }}>
                        {f.ok ? <Check size={9} strokeWidth={3} /> : <span className="text-[10px]">—</span>}
                      </div>
                      <span style={{ textDecoration: f.ok ? 'none' : 'line-through' }}>{f.txt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <p className="text-center text-[12px] mt-8" style={{ color: 'var(--color-text-muted)' }}>
          Tous les plans incluent : 100% RGPD · Hébergement EU · Annulable en 1 clic
        </p>
      </section>

      {/* FAQ */}
      <section className="px-6 md:px-10 py-16 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[24px] md:text-[32px] font-extrabold tracking-tight mb-8 text-center"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.025em' }}>
            Questions fréquentes
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { q: 'Puis-je annuler à tout moment ?',
                a: 'Oui. Aucun engagement. Tu peux annuler ton abonnement Pro ou Trader en 1 clic depuis tes paramètres. Tu gardes l\'accès jusqu\'à la fin de la période payée.' },
              { q: 'Comment sont calculés les prix ?',
                a: 'On synchronise les prix avec Cardmarket (la référence européenne) et eBay sold listings (médiane des 30 derniers jours). En Pro, mise à jour 4×/jour. En Trader, en temps réel.' },
              { q: 'Mes données sont-elles privées ?',
                a: 'Par défaut, ta collection est privée. Tu peux activer le profil public si tu veux la partager. Tes prix d\'achat ne sont jamais visibles publiquement.' },
              { q: 'Puis-je importer ma collection depuis ailleurs ?',
                a: 'Oui (sur les plans Pro et Trader). On supporte les exports CSV de Cardmarket, MyTCG, et bientôt eBay.' },
              { q: 'Les produits scellés sont-ils inclus ?',
                a: 'Oui. Ajoute tes displays, ETB, coffrets avec ta propre photo. Le prix est libre (pas de cote officielle).' },
            ].map(({ q, a }, i) => (
              <details key={i} className="group rounded-[var(--radius-md)] border p-4 transition-colors"
                style={{ background: 'var(--color-bg-glass)', borderColor: 'var(--color-border)' }}>
                <summary className="cursor-pointer flex items-center justify-between text-[13.5px] font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {q}
                  <span className="text-[18px] transition-transform group-open:rotate-45" style={{ color: 'var(--color-text-muted)' }}>+</span>
                </summary>
                <p className="text-[12.5px] mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 md:px-10 py-10 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <span className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            © 2026 CardFolio
          </span>
          <div className="flex items-center gap-5 text-[12px]">
            <Link href="/" style={{ color: 'var(--color-text-muted)' }}>Accueil</Link>
            <Link href="/privacy" style={{ color: 'var(--color-text-muted)' }}>Confidentialité</Link>
            <Link href="/terms" style={{ color: 'var(--color-text-muted)' }}>CGU</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
