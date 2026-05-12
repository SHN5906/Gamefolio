import Link from "next/link";
import { LogoMark, LogoWordmark } from "@/components/ui/Logo";
import { LiveWinsTicker } from "@/components/game/LiveWinsTicker";
import { JackpotCounter } from "@/components/game/JackpotCounter";
import {
  Package,
  Target,
  Swords,
  Trophy,
  Wand2,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "GameFolio — Ouvre des caisses TCG, sans débourser un centime",
  description:
    "Le casino TCG en monnaie fictive. Caisses, roue d'upgrade, battles PvP, jackpot communautaire. $10 offerts à l'inscription, gratuit à vie.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen relative" style={{ zIndex: 1 }}>
      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav
        className="px-6 md:px-10 py-5 border-b sticky top-0 z-30"
        style={{
          background: "rgba(5,7,16,0.72)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark size={36} alt="" />
            <LogoWordmark height={20} />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link
              href="#features"
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Modes de jeu
            </Link>
            <Link
              href="#how"
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Comment ça marche
            </Link>
            <Link
              href="/pricing"
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              VIP
            </Link>
            <Link
              href="#faq"
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              FAQ
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] hidden sm:inline"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Connexion
            </Link>
            <Link
              href="/game"
              className="flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-sm)] text-[13px] font-bold text-white transition-all hover:-translate-y-px"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
                boxShadow: "0 0 16px var(--color-brand-glow)",
              }}
            >
              Jouer gratuit
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── LIVE WINS TICKER (sous nav, full-width) ─────────────── */}
      <LiveWinsTicker />

      {/* ── HERO (asymmetric : text left, jackpot right) ───────────── */}
      <section className="px-6 md:px-10 pt-12 md:pt-16 pb-16">
        <div className="max-w-6xl mx-auto grid gap-10 lg:gap-14 lg:grid-cols-[1.1fr_1fr] items-center">
          {/* LEFT — text + CTAs */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold mb-6 border uppercase tracking-[1.5px]"
              style={{
                background: "rgba(0,255,140,0.06)",
                borderColor: "rgba(0,255,140,0.3)",
                color: "#00FF88",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full pulse-live"
                style={{ background: "#00FF88", boxShadow: "0 0 8px #00FF88" }}
              />
              1 247 joueurs en ligne · maintenant
            </div>

            <h1
              className="text-[44px] md:text-[72px] font-extrabold tracking-tight leading-[1.02] mb-5"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.04em",
              }}
            >
              Ouvre des caisses.
              <br />
              <span className="gradient-text italic">Pas ta CB.</span>
            </h1>

            <p
              className="text-[16px] md:text-[18px] max-w-xl leading-relaxed mb-7"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Le casino TCG en monnaie fictive — caisses, roue d&apos;upgrade,
              battles PvP, jackpot communautaire. $10 fictifs offerts à
              l&apos;inscription. Aucune CB, jamais.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
              <Link
                href="/game"
                className="flex items-center gap-2 h-12 px-7 rounded-[var(--radius-sm)] text-[14px] font-extrabold text-white transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
                  boxShadow: "0 0 28px var(--color-brand-glow)",
                  fontFamily: "var(--font-display)",
                  letterSpacing: "0.01em",
                }}
              >
                <Zap size={14} fill="white" strokeWidth={0} />
                Jouer maintenant
                <ArrowRight size={14} />
              </Link>
              <Link
                href="#features"
                className="flex items-center gap-2 h-12 px-5 rounded-[var(--radius-sm)] text-[13px] font-semibold border transition-colors"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                Voir les modes de jeu
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {[
                "100% monnaie fictive",
                "Aucune CB requise",
                "18+",
                "Conforme loi française",
              ].map((t) => (
                <span
                  key={t}
                  className="text-[11px] flex items-center gap-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "var(--color-text-subtle)" }}
                  />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT — jackpot live counter (le drama est ici) */}
          <div className="relative">
            <div
              className="absolute -inset-8 rounded-[24px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(255,215,64,0.18) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              <JackpotCounter />
              <p
                className="text-center text-[11px] mt-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                Le pot communautaire en monnaie fictive. Tirage proportionnel à
                la valeur déposée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPTEUR SOCIAL ─────────────────────────────────────── */}
      <section
        className="px-6 md:px-10 py-12 border-y"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "1,2 M", label: "Caisses ouvertes" },
            { value: "$8,4 M", label: "Cartes gagnées (fictif)" },
            { value: "47 K", label: "Joueurs actifs" },
            { value: "$4 832", label: "Top win 24h" },
          ].map((s) => (
            <div key={s.label}>
              <p
                className="text-[28px] md:text-[36px] font-extrabold leading-none mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.025em",
                  color: "var(--color-text-primary)",
                }}
              >
                {s.value}
              </p>
              <p
                className="text-[11px] uppercase tracking-[1.5px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" className="px-6 md:px-10 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2"
              style={{ color: "var(--color-brand-hi)" }}
            >
              Modes de jeu
            </p>
            <h2
              className="text-[36px] md:text-[44px] font-extrabold tracking-tight leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.025em",
              }}
            >
              Six manières de jouer.
              <br />
              Une seule règle : zéro centime.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Package,
                title: "Caisses thématiques",
                desc: "Kanto, Neo, Shinings, Cristaux, Gold Star, VMAX. Chaque caisse a sa drop table et ses variantes PSA Raw → PSA 10.",
                color: "var(--color-brand)",
                bg: "var(--color-brand-soft)",
              },
              {
                icon: Target,
                title: "Roue d'upgrade",
                desc: "Mise tes cartes, choisis une cible plus chère. La probabilité = (mise × 0,92) / cible. Style L-Case, mais avec du TCG.",
                color: "var(--color-cyan)",
                bg: "var(--color-cyan-soft)",
              },
              {
                icon: Swords,
                title: "Battles PvP",
                desc: "Affronte un autre joueur sur la même caisse. Le meilleur drop rafle les deux récompenses. Live, en temps réel.",
                color: "var(--color-negative)",
                bg: "var(--color-negative-soft)",
              },
              {
                icon: Trophy,
                title: "Jackpot communautaire",
                desc: "Dépose des cartes dans le pot, le tirage est proportionnel à la valeur déposée. Pot reset toutes les 10 min.",
                color: "var(--color-pokemon-yellow)",
                bg: "var(--color-pokemon-yellow-soft)",
              },
              {
                icon: Wand2,
                title: "Re-gradation",
                desc: "Pour $20, retente la gradation PSA d'une carte. Tu peux monter, tomber, ou perdre la gradation. Risk/reward pur.",
                color: "#FFB450",
                bg: "rgba(255,180,80,0.12)",
              },
              {
                icon: Calendar,
                title: "Missions journalières",
                desc: "Connecte-toi, ouvre, battle, gagne. Chaque mission paie en monnaie fictive. Streak de 7 jours = bonus.",
                color: "var(--color-positive)",
                bg: "var(--color-positive-soft)",
              },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-[var(--radius-md)] border p-6 transition-all card-lift"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center mb-4"
                  style={{ background: bg, color }}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>
                <h3
                  className="text-[16px] font-bold mb-1.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section
        id="how"
        className="px-6 md:px-10 py-20 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-2"
              style={{ color: "var(--color-brand-hi)" }}
            >
              Démarrer
            </p>
            <h2
              className="text-[32px] md:text-[40px] font-extrabold tracking-tight leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.025em",
              }}
            >
              Trois étapes, trente secondes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                num: "01",
                title: "Crée ton compte",
                desc: "Juste un email. Pas de CB, jamais. Vérification optionnelle.",
              },
              {
                num: "02",
                title: "Récupère tes $10 offerts",
                desc: "Crédités automatiquement. Si tu tombes à 0, cooldown 2h puis $5 rebonus.",
              },
              {
                num: "03",
                title: "Ouvre ta première caisse",
                desc: "Choisis ta caisse. La carte ET son grade PSA sont tirés au sort.",
              },
            ].map(({ num, title, desc }) => (
              <div
                key={num}
                className="rounded-[var(--radius-md)] border p-6"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                }}
              >
                <p
                  className="text-[36px] font-extrabold leading-none mb-3"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-brand)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {num}
                </p>
                <h3
                  className="text-[16px] font-bold mb-1.5"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h3>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVABLY FAIR / TRUST ────────────────────────────────── */}
      <section
        className="px-6 md:px-10 py-16 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="max-w-4xl mx-auto rounded-[var(--radius-lg)] border p-8 md:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(16,217,140,0.06), rgba(11,15,26,0.4))",
            borderColor: "var(--color-border-strong)",
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-[var(--radius-sm)] flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--color-positive-soft)",
                color: "var(--color-positive)",
              }}
            >
              <ShieldCheck size={20} strokeWidth={2} />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-1.5"
                style={{ color: "var(--color-positive)" }}
              >
                Provably fair · 100% monnaie fictive
              </p>
              <h3
                className="text-[20px] md:text-[24px] font-extrabold tracking-tight leading-tight mb-3"
                style={{
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                }}
              >
                Aucun argent réel. Jamais.
              </h3>
              <p
                className="text-[14px] leading-relaxed mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                GameFolio est un jeu en monnaie fictive uniquement. Tu ne peux
                ni déposer ni retirer d&apos;argent réel. Les cartes gagnées
                restent dans ton inventaire virtuel — elles ne peuvent pas être
                échangées contre des biens IRL. Chaque tirage est généré côté
                serveur avec un RNG cryptographique et est auditable.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "18+ uniquement",
                  "RNG côté serveur",
                  "Logs d'audit",
                  "Conforme loi française",
                  "RGPD · EU",
                ].map((b) => (
                  <span
                    key={b}
                    className="px-2.5 py-1 rounded-full text-[10.5px] font-semibold border"
                    style={{
                      background: "var(--color-bg-glass)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="px-6 md:px-10 py-20 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-tight mb-10 text-center"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.025em",
            }}
          >
            Questions fréquentes
          </h2>
          <div className="flex flex-col gap-3">
            {[
              {
                q: "Est-ce que je peux gagner de l'argent réel ?",
                a: "Non. GameFolio est en monnaie fictive uniquement. Les cartes que tu gagnes restent dans ton inventaire virtuel et ne peuvent ni être revendues ni converties en euros.",
              },
              {
                q: "C'est légal en France ?",
                a: "Oui. Le droit français autorise les jeux en monnaie fictive sans retrait IRL (art. 322-2-3 du Code de la sécurité intérieure). Par précaution, l'accès est interdit aux moins de 18 ans et géo-bloqué dans les pays qui interdisent les loot box (Belgique, Pays-Bas).",
              },
              {
                q: "Comment vous gagnez de l'argent alors ?",
                a: "Pour l'instant rien — on est en mode acquisition gratuite. À terme : tier VIP (cosmétiques, animations exclusives, badges, capacité de stockage), pas de pay-to-win.",
              },
              {
                q: "Et si je tombe à 0 $ fictif ?",
                a: "Cooldown de 2 heures, puis tu reçois 5 $ fictifs offerts pour rejouer. Tu peux aussi revendre tes cartes (valeur marché du grade) à tout moment.",
              },
              {
                q: "Comment je sais que les tirages ne sont pas truqués ?",
                a: "Chaque tirage est exécuté côté serveur avec un RNG cryptographique (crypto.getRandomValues), pas dans ton navigateur. Le hash de la seed et le résultat sont logués pour audit — tu peux demander la trace de n'importe quel tirage.",
              },
              {
                q: "Pourquoi vous avez des cartes Pokémon ?",
                a: "« Pokémon » est une marque de Nintendo / Game Freak / Creatures Inc. GameFolio n'est pas affilié. Les images viennent de TCGdex (base publique). On précise les noms à titre informatif uniquement.",
              },
            ].map(({ q, a }, i) => (
              <details
                key={i}
                className="group rounded-[var(--radius-md)] border p-4"
                style={{
                  background: "var(--color-bg-glass)",
                  borderColor: "var(--color-border)",
                }}
              >
                <summary
                  className="cursor-pointer flex items-center justify-between text-[13.5px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {q}
                  <span
                    className="text-[18px] transition-transform group-open:rotate-45"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    +
                  </span>
                </summary>
                <p
                  className="text-[12.5px] mt-3 leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────── */}
      <section className="px-6 md:px-10 py-20">
        <div
          className="max-w-3xl mx-auto rounded-[var(--radius-lg)] border p-10 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(42,125,255,0.15) 0%, rgba(0,212,255,0.08) 50%, rgba(11,15,26,0.6) 100%)",
            borderColor: "var(--color-border-strong)",
            boxShadow:
              "0 24px 60px rgba(0,0,0,0.5), 0 0 60px var(--color-brand-glow)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(42,125,255,0.6), transparent)",
            }}
          />
          <Sparkles
            size={28}
            strokeWidth={1.8}
            className="mx-auto mb-4"
            style={{ color: "var(--color-pokemon-yellow)" }}
          />
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-tight mb-3"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.025em",
            }}
          >
            Prêt à ouvrir ta première caisse ?
          </h2>
          <p
            className="text-[14px] mb-6 max-w-md mx-auto"
            style={{ color: "var(--color-text-secondary)" }}
          >
            $10 offerts. Aucune CB. Pas d&apos;arnaque, pas de pop-up.
          </p>
          <Link
            href="/game"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[var(--radius-sm)] text-[14px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
              boxShadow: "0 0 24px var(--color-brand-glow)",
            }}
          >
            Jouer maintenant — Gratuit
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer
        className="px-6 md:px-10 py-10 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} alt="" />
            <span
              className="text-[12px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              © 2026 GameFolio · Jeu en monnaie fictive · 18+
            </span>
          </div>
          <div className="flex items-center gap-5 text-[12px]">
            <Link href="/pricing" style={{ color: "var(--color-text-muted)" }}>
              VIP
            </Link>
            <Link href="/privacy" style={{ color: "var(--color-text-muted)" }}>
              Confidentialité
            </Link>
            <Link href="/terms" style={{ color: "var(--color-text-muted)" }}>
              CGU
            </Link>
            <a
              href="mailto:hello@gamefolio.app"
              style={{ color: "var(--color-text-muted)" }}
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
