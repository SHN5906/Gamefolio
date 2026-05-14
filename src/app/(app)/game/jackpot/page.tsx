"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Users, Plus, History } from "lucide-react";
import { useBalance } from "@/hooks/useGame";

interface MockDeposit {
  initial: string;
  username: string;
  value: number;
  cardCount: number;
  color: string;
}

const MOCK_DEPOSITS: MockDeposit[] = [
  {
    initial: "L",
    username: "LiamPro",
    value: 28.5,
    cardCount: 3,
    color: "#5B7FFF",
  },
  {
    initial: "M",
    username: "MewMaster",
    value: 18.2,
    cardCount: 5,
    color: "#10D9A0",
  },
  {
    initial: "S",
    username: "ShinyKing",
    value: 14.8,
    cardCount: 2,
    color: "#FFCC00",
  },
  {
    initial: "R",
    username: "RainbowGod",
    value: 9.5,
    cardCount: 4,
    color: "#EC4899",
  },
  {
    initial: "D",
    username: "DraGoat",
    value: 6.0,
    cardCount: 2,
    color: "#FF4D5E",
  },
];

function getEndsIn(): string {
  const now = new Date();
  const target = new Date(now);
  target.setMinutes(target.getMinutes() + 4 - (target.getMinutes() % 5));
  target.setSeconds(0);
  if (target.getTime() <= now.getTime())
    target.setMinutes(target.getMinutes() + 5);
  const ms = target.getTime() - now.getTime();
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function JackpotPage() {
  const { balance } = useBalance();
  const [endsIn, setEndsIn] = useState("—:—");
  const totalPot = MOCK_DEPOSITS.reduce((s, d) => s + d.value, 0);

  useEffect(() => {
    setEndsIn(getEndsIn());
    const interval = setInterval(() => setEndsIn(getEndsIn()), 1000);
    return () => clearInterval(interval);
  }, []);

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
              Pot total · Tirage dans
            </p>
            <p
              className="text-[14px] font-mono tabular-nums mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {endsIn}
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
              ${totalPot.toFixed(2)}
            </p>
            <p
              className="text-[13px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Users size={11} className="inline mr-1" />
              {MOCK_DEPOSITS.length} participants ·{" "}
              {MOCK_DEPOSITS.reduce((s, d) => s + d.cardCount, 0)} cartes en jeu
            </p>
          </div>
        </div>

        {/* Mock notice */}
        <div
          className="rounded-[var(--radius-sm)] border px-4 py-2.5 mb-6 text-[11.5px]"
          style={{
            background: "var(--color-bg-glass)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          ⚠️ Mode démo — le jackpot temps réel arrive avec Supabase Realtime.
        </div>

        {/* 2-col layout: Donut + List */}
        <div className="grid gap-5 grid-cols-1 lg:[grid-template-columns:340px_1fr] mb-6">
          {/* Donut */}
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
            <Donut deposits={MOCK_DEPOSITS} totalPot={totalPot} />
          </div>

          {/* Participants list */}
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
              {MOCK_DEPOSITS.sort((a, b) => b.value - a.value).map((d) => {
                const pct = (d.value / totalPot) * 100;
                return (
                  <div
                    key={d.username}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
                      style={{ background: d.color }}
                    >
                      {d.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[13px] font-semibold truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {d.username}
                      </p>
                      <p
                        className="text-[10.5px]"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {d.cardCount} carte{d.cardCount > 1 ? "s" : ""} · $
                        {d.value.toFixed(2)}
                      </p>
                    </div>
                    {/* Mini bar */}
                    <div className="w-24 hidden sm:block">
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: d.color }}
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

        {/* Deposit CTA */}
        <button
          disabled={balance < 0.5}
          className="w-full h-14 rounded-[var(--radius-md)] flex items-center justify-center gap-2 font-extrabold text-[15px] text-black transition-all hover:scale-[1.01] disabled:opacity-40"
          style={{
            fontFamily: "var(--font-display)",
            background: "linear-gradient(135deg, #FFD700, #FFA500)",
            boxShadow: balance < 0.5 ? "none" : "0 0 32px rgba(255,215,0,0.4)",
            letterSpacing: "0.01em",
          }}
        >
          <Plus size={16} strokeWidth={3} />
          Déposer mes cartes (bientôt dispo)
        </button>
      </div>
    </div>
  );
}

// ── Donut SVG ───────────────────────────────────────────────────────────

function Donut({
  deposits,
  totalPot,
}: {
  deposits: MockDeposit[];
  totalPot: number;
}) {
  const size = 220;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cumulative offset par index calculé en amont — pas de réaffectation
  // pendant le render (react-hooks/immutability).
  const dashes = deposits.map((d) => (d.value / totalPot) * circumference);
  const offsets = dashes.reduce<number[]>((acc, dash, i) => {
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
      {deposits.map((d, i) => (
        <circle
          key={d.username}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={d.color}
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
