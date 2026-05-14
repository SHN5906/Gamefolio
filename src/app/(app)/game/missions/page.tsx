"use client";

// Missions live — la progression est dérivée des compteurs `gf:stats.v1`
// (cf. src/lib/data/stats.ts) qui s'incrémentent automatiquement au
// gameplay (ouvertures, battles, regrades, jackpot…). Les rewards sont
// crédités sur le solde à chaque claim ; l'état "claimed" est persisté
// par mission et reset au changement de jour/semaine.

import { useEffect, useState } from "react";
import { Gift, Calendar, CheckCircle2, Clock, Flame } from "lucide-react";
import { useBalance, useInventory } from "@/hooks/useGame";
import {
  getStats,
  getClaimState,
  markClaimed,
  type GameStats,
} from "@/lib/data/stats";

// ── Définitions de missions ──────────────────────────────────────────────
// Chaque mission a un `progress(stats, inventory)` qui calcule la valeur
// courante depuis l'état réel. Pas de progression hardcodée.

interface MissionDef {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: "daily" | "weekly";
  icon: string;
  goal: number;
  getProgress: (stats: GameStats, inventoryTotalValue: number) => number;
}

const DAILY_MISSIONS: MissionDef[] = [
  {
    id: "d1",
    title: "Connexion quotidienne",
    description: "Connecte-toi aujourd'hui",
    reward: 0.1,
    type: "daily",
    icon: "☀️",
    goal: 1,
    getProgress: (s) => (s.lastSeen ? 1 : 0),
  },
  {
    id: "d2",
    title: "Ouvre 5 caisses",
    description: "Cinq ouvertures pour aujourd'hui",
    reward: 0.2,
    type: "daily",
    icon: "🎴",
    goal: 5,
    getProgress: (s) => s.daily.opens,
  },
  {
    id: "d3",
    title: "Gagne une carte holo",
    description: "Obtiens une carte rare ou +",
    reward: 0.3,
    type: "daily",
    icon: "✨",
    goal: 1,
    getProgress: (s) => s.daily.holos,
  },
  {
    id: "d4",
    title: "Visite le jackpot",
    description: "Va voir le pot du jour",
    reward: 0.05,
    type: "daily",
    icon: "👀",
    goal: 1,
    getProgress: (s) => s.daily.jackpotVisits,
  },
  {
    id: "d5",
    title: "Joue une battle",
    description: "Lance une battle contre l'IA",
    reward: 0.5,
    type: "daily",
    icon: "⚔️",
    goal: 1,
    getProgress: (s) => s.daily.battles,
  },
];

const WEEKLY_MISSIONS: MissionDef[] = [
  {
    id: "w1",
    title: "Streak 7 jours",
    description: "Connecte-toi 7 jours d'affilée",
    reward: 1.0,
    type: "weekly",
    icon: "🔥",
    goal: 7,
    getProgress: (s) => s.streakDays,
  },
  {
    id: "w2",
    title: "Ouvre 100 caisses",
    description: "100 ouvertures cette semaine",
    reward: 2.5,
    type: "weekly",
    icon: "📦",
    goal: 100,
    getProgress: (s) => s.weekly.opens,
  },
  {
    id: "w3",
    title: "Collection de $50",
    description: "Atteins $50 de valeur en cartes",
    reward: 5.0,
    type: "weekly",
    icon: "💼",
    goal: 50,
    getProgress: (_, inventoryValue) => inventoryValue,
  },
  {
    id: "w4",
    title: "Gagne 3 battles",
    description: "Remporte 3 PvP cette semaine",
    reward: 3.0,
    type: "weekly",
    icon: "🏆",
    goal: 3,
    getProgress: (s) => s.weekly.battlesWon,
  },
];

