"use client";

// Historique des 20 derniers rounds du jackpot — lecture de
// localStorage `gf:jackpot.history` rempli par jackpot.ts.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, History as HistoryIcon, Trophy } from "lucide-react";
import {
  getJackpotHistory,
  HOUSE_FEE,
  type JackpotRound,
} from "@/lib/data/jackpot";

export default function JackpotHistoryPage() {
  const [history, setHistory] = useState<JackpotRound[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHistory(getJackpotHistory());
    // Resync sur dispatch du jackpot (settle d'un nouveau round)
    const onChange = () => setHistory(getJackpotHistory());
    window.addEventListener("gf:jackpot-changed", onChange);
    return () => window.removeEventListener("gf:jackpot-changed", onChange);
  }, []);

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1100 }}
      >
        <Link
          href="/game/jackpot"
          className="flex items-center gap-2 text-[12px] font-medium mb-5 transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={13} />
          Retour au jackpot
        </Link>

        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            <HistoryIcon
              size={14}
              style={{ color: "var(--color-pokemon-yellow)" }}
            />
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Historique · 20 derniers tirages
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
            Rounds passés
          </h1>
        </div>

        {!mounted ? null : history.length === 0 ? (
          <div
            className="rounded-[var(--radius-md)] border p-8 text-center"
            style={{
              background: "var(--color-bg-glass)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            <p className="text-[13px]">
              Pas encore de round terminé. Reviens après le prochain tirage.
            </p>
          </div>
        ) : (
          <div
            className="rounded-[var(--radius-md)] border overflow-hidden"
            style={{
              background: "var(--color-bg-elevated)",
              borderColor: "var(--color-border-strong)",
            }}
          >
            {/* Header */}
            <div
              className="grid grid-cols-[1fr_140px_120px_110px] gap-3 px-4 py-3 border-b text-[10px] font-semibold uppercase tracking-[1.2px]"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text-muted)",
              }}
            >
              <span>Date</span>
              <span>Gagnant</span>
              <span className="text-right">Pot total</span>
              <span className="text-right">Net payout</span>
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {history.map((r) => (
                <Row key={r.id} round={r} />
              ))}
            </div>
          </div>
        )}

        <p
          className="text-[11px] text-center mt-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          House fee : {(HOUSE_FEE * 100).toFixed(0)}% du pot · Le reste revient
          au gagnant
        </p>
      </div>
    </div>
  );
}

function Row({ round }: { round: JackpotRound }) {
  const endDate = new Date(round.endsAt);
  const dateLabel = endDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const winner = round.participants.find((p) => p.userId === round.winnerId);
  const isUserWin = winner?.isUser ?? false;

  return (
    <div
      className="grid grid-cols-[1fr_140px_120px_110px] gap-3 px-4 py-3 items-center text-[12.5px]"
      style={{
        background: isUserWin ? "rgba(0,212,255,0.05)" : "transparent",
      }}
    >
      <span
        className="tabular-nums truncate"
        style={{ color: "var(--color-text-muted)" }}
      >
        {dateLabel}
      </span>
      <span className="flex items-center gap-1.5 min-w-0">
        {winner ? (
          <>
            <span
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold text-white"
              style={{ background: winner.color }}
            >
              {winner.initial}
            </span>
            <span
              className="truncate font-semibold"
              style={{
                color: isUserWin
                  ? "var(--color-cyan)"
                  : "var(--color-text-primary)",
              }}
            >
              {winner.username}
            </span>
            {isUserWin && (
              <Trophy
                size={11}
                style={{ color: "var(--color-cyan)" }}
                strokeWidth={2.5}
              />
            )}
          </>
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>—</span>
        )}
      </span>
      <span
        className="text-right tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-secondary)",
        }}
      >
        ${round.totalPot.toFixed(2)}
      </span>
      <span
        className="text-right tabular-nums font-bold"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-positive)",
        }}
      >
        ${(round.netPayout ?? 0).toFixed(2)}
      </span>
    </div>
  );
}
