import Link from 'next/link'
import { Check, ArrowRight, Sparkles, Crown, Zap } from 'lucide-react'

export const metadata = {
  title: 'VIP · GameFolio',
  description: 'GameFolio est gratuit pour toujours. Les tiers VIP débloquent du cosmétique, du QoL et des bonus de wallet — strictement aucun pay-to-win.',
}

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    period: 'Gratuit pour toujours',
    desc: 'Le jeu complet, zéro friction.',
    cta: 'Jouer maintenant',
    highlight: false,
    features: [
      { txt: '$10 offerts à l\'inscription',           ok: true },
      { txt: '15 caisses thématiques',                 ok: true },
      { txt: 'Roue d\'upgrade, battles, jackpot',      ok: true },
      { txt: 'Re-gradation des cartes',                ok: true },
      { txt: 'Cooldown 2h quand wallet à zéro',        ok: true },
      { txt: 'Cosmétiques exclusifs',                  ok: false },
      { txt: 'Badge VIP profil',                       ok: false },
      { txt: 'Bonus wallet quotidien',                 ok: false },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: '4,99',
    period: '/ mois',
    desc: 'Pour jouer plus, sans payer la victoire.',
    cta: 'Devenir Plus',
    highlight: true,
    badge: 'Le plus choisi',
    features: [
      { txt: 'Tout du Free',                            ok: true },
      { txt: 'Bonus quotidien $5 fictif',               ok: true },
      { txt: 'Cooldown réduit à 1h',                    ok: true },
      { txt: 'Avatar personnalisé + cadre',             ok: true },
      { txt: 'Badge Plus dans le profil',               ok: true },
      { txt: 'Historique d\'ouvertures illimité',       ok: true },
      { txt: 'Pas de retrait IRL — strictement cosmétique', ok: true },
      { txt: 'Animations exclusives VIP',               ok: false },
    ],
  },
  {
    id: 'vip',
    name: 'VIP',
    price: '14,99',
    period: '/ mois',
    desc: 'Le tier flex — purement cosmétique.',
    cta: 'Devenir VIP',
    highlight: false,
    features: [
      { txt: 'Tout du Plus',                            ok: true },
      { txt: 'Bonus quotidien $25 fictif',              ok: true },
      { txt: 'Cooldown réduit à 15 min',                ok: true },
      { txt: 'Animations d\'ouverture exclusives',      ok: true },
      { txt: 'Effet lumineux sur le pseudo (leaderboard, battles, chat)', ok: true },
      { txt: 'Accès anticipé aux nouvelles caisses',    ok: true },
      { txt: 'Support prioritaire (< 4h)',              ok: true },
      { txt: 'Pas de retrait IRL — strictement cosmétique', ok: true },
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
              }}>GF</div>
            <span className="text-[15px] font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>GameFolio</span>
          </Link>
          <Link href="/game"
            className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-cyan))', boxShadow: '0 0 16px var(--color-brand-glow)' }}>
            Jouer gratuit<ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="px-6 md:px-10 pt-16 md:pt-24 pb-12 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2" style={{ color: 'var(--color-brand-hi)' }}>
          VIP · Cosmétique, jamais pay-to-win
        </p>
        <h1 className="text-[40px] md:text-[56px] font-extrabold tracking-tight leading-tight mb-4"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
          Le jeu reste gratuit
        </h1>
        <p className="text-[15px] max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          GameFolio est gratuit à 100%. Les tiers VIP donnent uniquement du cosmétique
          et un peu de QoL — aucun avantage de gameplay. Annulable en 1 clic, sans engagement.
        </p>
      </section>

      {/* Plans */}
      <section className="px-6 md:px-10 pb-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const Icon = plan.id === 'free' ? Sparkles : plan.id === 'plus' ? Crown : Zap
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
                      background: plan.id === 'free' ? 'var(--color-bg-glass-hi)' : plan.id === 'plus' ? 'var(--color-pokemon-yellow-soft)' : 'var(--color-brand-soft)',
                      color: plan.id === 'free' ? 'var(--color-text-secondary)' : plan.id === 'plus' ? 'var(--color-pokemon-yellow)' : 'var(--color-brand)',
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

                <Link href={plan.id === 'free' ? '/game' : '/signup'}
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
          Paiements Stripe (PCI-DSS) · Annulable en 1 clic · Aucune monnaie fictive ne peut être convertie en argent réel
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
              {
                q: 'Le VIP donne-t-il un avantage de gameplay ?',
                a: 'Non. Les bonus quotidiens et le cooldown réduit sont du QoL, pas du gameplay. Les drop rates des caisses, la roue, les battles et le jackpot fonctionnent à l\'identique pour tous les joueurs. Les cosmétiques (animations, cadres avatar, glow pseudo) ne changent rien aux probabilités.',
              },
              {
                q: 'Puis-je annuler à tout moment ?',
                a: 'Oui. Aucun engagement. Annulation en 1 clic depuis tes paramètres. Tu gardes l\'accès VIP jusqu\'à la fin de la période payée.',
              },
              {
                q: 'Est-ce que la monnaie fictive achetée peut être retirée ?',
                a: 'Non. La monnaie fictive ne peut JAMAIS être convertie en argent réel ou échangée contre des biens IRL. C\'est ce qui rend le produit légal en France.',
              },
              {
                q: 'Pourquoi pas de pack de monnaie fictive vendu directement ?',
                a: 'Pour rester strictement cosmétique. Vendre de la monnaie fictive utilisable pour jouer ferait basculer le produit en jeu d\'argent au sens de l\'ANJ (Autorité Nationale des Jeux). Nous refusons ce modèle.',
              },
              {
                q: 'Période d\'essai ?',
                a: 'Pas d\'essai gratuit. Le tier Free est déjà très complet : si tu n\'es pas convaincu après 50 ouvertures, le VIP ne te convaincra pas non plus.',
              },
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
            © 2026 GameFolio · Jeu en monnaie fictive · 18+
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
