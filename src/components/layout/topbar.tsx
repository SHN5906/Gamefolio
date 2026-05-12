"use client";

import Link from "next/link";
import { BalancePill } from "@/components/game/BalancePill";
import { DailyBar } from "@/components/game/DailyBar";
import { useProfile } from "@/hooks/useGame";
import { FREE_DAILY_LIMIT } from "@/data/packs";
import { LogoMark } from "@/components/ui/Logo";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { profile } = useProfile();
  const displayName = profile.username || "Dresseur";

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 sm:gap-4 px-4 md:px-8 py-3 border-b"
      style={{
        background: "rgba(5,7,16,0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo — visible sur mobile uniquement (sidebar masquée) */}
      <Link
        href="/game"
        aria-label="GameFolio"
        className="md:hidden flex-shrink-0"
      >
        <LogoMark size={36} />
      </Link>

      {/* Greeting (compact) — caché < sm */}
      <div className="hidden sm:flex items-baseline gap-2">
        <p
          className="text-[11px] font-semibold uppercase tracking-[1.2px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {subtitle ?? "Salut"}
        </p>
        <p
          className="text-[13px] font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-secondary)",
          }}
        >
          {title ?? displayName}
        </p>
      </div>

      {/* Espace flex — la barre est compacte, plus de search global */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* DailyBar masquée tant qu'il n'y a pas d'ouvertures gratuites */}
        {FREE_DAILY_LIMIT > 0 && (
          <div className="hidden sm:block">
            <DailyBar compact />
          </div>
        )}

        <BalancePill />
      </div>
    </div>
  );
}
