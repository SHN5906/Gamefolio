"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DollarSign, Plus } from "lucide-react";
import { useBalance } from "@/hooks/useGame";

export function BalancePill() {
  const { balance } = useBalance();
  // Balance lue depuis localStorage côté client → diverge du SSR (qui
  // rend 0.00). On gate l'affichage derrière `mounted` pour éviter le
  // mismatch d'hydratation. Même pattern que Sidebar/Topbar greeting.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const displayBalance = mounted ? balance : 0;

  return (
    <Link
      href="/game/shop"
      className="group relative flex items-center gap-2 h-9 pl-2 pr-1 rounded-[var(--radius-sm)] border transition-all duration-200 hover:scale-[1.02]"
      style={{
        background:
          "linear-gradient(135deg, rgba(16,217,160,0.12), rgba(0,212,255,0.08))",
        borderColor: "rgba(16,217,160,0.25)",
        boxShadow:
          "0 0 16px rgba(16,217,160,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      title="Solde — Acheter plus"
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, var(--color-positive), #00D4FF)",
          boxShadow: "0 0 8px var(--color-positive-glow)",
        }}
      >
        <DollarSign size={12} strokeWidth={3} color="white" />
      </div>
      <span
        className="text-[13px] font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-text-primary)",
          letterSpacing: "-0.01em",
        }}
      >
        {displayBalance.toFixed(2)}
      </span>
      <div
        className="w-6 h-7 rounded-[6px] flex items-center justify-center transition-colors"
        style={{
          background: "var(--color-bg-glass)",
          color: "var(--color-text-secondary)",
        }}
      >
        <Plus size={11} strokeWidth={2.5} />
      </div>
    </Link>
  );
}
