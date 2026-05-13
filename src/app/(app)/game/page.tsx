"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Swords,
  Trophy,
  Gift,
  ShoppingCart,
  ArrowUpRight,
  Wand2,
  Target,
} from "lucide-react";
import { PACKS } from "@/data/packs";
import { PackCard } from "@/components/game/PackCard";
import { DailyBar } from "@/components/game/DailyBar";
import { CooldownBanner } from "@/components/game/CooldownBanner";
import { JackpotCounter } from "@/components/game/JackpotCounter";
import { useBalance, useBootstrap, useInventory } from "@/hooks/useGame";

export default function GamePage() {
  const wasNew = useBootstrap();
  const { balance } = useBalance();
  const { totalValue, count: cardCount } = useInventory();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (wasNew) setShowWelcome(true);
  }, [wasNew]);

  const featured = PACKS.filter((p) => p.isFeatured);
  const tier1 = PACKS.filter(
    (p) => p.tier === "starter" || p.tier === "common",
  );
  const tier2 = PACKS.filter((p) => p.tier === "intermediate");
  const tier3 = PACKS.filter((p) => p.tier === "premium");
  const tier4 = PACKS.filter((p) => p.tier === "ultra");

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-5 pb-16 mx-auto"
        style={{ maxWidth: 1280 }}
      >
        {/* Welcome modal $10 */}
        {showWelcome && <WelcomeBonus onClose={() => setShowWelcome(false)} />}

        {/* Jackpot live (hero du game home) */}
        <div className="mb-6">
          <JackpotCounter />
        </div>

        {/* Header compact */}
        <div className="mb-6">
          <h1
            className="text-[24px] sm:text-[30px] font-extrabold tracking-tight leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Ouvre des caisses
          </h1>
          <p
            className="text-[12.5px] mt-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            15 caisses thématiques · variantes PSA Raw → PSA 10 · drop tables
            transparentes
          </p>
        </div>

        {/* Stats compactes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger-children">
          <StatCard
            icon={<DollarIconElement />}
            label="Solde"
            value={`$${balance.toFixed(2)}`}
            sub="USD virtuels"
            color="var(--color-positive)"
            bg="var(--color-positive-soft)"
          />
          <StatCard
            icon={<Gift size={14} />}
            label="Bonus reçu"
            value="$10.00"
            sub="à l'inscription"
            color="var(--color-pokemon-yellow)"
            bg="var(--color-pokemon-yellow-soft)"
          />
          <StatCard
            icon={<Trophy size={14} />}
            label="Cartes possédées"
            value={String(cardCount)}
            sub={`${PACKS.reduce((s, p) => s + p.cardPool.length, 0)} disponibles`}
            color="var(--color-cyan)"
            bg="var(--color-cyan-soft)"
          />
          <StatCard
            icon={<Sparkles size={14} />}
            label="Valeur collection"
            value={`$${totalValue.toFixed(2)}`}
            sub="estimation marché"
            color="var(--color-brand)"
            bg="var(--color-brand-soft)"
          />
        </div>

        {/* Cooldown / claim banner (visible si solde = 0) */}
        <CooldownBanner />

        {/* Daily Bar */}
        <div className="mb-7">
          <DailyBar />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <QuickAction
            href="/game/battle"
            icon={<Swords size={16} />}
            label="Battles PvP"
            color="#FF4D5E"
            bg="rgba(255,77,94,0.12)"
          />
          <QuickAction
            href="/game/jackpot"
            icon={<Trophy size={16} />}
            label="Jackpot"
            color="#FFD700"
            bg="rgba(255,215,0,0.12)"
            badge="LIVE"
          />
          <QuickAction
            href="/game/wheel"
            icon={<Target size={16} />}
            label="Roue Upgrade"
            color="#5B7FFF"
            bg="rgba(91,127,255,0.12)"
            badge="NEW"
          />
          <QuickAction
            href="/game/regrade"
            icon={<Wand2 size={16} />}
            label="Re-grade"
            color="#FFB450"
            bg="rgba(255,180,80,0.12)"
            badge="NEW"
          />
          <QuickAction
            href="/game/missions"
            icon={<Gift size={16} />}
            label="Missions"
            color="#10D9A0"
            bg="rgba(16,217,160,0.12)"
          />
          <QuickAction
            href="/game/shop"
            icon={<ShoppingCart size={16} />}
            label="Boutique"
            color="#8B5CF6"
            bg="rgba(139,92,246,0.12)"
          />
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <Section title="À la une" subtitle="Sélection vedette de la semaine">
            <Grid>
              {featured.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  affordable={balance >= pack.price}
                />
              ))}
            </Grid>
          </Section>
        )}

        {/* Tier 1 */}
        <Section
          title="Caisses accessibles"
          subtitle="Idéales pour débuter — moins de $2"
        >
          <Grid>
            {tier1.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                affordable={balance >= pack.price}
              />
            ))}
          </Grid>
        </Section>

        {/* Tier 2 */}
        <Section
          title="Standard"
          subtitle="Légendaires, GX, Tag Team — $2 à $5"
        >
          <Grid>
            {tier2.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                affordable={balance >= pack.price}
              />
            ))}
          </Grid>
        </Section>

        {/* Tier 3 */}
        <Section
          title="Premium"
          subtitle="Shinings, Cristals, Gold Star — collectors de niche"
        >
          <Grid>
            {tier3.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                affordable={balance >= pack.price}
              />
            ))}
          </Grid>
        </Section>

        {/* Tier 4 */}
        <Section title="Ultra" subtitle="Le graal — $50 à $100">
          <Grid>
            {tier4.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                affordable={balance >= pack.price}
              />
            ))}
          </Grid>
        </Section>
      </div>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2
            className="text-[18px] sm:text-[20px] font-bold tracking-tight leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p
              className="text-[12px] mt-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-4"
      style={{
        background: "var(--color-bg-glass)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center mb-3 border"
        style={{ background: bg, borderColor: "rgba(255,255,255,0.06)", color }}
      >
        {icon}
      </div>
      <p
        className="text-[9.5px] font-semibold uppercase tracking-[1px] mb-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-[16px] font-bold leading-tight tabular-nums"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p
        className="text-[10.5px] mt-1"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-muted)",
        }}
      >
        {sub}
      </p>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
  bg,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border transition-all hover:scale-[1.02]"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {label}
        </p>
      </div>
      {badge ? (
        <span
          className="px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-[1px]"
          style={{
            background: "var(--color-negative-soft)",
            color: "var(--color-negative)",
          }}
        >
          {badge}
        </span>
      ) : (
        <ArrowUpRight
          size={14}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color: "var(--color-text-muted)" }}
        />
      )}
    </Link>
  );
}

