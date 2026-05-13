"use client";

// ──────────────────────────────────────────────────────────────────────────
// Battle PvE — combat 1v1 contre une IA stratège.
//
// Le joueur choisit (1) un pack (2) un archétype d'IA. Les deux ouvrent la
// MÊME caisse, le plus gros prix gagne le pot (mise × 2). L'IA expose son
// raisonnement avant chaque round — c'est le support visible des
// compétences 1.8.1 → 1.8.4 (cf. `src/lib/ai/battle-strategist.ts`).
//
// État local seulement (useState) — pas de persistance Supabase pour
// l'instant : c'est un mode "training" contre IA, pas un PvP réseau.
// ──────────────────────────────────────────────────────────────────────────

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Swords,
  ArrowLeft,
  Brain,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { PACKS, getPackById, rollPackOutcome } from "@/data/packs";
import { useBalance } from "@/hooks/useGame";
import { useTCGdexCard, tcgdexImageUrl } from "@/hooks/useTCGdexCard";
import {
  AI_ARCHETYPES,
  evaluateBattleProposal,
  type AiArchetype,
  type BattleProposal,
} from "@/lib/ai/battle-strategist";
import type { GameCard, OpeningResult } from "@/types/game";

type Phase = "lobby" | "reveal" | "result";

// ── Reveal reel — paramètres d'animation ────────────────────────────────
// Reel vertical façon Hellcase : N cartes empilées, scroll deceléré qui
// s'arrête sur la carte gagnante. REEL_LENGTH inclut la carte finale.
const REEL_LENGTH = 18;
const REEL_DURATION_MS = 2200;

interface RoundOutcome {
  playerOpen: Omit<OpeningResult, "isNew" | "packId" | "openedAt">;
  aiOpen: Omit<OpeningResult, "isNew" | "packId" | "openedAt">;
  winner: "player" | "ai" | "tie";
}

export default function BattlePage() {
  const { balance, addBalance } = useBalance();

  const [selectedPackId, setSelectedPackId] = useState<string>(
    PACKS.find((p) => p.price > 0.5 && p.price < 10)?.id ?? PACKS[0].id,
  );
  const [selectedArchetype, setSelectedArchetype] = useState<AiArchetype>(
    AI_ARCHETYPES[1], // Sharp par défaut — le plus intéressant à défendre
  );
  const [phase, setPhase] = useState<Phase>("lobby");
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);

  const pack = getPackById(selectedPackId);
  const proposal: BattleProposal | null = useMemo(
    () => (pack ? evaluateBattleProposal(pack, selectedArchetype) : null),
    [pack, selectedArchetype],
  );

  const canPlay = pack ? balance >= pack.price : false;

  const startBattle = () => {
    if (!pack || !canPlay) return;
    addBalance(-pack.price);
    const playerOpen = rollPackOutcome(pack);
    const aiOpen = rollPackOutcome(pack);
    const winner: RoundOutcome["winner"] =
      playerOpen.price > aiOpen.price
        ? "player"
        : playerOpen.price < aiOpen.price
          ? "ai"
          : "tie";
    setOutcome({ playerOpen, aiOpen, winner });
    setPhase("reveal");
    // Pot redistribué en fin d'animation reel (cf. REEL_DURATION_MS)
    setTimeout(() => {
      if (winner === "player") addBalance(pack.price * 2);
      else if (winner === "tie") addBalance(pack.price); // remboursé
      setPhase("result");
    }, REEL_DURATION_MS + 200);
  };

  const reset = () => {
    setOutcome(null);
    setPhase("lobby");
  };

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1280 }}
      >
        <Link
          href="/game"
          className="flex items-center gap-2 text-[12px] font-medium mb-5 transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={13} />
          Retour
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Swords size={14} style={{ color: "var(--color-negative)" }} />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Battle PvE · IA Stratège
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
              Affronte l&apos;IA
            </h1>
            <p
              className="text-[13px] mt-2 max-w-xl"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Tu ouvres la même caisse qu&apos;une IA décisionnelle. La carte de
              plus grande valeur emporte le pot ×2. L&apos;IA expose
              publiquement sa stratégie — préparation des données, insights
              extraits, modèle utilisé, comparaison critique.
            </p>
          </div>
        </div>

        {phase === "lobby" && (
          <Lobby
            pack={pack}
            selectedPackId={selectedPackId}
            setSelectedPackId={setSelectedPackId}
            archetype={selectedArchetype}
            setArchetype={setSelectedArchetype}
            proposal={proposal}
            canPlay={canPlay}
            balance={balance}
            onStart={startBattle}
          />
        )}

        {phase !== "lobby" && pack && outcome && (
          <BattleArena
            pack={pack}
            archetype={selectedArchetype}
            outcome={outcome}
            revealed={phase === "result"}
            onReplay={reset}
          />
        )}
      </div>
    </div>
  );
}

