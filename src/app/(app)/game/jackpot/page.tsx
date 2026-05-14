"use client";

// Jackpot communautaire JOUABLE — refactor du 14/05.
//
// Round de 3 min en localStorage : les bots déposent automatiquement,
// l'utilisateur dépose des cartes de son inventory via le modal.
// À la fin du timer, animation "drawing" 6s puis tirage pondéré.
// Si le user gagne, le pot net (− 5% house fee) est crédité en cash.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Users, Plus, History, X, Check } from "lucide-react";
import {
  useBalance,
  useInventoryGraded,
  useJackpot,
  useProfile,
} from "@/hooks/useGame";
import { toast } from "@/components/ui/Toaster";
import type { InventoryItem } from "@/types/game";

export default function JackpotPage() {
  const { balance } = useBalance();
  const { round, label, deposit } = useJackpot();
  const { profile } = useProfile();
  const [showDeposit, setShowDeposit] = useState(false);

  // Stats — compte la visite (1 par session)
  useEffect(() => {
    import("@/lib/data/stats").then(({ incrementStat }) =>
      incrementStat("jackpotVisits"),
    );
  }, []);

  const userParticipant = round.participants.find((p) => p.isUser);

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1280 }}
      >
        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Trophy
                size={14}
                style={{ color: "var(--color-pokemon-yellow)" }}
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Jackpot · Plus tu déposes, plus tu as de chances
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
              Jackpot du jour
            </h1>
          </div>
          <Link
            href="/game/jackpot/history"
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-[var(--radius-sm)] border text-[12px] font-medium"
            style={{
              borderColor: "var(--color-border-strong)",
              background: "var(--color-bg-glass)",
              color: "var(--color-text-secondary)",
            }}
          >
            <History size={12} />
            Historique
          </Link>
        </div>

        {/* Hero pot */}
        <div
          className="relative rounded-[var(--radius-lg)] border overflow-hidden p-7 sm:p-10 mb-6 text-center"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,204,0,0.12), var(--color-bg-elevated) 70%)",
            borderColor: "rgba(255,204,0,0.3)",
            boxShadow: "0 0 80px rgba(255,204,0,0.2)",
          }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(255,215,0,0.4), transparent 40%), radial-gradient(circle at 80% 50%, rgba(255,165,0,0.3), transparent 40%)",
            }}
          />
          <div className="relative z-10">
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px] mb-2"
              style={{ color: "var(--color-pokemon-yellow)" }}
            >
              {round.status === "drawing"
                ? "Tirage en cours…"
                : round.status === "closed"
                  ? "Round terminé"
                  : "Pot total · Tirage dans"}
            </p>
            <p
              className="text-[14px] font-mono tabular-nums mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {round.status === "open" ? label : "—"}
            </p>
            <p
              className="text-[56px] sm:text-[80px] font-black tabular-nums leading-none mb-3"
              style={{
                fontFamily: "var(--font-display)",
                background:
                  "linear-gradient(135deg, #FFD700, #FFA500, #FFD700)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.04em",
                filter: "drop-shadow(0 0 24px rgba(255,215,0,0.5))",
              }}
            >
              ${round.totalPot.toFixed(2)}
            </p>
            <p
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Users size={11} className="inline mr-1" />
              {round.participants.length} participant
              {round.participants.length > 1 ? "s" : ""} ·{" "}
              {round.participants.reduce((s, p) => s + p.items.length, 0)}{" "}
              cartes en jeu
            </p>
            {userParticipant && (
              <p
                className="text-[12px] mt-3"
                style={{ color: "var(--color-positive)" }}
              >
                ✓ Tu participes — chance de gagner :{" "}
                <strong>
                  {(userParticipant.percentage * 100).toFixed(1)}%
                </strong>
              </p>
            )}
          </div>
        </div>

        {/* Drawing animation */}
        {round.status === "drawing" && (
          <DrawingAnimation
            participants={round.participants}
            totalPot={round.totalPot}
          />
        )}

        {/* 2-col layout: Donut + List */}
        {round.participants.length > 0 ? (
          <div className="grid gap-5 grid-cols-1 lg:[grid-template-columns:340px_1fr] mb-6">
            <div
              className="rounded-[var(--radius-md)] border p-5 flex flex-col items-center"
              style={{
                background: "var(--color-bg-elevated)",
                borderColor: "var(--color-border-strong)",
              }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px] mb-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                Probabilités
              </p>
              <Donut
                participants={round.participants}
                totalPot={round.totalPot}
              />
            </div>

            <div
              className="rounded-[var(--radius-md)] border overflow-hidden"
              style={{
                background: "var(--color-bg-elevated)",
                borderColor: "var(--color-border-strong)",
              }}
            >
              <div
                className="px-4 py-3 border-b text-[10px] font-semibold uppercase tracking-[1.2px]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-muted)",
                }}
              >
                Participants
              </div>
              <div
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {[...round.participants]
                  .sort((a, b) => b.depositValue - a.depositValue)
                  .map((p) => {
                    const pct = p.percentage * 100;
                    return (
                      <div
                        key={p.userId}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{
                          background: p.isUser
                            ? "rgba(0,212,255,0.06)"
                            : "transparent",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                          style={{
                            background: p.color,
                            boxShadow: p.isUser
                              ? `0 0 12px ${p.color}`
                              : "none",
                          }}
                        >
                          {p.initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[13px] font-semibold truncate"
                            style={{
                              color: p.isUser
                                ? "var(--color-cyan)"
                                : "var(--color-text-primary)",
                            }}
                          >
                            {p.username}
                            {p.isUser && (
                              <span
                                className="ml-1 text-[10px] font-extrabold uppercase"
                                style={{ color: "var(--color-cyan)" }}
                              >
                                · toi
                              </span>
                            )}
                          </p>
                          <p
                            className="text-[10.5px]"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {p.items.length} carte
                            {p.items.length > 1 ? "s" : ""} · $
                            {p.depositValue.toFixed(2)}
                          </p>
                        </div>
                        <div className="w-24 hidden sm:block">
                          <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.05)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: p.color }}
                            />
                          </div>
                        </div>
                        <span
                          className="text-[13px] font-bold tabular-nums w-14 text-right"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="rounded-[var(--radius-md)] border p-8 mb-6 text-center"
            style={{
              background: "var(--color-bg-glass)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <p className="text-[13px]">
              Aucun participant pour ce round. Sois le premier à déposer.
            </p>
          </div>
        )}

        {/* Deposit CTA */}
        <button
          onClick={() => setShowDeposit(true)}
          disabled={round.status !== "open"}
          className="w-full h-14 rounded-[var(--radius-md)] flex items-center justify-center gap-2 font-extrabold text-[15px] text-black transition-all hover:scale-[1.01] disabled:opacity-40"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            boxShadow:
              round.status === "open" ? "0 0 32px rgba(255,215,0,0.4)" : "none",
            letterSpacing: "0.01em",
          }}
        >
          <Plus size={16} strokeWidth={3} />
          {round.status === "open"
            ? "Déposer mes cartes"
            : round.status === "drawing"
              ? "Tirage en cours…"
              : "Round fermé"}
        </button>

        <p
          className="text-[10.5px] text-center mt-3"
          style={{ color: "var(--color-text-muted)" }}
        >
          Solde actuel : <strong>${balance.toFixed(2)}</strong> · Le gagnant
          remporte <strong>{((1 - 0.05) * 100).toFixed(0)}%</strong> du pot (5%
          commission plateforme)
        </p>

        {/* Deposit modal */}
        {showDeposit && (
          <DepositModal
            onClose={() => setShowDeposit(false)}
            onDeposit={(ids) => {
              const res = deposit(ids, profile.username || "Toi");
              if (res.ok) {
                setShowDeposit(false);
                toast.success(
                  "Dépôt confirmé",
                  `${ids.length} carte${ids.length > 1 ? "s" : ""} dans le pot.`,
                );
              } else {
                toast.error("Dépôt refusé", res.reason);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

// ── Drawing animation : pointer qui scroll horizontalement ──────────────

function DrawingAnimation({
  participants,
  totalPot,
}: {
  participants: { username: string; color: string; percentage: number }[];
  totalPot: number;
}) {
  if (totalPot === 0) return null;
  // On répète chaque participant proportionnellement à sa percentage
  const cells: { name: string; color: string }[] = [];
  for (const p of participants) {
    const count = Math.max(1, Math.round(p.percentage * 100));
    for (let i = 0; i < count; i++) {
      cells.push({ name: p.username, color: p.color });
    }
  }
  return (
    <div
      className="relative rounded-[var(--radius-md)] border p-6 mb-6 overflow-hidden"
      style={{
        background: "var(--color-bg-elevated)",
        borderColor: "rgba(255,215,0,0.4)",
        boxShadow: "0 0 32px rgba(255,215,0,0.25)",
      }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[1.4px] mb-3 text-center"
        style={{ color: "var(--color-pokemon-yellow)" }}
      >
        Tirage en cours…
      </p>
      <div
        className="relative h-12 overflow-hidden rounded-[var(--radius-sm)] border"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Pointer central */}
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1 z-10"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,204,0,1))" }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "12px solid var(--color-pokemon-yellow)",
            }}
          />
        </div>
        <div
          className="absolute left-1/2 top-0 bottom-0 w-[2px] z-10 -translate-x-1/2"
          style={{
            background:
              "linear-gradient(180deg, var(--color-pokemon-yellow), transparent)",
          }}
        />
        {/* Reel */}
        <div
          className="flex h-full"
          style={{
            animation: "jp-scroll 5.5s cubic-bezier(0.12, 0.85, 0.25, 1) both",
          }}
        >
          {cells.map((c, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-20 h-full flex items-center justify-center border-r"
              style={{
                background: c.color,
                borderColor: "rgba(0,0,0,0.2)",
                color: "white",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 11,
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
              }}
            >
              {c.name}
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes jp-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% + 50vw)); }
        }
      `}</style>
    </div>
  );
}

// ── Modal de dépôt ──────────────────────────────────────────────────────

function DepositModal({
  onClose,
  onDeposit,
}: {
  onClose: () => void;
  onDeposit: (ids: string[]) => void;
}) {
  const { items } = useInventoryGraded();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalValue = items
    .filter((it) => selected.has(it.id))
    .reduce((s, it) => s + it.price, 0);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="max-w-2xl w-full rounded-[var(--radius-lg)] border max-h-[80vh] flex flex-col"
        style={{
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border-strong)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <h2
              className="text-[18px] font-bold leading-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Déposer des cartes
            </h2>
            <p
              className="text-[11.5px] mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              Sélectionne au moins une carte de ton inventaire à miser dans le
              pot
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors hover:bg-[var(--color-bg-glass-hi)]"
            style={{ color: "var(--color-text-muted)" }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items list */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div
              className="text-center py-12 text-[13px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              <p className="mb-3">Ton inventaire est vide.</p>
              <Link
                href="/game"
                className="text-[12px] underline"
                style={{ color: "var(--color-brand)" }}
              >
                Ouvre une caisse d&apos;abord →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {items.map((item) => (
                <DepositChip
                  key={item.id}
                  item={item}
                  selected={selected.has(item.id)}
                  onClick={() => toggle(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.2px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Valeur déposée
            </p>
            <p
              className="text-[20px] font-extrabold tabular-nums leading-none mt-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-pokemon-yellow)",
              }}
            >
              ${totalValue.toFixed(2)}
            </p>
          </div>
          <button
            onClick={() => onDeposit([...selected])}
            disabled={selected.size === 0}
            className="h-11 px-5 rounded-[var(--radius-sm)] flex items-center gap-2 font-bold text-[13px] text-black transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(135deg, #FFD700, #FFA500)",
            }}
          >
            <Check size={13} strokeWidth={3} />
            Déposer ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

function DepositChip({
  item,
  selected,
  onClick,
}: {
  item: InventoryItem;
  selected: boolean;
  onClick: () => void;
}) {
  const gradeColors: Record<string, string> = {
    raw: "#A0A0A0",
    "psa-5": "#78B4FF",
    "psa-8": "#A36AFF",
    "psa-9": "#FFB450",
    "psa-10": "#FF5050",
  };
  const color = gradeColors[item.grade] ?? "#888";
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[var(--radius-sm)] border p-2.5 transition-all"
      style={{
        background: selected ? "rgba(255,215,0,0.08)" : "var(--color-bg-glass)",
        borderColor: selected ? "rgba(255,215,0,0.5)" : "var(--color-border)",
        boxShadow: selected ? "0 0 12px rgba(255,215,0,0.3)" : "none",
      }}
    >
      <p
        className="text-[11.5px] font-bold truncate leading-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        {item.card.nameFr}
      </p>
      <div className="flex items-center justify-between mt-1.5">
        <span
          className="text-[8.5px] font-extrabold uppercase tracking-[1px] px-1.5 py-0.5 rounded-[3px]"
          style={{
            background: `${color}22`,
            color,
            border: `1px solid ${color}55`,
          }}
        >
          {item.grade.toUpperCase().replace("-", " ")}
        </span>
        <span
          className="text-[11px] font-bold tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-positive)",
          }}
        >
          ${item.price.toFixed(2)}
        </span>
      </div>
    </button>
  );
}

// ── Donut SVG — accepte les participants typés ──────────────────────────

function Donut({
  participants,
  totalPot,
}: {
  participants: { color: string; depositValue: number; userId: string }[];
  totalPot: number;
}) {
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const dashes = participants.map(
    (p) => (p.depositValue / Math.max(totalPot, 0.01)) * circumference,
  );
  const offsets = dashes.reduce<number[]>((acc, _, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + dashes[i - 1]);
    return acc;
  }, []);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {participants.map((p, i) => (
        <circle
          key={p.userId}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={p.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${dashes[i]} ${circumference - dashes[i]}`}
          strokeDashoffset={-offsets[i]}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.6s" }}
        />
      ))}
      <text
        x="50%"
        y="48%"
        textAnchor="middle"
        fontSize="11"
        fontFamily="var(--font-mono)"
        fill="var(--color-text-muted)"
      >
        Pot
      </text>
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        fontSize="22"
        fontWeight="800"
        fontFamily="var(--font-display)"
        fill="var(--color-pokemon-yellow)"
      >
        ${totalPot.toFixed(0)}
      </text>
    </svg>
  );
}
