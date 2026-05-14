"use client";

import { RefreshCw, Sparkles } from "lucide-react";
import { useCooldown, useBalance } from "@/hooks/useGame";

export function CooldownBanner() {
  const { canClaim, refreshAmount, claim } = useCooldown();
  const { balance } = useBalance();

  // Bannière visible uniquement si un bonus est claimable.
  // Note dev : la branche "Plus de solde — pause forcée" (cooldown actif)
  // est retirée pour ne pas bloquer la démo. À réactiver en prod pour le
  // jeu responsable — voir DEPLOY.md Phase 2.
  if (balance > 0 && !canClaim) return null;

  if (canClaim) {
    return (
      <div
        className="rounded-[var(--radius-md)] border p-4 mb-5 flex items-center gap-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(16,217,160,0.10), rgba(0,212,255,0.06))",
          borderColor: "rgba(16,217,160,0.35)",
          boxShadow: "0 0 24px rgba(16,217,160,0.18)",
        }}
      >
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(16,217,160,0.18)",
            border: "1px solid rgba(16,217,160,0.4)",
          }}
        >
          <Sparkles size={18} style={{ color: "var(--color-positive)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-semibold uppercase tracking-[1.2px]"
            style={{ color: "var(--color-positive)" }}
          >
            Bonus disponible
          </p>
          <p
            className="text-[14px] font-bold mt-0.5"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Récupère{" "}
            <span style={{ color: "var(--color-positive)" }}>
              +${refreshAmount.toFixed(2)}
            </span>{" "}
            pour rejouer
          </p>
        </div>
        <button
          onClick={() => claim()}
          className="flex items-center gap-2 h-10 px-4 rounded-[var(--radius-sm)] font-bold text-[13px] text-white transition-all hover:scale-[1.03]"
          style={{
            fontFamily: "var(--font-display)",
            background:
              "linear-gradient(135deg, var(--color-positive), var(--color-cyan))",
            boxShadow: "0 0 16px rgba(16,217,160,0.4)",
          }}
        >
          <RefreshCw size={13} />
          Réclamer
        </button>
      </div>
    );
  }

  return null;
}