// ── Lobby ───────────────────────────────────────────────────────────────

function Lobby({
  pack,
  selectedPackId,
  setSelectedPackId,
  archetype,
  setArchetype,
  proposal,
  canPlay,
  balance,
  onStart,
}: {
  pack: ReturnType<typeof getPackById>;
  selectedPackId: string;
  setSelectedPackId: (id: string) => void;
  archetype: AiArchetype;
  setArchetype: (a: AiArchetype) => void;
  proposal: BattleProposal | null;
  canPlay: boolean;
  balance: number;
  onStart: () => void;
}) {
  // On expose une sélection de packs (les plus pertinents pour battle).
  const eligiblePacks = PACKS.filter((p) => p.price >= 0.2 && p.price <= 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
      {/* Colonne gauche — choix */}
      <div className="space-y-5">
        {/* Choix de l'IA */}
        <Section title="1. Choisis l'adversaire IA">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {AI_ARCHETYPES.map((a) => (
              <button
                key={a.id}
                onClick={() => setArchetype(a)}
                className="text-left p-3 rounded-[var(--radius-sm)] border transition-all hover:scale-[1.01]"
                style={{
                  background:
                    archetype.id === a.id
                      ? "rgba(255,77,94,0.08)"
                      : "var(--color-bg-glass)",
                  borderColor:
                    archetype.id === a.id
                      ? "rgba(255,77,94,0.4)"
                      : "var(--color-border)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[20px]">{a.emoji}</span>
                  <span
                    className="text-[13px] font-bold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {a.name}
                  </span>
                </div>
                <p
                  className="text-[11px] leading-snug"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {a.tagline}
                </p>
              </button>
            ))}
          </div>
        </Section>

        {/* Choix du pack */}
        <Section title="2. Choisis la caisse">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {eligiblePacks.map((p) => {
              const active = p.id === selectedPackId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPackId(p.id)}
                  className="text-left p-3 rounded-[var(--radius-sm)] border transition-all hover:scale-[1.01]"
                  style={{
                    background: active
                      ? "rgba(42,125,255,0.08)"
                      : "var(--color-bg-glass)",
                    borderColor: active
                      ? "rgba(42,125,255,0.4)"
                      : "var(--color-border)",
                  }}
                >
                  <span className="text-[18px]">{p.emoji}</span>
                  <p
                    className="text-[12px] font-bold mt-1 truncate"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {p.nameFr}
                  </p>
                  <p
                    className="text-[11px] tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-pokemon-yellow)",
                    }}
                  >
                    ${p.price.toFixed(2)}
                  </p>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Action */}
        <div
          className="rounded-[var(--radius-md)] border p-4 flex items-center justify-between"
          style={{
            background: "var(--color-bg-elevated)",
            borderColor: "var(--color-border-strong)",
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.2px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Pot total (mise ×2)
            </p>
            <p
              className="text-[20px] font-extrabold tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-pokemon-yellow)",
              }}
            >
              ${pack ? (pack.price * 2).toFixed(2) : "—"}
            </p>
          </div>
          <button
            disabled={!canPlay}
            onClick={onStart}
            className="flex items-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] font-bold text-[14px] text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
            style={{
              fontFamily: "var(--font-display)",
              background:
                "linear-gradient(135deg, var(--color-negative), #FF4D5E)",
              boxShadow: canPlay ? "0 0 24px rgba(255,77,94,0.4)" : "none",
            }}
          >
            <Play size={15} strokeWidth={2.5} />
            {!canPlay
              ? `Solde insuf. ($${balance.toFixed(2)})`
              : `Combattre · −$${pack?.price.toFixed(2)}`}
          </button>
        </div>
      </div>

      {/* Colonne droite — panneau d'analyse IA (le vendor des 4 compétences) */}
      <AiAnalysisPanel archetype={archetype} proposal={proposal} />
    </div>
  );
}

// ── Panneau d'analyse IA ────────────────────────────────────────────────

function AiAnalysisPanel({
  archetype,
  proposal,
}: {
  archetype: AiArchetype;
  proposal: BattleProposal | null;
}) {
  if (!proposal) return null;
  const { insights, comparison, verdict } = proposal;

  const decisionColor =
    comparison.decision === "play"
      ? "var(--color-positive)"
      : comparison.decision === "skip"
        ? "var(--color-negative)"
        : "var(--color-pokemon-yellow)";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div
        className="rounded-[var(--radius-md)] border p-4"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "rgba(168,85,247,0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <Brain size={14} style={{ color: "#A855F7" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-[1.4px]"
            style={{ color: "#A855F7" }}
          >
            Raisonnement IA · {archetype.name}
          </span>
        </div>
        <p
          className="text-[12px] font-bold leading-tight"
          style={{
            color: decisionColor,
            fontFamily: "var(--font-display)",
          }}
        >
          {comparison.decision === "play"
            ? "▶ Je joue cette caisse"
            : comparison.decision === "skip"
              ? "✕ Cette caisse, je passerais"
              : "⚠ Décision borderline"}
        </p>
        <p
          className="text-[11.5px] mt-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {comparison.summary}
        </p>
      </div>

      {/* Insights — 1.8.2 */}
      <CollapsibleStep
        step="1.8.2"
        title="Insights extraits"
        icon={<TrendingUp size={11} />}
      >
        <KV label="EV (espérance prix)" value={`$${insights.ev.toFixed(2)}`} />
        <KV
          label="EV − coût"
          value={`${insights.evMinusCost >= 0 ? "+" : "−"}$${Math.abs(insights.evMinusCost).toFixed(2)}`}
          color={
            insights.evMinusCost >= 0
              ? "var(--color-positive)"
              : "var(--color-negative)"
          }
        />
        <KV label="Écart type σ" value={`$${insights.stdDev.toFixed(2)}`} />
        <KV
          label="Coef variation σ/μ"
          value={insights.coefVariation.toFixed(2)}
        />
        <KV label="Skewness" value={insights.skewness.toFixed(2)} />
        <KV
          label="P10 / P50 / P90"
          value={`$${insights.p10.toFixed(2)} / $${insights.p50.toFixed(2)} / $${insights.p90.toFixed(2)}`}
        />
        <KV
          label="P(break-even)"
          value={`${(insights.probBreakEven * 100).toFixed(1)}%`}
        />
        <KV
          label="P(jackpot 10×)"
          value={`${(insights.probJackpot * 100).toFixed(2)}%`}
        />
      </CollapsibleStep>

      {/* Modèle utilisé — 1.8.3 */}
      <CollapsibleStep
        step="1.8.3"
        title={`Modèle : ${verdict.name}`}
        icon={<Sparkles size={11} />}
      >
        <p
          className="text-[11px] leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {verdict.rationale}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="text-[10px] font-semibold uppercase tracking-[1px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            Confiance
          </span>
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--color-bg-glass-hi)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${verdict.confidence * 100}%`,
                background:
                  verdict.confidence > 0.6
                    ? "var(--color-positive)"
                    : verdict.confidence > 0.4
                      ? "var(--color-pokemon-yellow)"
                      : "var(--color-negative)",
              }}
            />
          </div>
          <span
            className="text-[10.5px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {(verdict.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </CollapsibleStep>

      {/* Comparaison critique — 1.8.4 */}
      <CollapsibleStep
        step="1.8.4"
        title="Comparaison des modèles"
        icon={<AlertTriangle size={11} />}
      >
        {comparison.verdicts.map((v) => (
          <div key={v.name} className="mb-2 last:mb-0">
            <div className="flex items-center justify-between mb-0.5">
              <span
                className="text-[10.5px] font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {v.name === "greedy-ev"
                  ? "Greedy EV"
                  : v.name === "risk-adjusted"
                    ? "Risk-adjusted (Kelly)"
                    : "Tail hunter"}
              </span>
              <span
                className="text-[10px] tabular-nums"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {(v.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: "var(--color-bg-glass-hi)" }}
            >
              <div
                className="h-full"
                style={{
                  width: `${v.confidence * 100}%`,
                  background:
                    v.name === verdict.name
                      ? "var(--color-brand)"
                      : "var(--color-text-muted)",
                  opacity: v.name === verdict.name ? 1 : 0.5,
                }}
              />
            </div>
          </div>
        ))}
        <p
          className="text-[10.5px] mt-2 italic"
          style={{ color: "var(--color-text-muted)" }}
        >
          Robustesse inter-modèles : {(comparison.robustness * 100).toFixed(0)}%
          — accord = signal fort.
        </p>
      </CollapsibleStep>

      {/* Footer compétences */}
      <div
        className="text-[10px] p-2.5 rounded-[var(--radius-sm)] border"
        style={{
          background: "rgba(168,85,247,0.05)",
          borderColor: "rgba(168,85,247,0.15)",
          color: "var(--color-text-muted)",
        }}
      >
        Préparation données <strong>1.8.1</strong> → cardPool → distribution
        probabiliste + features par grade. Voir{" "}
        <code style={{ color: "#A855F7" }}>battle-strategist.ts</code>.
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[10.5px] font-semibold uppercase tracking-[1.4px] mb-2"
        style={{ color: "var(--color-text-muted)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function CollapsibleStep({
  step,
  title,
  icon,
  children,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      className="rounded-[var(--radius-sm)] border overflow-hidden"
      style={{
        background: "var(--color-bg-glass)",
        borderColor: "var(--color-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-extrabold uppercase tracking-[1.5px] px-1.5 py-0.5 rounded-[3px]"
            style={{
              background: "rgba(168,85,247,0.15)",
              color: "#A855F7",
            }}
          >
            {step}
          </span>
          {icon}
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {title}
          </span>
        </div>
        <span
          className="text-[10px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {open ? "▼" : "▶"}
        </span>
      </button>
      {open && <div className="px-3 pb-3 space-y-1">{children}</div>}
    </div>
  );
}

function KV({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span
        className="font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: color ?? "var(--color-text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── Arène ───────────────────────────────────────────────────────────────

function BattleArena({
  pack,
  archetype,
  outcome,
  revealed,
  onReplay,
}: {
  pack: NonNullable<ReturnType<typeof getPackById>>;
  archetype: AiArchetype;
  outcome: RoundOutcome;
  revealed: boolean;
  onReplay: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Pot affiché */}
      <div
        className="rounded-[var(--radius-md)] border p-4 text-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,215,64,0.1), rgba(255,77,94,0.05))",
          borderColor: "rgba(255,215,64,0.3)",
        }}
      >
        <p
          className="text-[10px] font-semibold uppercase tracking-[1.5px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Pot en jeu
        </p>
        <p
          className="text-[28px] font-extrabold tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-pokemon-yellow)",
          }}
        >
          ${(pack.price * 2).toFixed(2)}
        </p>
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          {pack.nameFr}
        </p>
      </div>

      {/* Versus */}
      <div className="grid grid-cols-2 gap-3">
        <CombatantCard
          name="Toi"
          emoji="🎮"
          pack={pack}
          card={outcome.playerOpen}
          revealed={revealed}
          isWinner={revealed && outcome.winner === "player"}
          isLoser={revealed && outcome.winner === "ai"}
        />
        <CombatantCard
          name={archetype.name}
          emoji={archetype.emoji}
          pack={pack}
          card={outcome.aiOpen}
          revealed={revealed}
          isWinner={revealed && outcome.winner === "ai"}
          isLoser={revealed && outcome.winner === "player"}
        />
      </div>

      {/* Verdict + replay */}
      {revealed && (
        <div
          className="rounded-[var(--radius-md)] border p-4 flex items-center justify-between"
          style={{
            background: "var(--color-bg-elevated)",
            borderColor:
              outcome.winner === "player"
                ? "rgba(16,217,160,0.4)"
                : outcome.winner === "ai"
                  ? "rgba(255,77,94,0.4)"
                  : "var(--color-border-strong)",
          }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.5px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Résultat
            </p>
            <p
              className="text-[20px] font-extrabold"
              style={{
                fontFamily: "var(--font-display)",
                color:
                  outcome.winner === "player"
                    ? "var(--color-positive)"
                    : outcome.winner === "ai"
                      ? "var(--color-negative)"
                      : "var(--color-text-primary)",
              }}
            >
              {outcome.winner === "player"
                ? `Tu gagnes +$${pack.price.toFixed(2)}`
                : outcome.winner === "ai"
                  ? `${archetype.name} gagne. Tu perds $${pack.price.toFixed(2)}.`
                  : "Égalité — mise remboursée"}
            </p>
          </div>
          <button
            onClick={onReplay}
            className="flex items-center gap-2 h-11 px-5 rounded-[var(--radius-sm)] font-bold text-[13px] text-white transition-all hover:scale-[1.02]"
            style={{
              fontFamily: "var(--font-display)",
              background:
                "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
              boxShadow: "0 0 16px var(--color-brand-glow)",
            }}
          >
            <RotateCw size={13} />
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}

function CombatantCard({
  name,
  emoji,
  pack,
  card,
  revealed,
  isWinner,
  isLoser,
}: {
  name: string;
  emoji: string;
  pack: NonNullable<ReturnType<typeof getPackById>>;
  card: RoundOutcome["playerOpen"];
  revealed: boolean;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div
      className="rounded-[var(--radius-md)] border p-3 flex flex-col transition-all"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: isWinner
          ? "rgba(16,217,160,0.5)"
          : isLoser
            ? "rgba(255,77,94,0.3)"
            : "var(--color-border-strong)",
        boxShadow: isWinner
          ? "0 0 24px rgba(16,217,160,0.3)"
          : "var(--shadow-sm)",
        opacity: isLoser ? 0.6 : 1,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[18px]">{emoji}</span>
          <span
            className="text-[13px] font-bold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            {name}
          </span>
        </div>
        {isWinner && (
          <span
            className="text-[9px] font-extrabold uppercase tracking-[1.2px] px-1.5 py-0.5 rounded-[3px]"
            style={{
              background: "rgba(16,217,160,0.18)",
              color: "var(--color-positive)",
            }}
          >
            Win
          </span>
        )}
      </div>

      {/* Reel — scroll vertical déceléré façon Hellcase */}
      <RevealReel
        pool={pack.cardPool}
        winningCard={card.card}
        isWinner={isWinner}
      />

      {/* Card info */}
      <div
        className="mt-2 text-[11.5px] text-center"
        style={{
          color: revealed ? "var(--color-text-primary)" : "transparent",
          transition: "color 0.3s",
        }}
      >
        <p className="font-bold truncate">{card.card.nameFr}</p>
        <p
          className="text-[10px] mt-0.5"
          style={{ color: "var(--color-text-muted)" }}
        >
          {card.grade.toUpperCase().replace("-", " ")}
        </p>
        <p
          className="text-[14px] font-extrabold tabular-nums mt-1"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-positive)",
          }}
        >
          ${card.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

// ── RevealReel ──────────────────────────────────────────────────────────
//
// Reel vertical décéléré : on génère REEL_LENGTH cellules (REEL_LENGTH-1
// fillers + la carte gagnante en dernier), puis on translate la stack du
// haut vers le bas pour faire défiler les cartes. Le timing total
// correspond à REEL_DURATION_MS, calé sur le setTimeout du parent.
//
// Détail technique : translateY exprimé en pixels (mesure via ref dans
// useLayoutEffect) plutôt qu'en %, car translateY(% ) est relatif au
// boîtier de la stack (qui mesure N× la cellule), donc le % n'aurait pas
// le bon référentiel. Approche pixel = robuste à toute taille.
//
// Performance : seule la carte gagnante fetch son image TCGdex. Les 17
// fillers utilisent un gradient énergie + nom dim — suffisant pour le
// flou de mouvement (l'œil ne voit pas les fillers nettement à cette
// vitesse).

const ENERGY_BG: Record<string, string> = {
  fire: "linear-gradient(155deg, #FF6B47, #FF6B4733)",
  water: "linear-gradient(155deg, #38BDF8, #38BDF833)",
  grass: "linear-gradient(155deg, #22C55E, #22C55E33)",
  lightning: "linear-gradient(155deg, #FACC15, #FACC1533)",
  psychic: "linear-gradient(155deg, #A855F7, #A855F733)",
  dark: "linear-gradient(155deg, #64748B, #64748B33)",
  dragon: "linear-gradient(155deg, #818CF8, #818CF833)",
  colorless: "linear-gradient(155deg, #94A3B8, #94A3B833)",
  metal: "linear-gradient(155deg, #94A3B8, #94A3B833)",
  fairy: "linear-gradient(155deg, #EC4899, #EC489933)",
};

function RevealReel({
  pool,
  winningCard,
  isWinner,
}: {
  pool: GameCard[];
  winningCard: GameCard;
  isWinner: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offsetPx, setOffsetPx] = useState(0);
  const [settled, setSettled] = useState(false);

  // Cells : REEL_LENGTH-1 random fillers + carte gagnante en position finale.
  // Lazy useState initializer (et pas useMemo) : la règle react-hooks/purity
  // interdit Math.random dans un useMemo factory, mais l'autorise dans un
  // initializer de useState (qui ne s'exécute qu'au mount).
  const [cells] = useState<GameCard[]>(() => {
    const result: GameCard[] = [];
    for (let i = 0; i < REEL_LENGTH - 1; i++) {
      result.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    result.push(winningCard);
    return result;
  });

  useLayoutEffect(() => {
    const h = containerRef.current?.clientHeight ?? 0;
    // Double rAF pour garantir que le navigateur a commit le state offsetPx=0
    // avant de déclencher la transition vers la valeur finale.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setOffsetPx((REEL_LENGTH - 1) * h);
      });
    });
    const t = setTimeout(() => setSettled(true), REEL_DURATION_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[2.5/3.5] rounded-[6px] overflow-hidden border"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bg-glass), var(--color-bg-base))",
        borderColor:
          settled && isWinner ? "rgba(16,217,160,0.7)" : "var(--color-border)",
        boxShadow:
          settled && isWinner ? "0 0 24px rgba(16,217,160,0.5)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Indicateur central — chevrons façon Hellcase qui pointent la cellule cible */}
      <div
        className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none"
        style={{
          opacity: settled ? 0 : 0.6,
          transition: "opacity 0.4s",
        }}
      >
        <div
          className="absolute left-0 top-0 -translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid var(--color-pokemon-yellow)",
          }}
        />
        <div
          className="absolute right-0 top-0 -translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid var(--color-pokemon-yellow)",
          }}
        />
      </div>

      {/* Stack défilante */}
      <div
        className="flex flex-col"
        style={{
          transform: `translateY(-${offsetPx}px)`,
          transition: `transform ${REEL_DURATION_MS}ms cubic-bezier(0.12, 0.85, 0.25, 1)`,
        }}
      >
        {cells.map((c, i) => (
          <ReelCell
            key={i}
            card={c}
            isTarget={i === REEL_LENGTH - 1}
            settled={settled}
          />
        ))}
      </div>

      {/* Flash de victoire — overlay qui pulse une fois settled */}
      {settled && isWinner && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at center, rgba(16,217,160,0.25), transparent 70%)",
            animation: "fadeInUp 0.6s ease-out",
          }}
        />
      )}
    </div>
  );
}

function ReelCell({
  card,
  isTarget,
  settled,
}: {
  card: GameCard;
  isTarget: boolean;
  settled: boolean;
}) {
  // Toutes les cellules fetch TCGdex — React Query dédupe par cardId et
  // partage le cache 24h, donc le coût total = 1 fetch par cardId unique
  // (les fillers se répètent dans un pool restreint). Qualité 'low' sur
  // les fillers : ils défilent vite, l'œil ne lit pas la haute résolution.
  const { data: tcg } = useTCGdexCard(card.id);
  const imageUrl = tcgdexImageUrl(tcg, isTarget ? "high" : "low");
  const energyBg = ENERGY_BG[card.energy.toLowerCase()] ?? ENERGY_BG.colorless;

  return (
    <div
      className="w-full aspect-[2.5/3.5] flex-shrink-0 flex items-center justify-center relative"
      style={{ background: energyBg }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={card.nameFr}
          fill
          className="object-contain"
          style={{
            transform: settled && isTarget ? "scale(1)" : "scale(0.96)",
            transition: "transform 0.4s ease-out",
          }}
          unoptimized
        />
      ) : (
        <span
          className="text-[10px] font-bold text-center px-1.5 leading-tight"
          style={{
            color: "rgba(255,255,255,0.85)",
            textShadow: "0 1px 2px rgba(0,0,0,0.6)",
          }}
        >
          {card.nameFr}
        </span>
      )}
    </div>
  );
}