function DollarIconElement() {
  return (
    <span
      style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-mono)" }}
    >
      $
    </span>
  );
}

function WelcomeBonus({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="relative max-w-md w-full rounded-[var(--radius-lg)] border p-7 text-center"
        style={{
          background:
            "linear-gradient(155deg, var(--color-bg-elevated), rgba(16,217,160,0.06))",
          borderColor: "rgba(16,217,160,0.3)",
          boxShadow: "0 0 80px rgba(16,217,160,0.3), var(--shadow-xl)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center text-[36px] font-extrabold text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--color-positive), var(--color-cyan))",
            boxShadow: "0 0 40px var(--color-positive-glow)",
            fontFamily: "var(--font-mono)",
          }}
        >
          $10
        </div>
        <h2
          className="text-[24px] font-extrabold mb-2"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Bienvenue sur GameFolio !
        </h2>
        <p
          className="text-[14px] mb-5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          On t&apos;offre{" "}
          <strong style={{ color: "var(--color-positive)" }}>$10</strong> pour
          démarrer. De quoi ouvrir{" "}
          <strong style={{ color: "var(--color-pokemon-yellow)" }}>
            jusqu&apos;à 30 caisses
          </strong>
          . Lance-toi.
        </p>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-[var(--radius-sm)] font-bold text-[14px] text-white transition-all hover:scale-[1.02]"
          style={{
            fontFamily: "var(--font-display)",
            background:
              "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
            boxShadow: "0 0 24px var(--color-brand-glow)",
          }}
        >
          C&apos;est parti
        </button>
      </div>
    </div>
  );
}