export default function MissionsPage() {
  const { balance, addBalance } = useBalance();
  const { totalValue: inventoryValue } = useInventory();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [claimedIds, setClaimedIds] = useState<Set<string>>(new Set());

  // Lecture initiale + resync sur dispatch
  useEffect(() => {
    const refresh = () => {
      setStats(getStats());
      const claims = getClaimState();
      setClaimedIds(
        new Set([...Object.keys(claims.daily), ...Object.keys(claims.weekly)]),
      );
    };
    refresh();
    window.addEventListener("gf:stats-changed", refresh);
    window.addEventListener("gf:inventory-changed", refresh);
    return () => {
      window.removeEventListener("gf:stats-changed", refresh);
      window.removeEventListener("gf:inventory-changed", refresh);
    };
  }, []);

  if (!stats) {
    return (
      <div className="min-h-full page-enter">
        <div className="px-4 sm:px-6 md:px-8 pt-6">
          <p
            className="text-[13px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Chargement des missions…
          </p>
        </div>
      </div>
    );
  }

  const handleClaim = (m: MissionDef) => {
    if (claimedIds.has(m.id)) return;
    const progress = Math.min(m.goal, m.getProgress(stats, inventoryValue));
    if (progress < m.goal) return;
    addBalance(m.reward);
    markClaimed(m.id, m.type);
    setClaimedIds((prev) => new Set(prev).add(m.id));
  };

  // Total claimable now
  const allMissions = [...DAILY_MISSIONS, ...WEEKLY_MISSIONS];
  const claimableSum = allMissions
    .filter(
      (m) =>
        !claimedIds.has(m.id) && m.getProgress(stats, inventoryValue) >= m.goal,
    )
    .reduce((s, m) => s + m.reward, 0);

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1100 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Gift size={14} style={{ color: "var(--color-positive)" }} />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Missions · Progression live
              </p>
            </div>
            <h1
              className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Tes missions
            </h1>
            <p
              className="text-[13px] mt-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Solde : <strong>${balance.toFixed(2)}</strong>
              {claimableSum > 0 && (
                <>
                  {" · "}
                  <strong style={{ color: "var(--color-positive)" }}>
                    ${claimableSum.toFixed(2)} prêts à récupérer
                  </strong>
                </>
              )}
            </p>
          </div>

          {/* Streak badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] border"
            style={{
              background: "rgba(255,180,80,0.08)",
              borderColor: "rgba(255,180,80,0.3)",
            }}
          >
            <Flame size={14} style={{ color: "#FFB450" }} />
            <span
              className="text-[11px] font-semibold uppercase tracking-[1.2px]"
              style={{ color: "#FFB450" }}
            >
              Streak {stats.streakDays}j
            </span>
          </div>
        </div>

        {/* Daily */}
        <Section
          icon={<Calendar size={14} />}
          title="Missions du jour"
          subtitle="Reset à minuit"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DAILY_MISSIONS.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                progress={Math.min(
                  m.goal,
                  Math.floor(m.getProgress(stats, inventoryValue)),
                )}
                claimed={claimedIds.has(m.id)}
                onClaim={() => handleClaim(m)}
              />
            ))}
          </div>
        </Section>

        {/* Weekly */}
        <Section
          icon={<Clock size={14} />}
          title="Missions de la semaine"
          subtitle="Plus difficiles, mieux récompensées"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {WEEKLY_MISSIONS.map((m) => (
              <MissionCard
                key={m.id}
                mission={m}
                progress={Math.min(
                  m.goal,
                  Math.floor(m.getProgress(stats, inventoryValue)),
                )}
                claimed={claimedIds.has(m.id)}
                onClaim={() => handleClaim(m)}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div style={{ color: "var(--color-text-muted)" }}>{icon}</div>
        <h2
          className="text-[16px] font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h2>
        <span
          className="text-[11px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          · {subtitle}
        </span>
      </div>
      {children}
    </div>
  );
}

function MissionCard({
  mission,
  progress,
  claimed,
  onClaim,
}: {
  mission: MissionDef;
  progress: number;
  claimed: boolean;
  onClaim: () => void;
}) {
  const pct = (progress / mission.goal) * 100;
  const ready = progress >= mission.goal && !claimed;

  return (
    <div
      className="rounded-[var(--radius-md)] border p-4 transition-all"
      style={{
        background: claimed
          ? "rgba(16,217,160,0.04)"
          : ready
            ? "linear-gradient(135deg, rgba(255,204,0,0.06), var(--color-bg-elevated))"
            : "var(--color-bg-elevated)",
        borderColor: claimed
          ? "rgba(16,217,160,0.25)"
          : ready
            ? "rgba(255,204,0,0.3)"
            : "var(--color-border)",
        boxShadow: ready ? "0 0 24px rgba(255,204,0,0.15)" : "none",
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-[20px] flex-shrink-0"
          style={{ background: "var(--color-bg-glass-hi)" }}
        >
          {mission.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[13px] font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {mission.title}
          </p>
          <p
            className="text-[11px] mt-1"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {mission.description}
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[11px] font-extrabold tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            background: "var(--color-positive-soft)",
            color: "var(--color-positive)",
          }}
        >
          +${mission.reward.toFixed(2)}
        </span>
      </div>

      <div
        className="h-1.5 rounded-full overflow-hidden mb-2"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: ready
              ? "linear-gradient(90deg, var(--color-pokemon-yellow), #FFA500)"
              : "linear-gradient(90deg, var(--color-brand), var(--color-cyan))",
          }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          {progress}/{mission.goal}
        </span>
        {claimed ? (
          <span
            className="flex items-center gap-1 text-[11px] font-semibold"
            style={{ color: "var(--color-positive)" }}
          >
            <CheckCircle2 size={12} />
            Récolté
          </span>
        ) : ready ? (
          <button
            onClick={onClaim}
            className="px-3 h-7 rounded-[6px] text-[11px] font-bold text-black"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
            }}
          >
            Récolter
          </button>
        ) : null}
      </div>
    </div>
  );
}
