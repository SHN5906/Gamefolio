"use client";

// Compteur de joueurs en ligne — pattern Hellcase/Roobet. Le chiffre fluctue
// légèrement (+/- quelques dizaines toutes les 3-5s) pour donner une
// impression de "site vivant". Phase 2 = vrai count Supabase via
// presence channel.

import { useEffect, useState } from "react";

const BASE = 2847;

export function PlayerCounter() {
  const [count, setCount] = useState(BASE);

  useEffect(() => {
    // Tick une fois par seconde, drift léger (±15)
    const interval = setInterval(() => {
      setCount((prev) => {
        const drift = Math.floor((Math.random() - 0.5) * 30);
        const next = prev + drift;
        // Clamp dans une fourchette plausible
        return Math.max(BASE - 200, Math.min(BASE + 350, next));
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] border"
      style={{
        background: "rgba(0,255,136,0.06)",
        borderColor: "rgba(0,255,136,0.18)",
      }}
      title={`${count.toLocaleString("fr-FR")} joueurs connectés`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full pulse-live flex-shrink-0"
        style={{ background: "#00FF88", boxShadow: "0 0 6px #00FF88" }}
      />
      <span
        className="text-[11px] font-extrabold tabular-nums leading-none"
        style={{
          fontFamily: "var(--font-mono)",
          color: "#00FF88",
        }}
      >
        {count.toLocaleString("fr-FR")}
      </span>
      <span
        className="text-[9px] font-semibold uppercase tracking-[1px] leading-none"
        style={{ color: "rgba(0,255,136,0.7)" }}
      >
        Online
      </span>
    </div>
  );
}
