"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Archive, Gift, ShoppingCart, User } from "lucide-react";
import { BalancePill } from "@/components/game/BalancePill";
import { DailyBar } from "@/components/game/DailyBar";
import { PlayerCounter } from "@/components/game/PlayerCounter";
import { useProfile } from "@/hooks/useGame";
import { FREE_DAILY_LIMIT } from "@/data/packs";
import { LogoMark } from "@/components/ui/Logo";

// Nav secondaire — items qui ne sont pas dans GameModeTabs.
// Absorbés depuis l'ex-Sidebar gauche (refactor ergonomie PC du 14/05).
const SECONDARY_NAV = [
  { href: "/game/collection", icon: Archive, label: "Collection" },
  { href: "/game/missions", icon: Gift, label: "Missions" },
  { href: "/game/shop", icon: ShoppingCart, label: "Boutique" },
  { href: "/game/profile", icon: User, label: "Profil" },
];

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const pathname = usePathname();
  const { profile } = useProfile();
  // Profil lu depuis localStorage — gate via `mounted` pour éviter
  // mismatch SSR/CSR sur le username.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const displayName = mounted ? profile.username || "Dresseur" : "Dresseur";

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 sm:gap-4 px-4 md:px-6 py-3 border-b"
      style={{
        background: "rgba(5,7,16,0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Logo — toujours visible depuis le retrait du Sidebar */}
      <Link
        href="/game"
        aria-label="GameFolio"
        className="flex-shrink-0 transition-transform hover:scale-105"
      >
        <LogoMark size={36} />
      </Link>

      {/* Greeting (compact) — caché < sm */}
      <div className="hidden sm:flex items-baseline gap-2 ml-1">
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

      {/* Espace flex */}
      <div className="flex-1" />

      {/* Nav secondaire — Collection / Missions / Boutique / Profil
          (md+ seulement, le MobileNav du bas gère le mobile) */}
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Navigation secondaire"
      >
        {SECONDARY_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className="relative w-9 h-9 flex items-center justify-center rounded-[var(--radius-sm)] border transition-all hover:scale-105"
              style={{
                background: active
                  ? "var(--color-brand-soft)"
                  : "var(--color-bg-glass)",
                borderColor: active
                  ? "rgba(42,125,255,0.4)"
                  : "var(--color-border)",
                color: active
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                boxShadow: active ? "0 0 12px var(--color-brand-glow)" : "none",
              }}
            >
              <Icon size={14} strokeWidth={active ? 2.4 : 1.8} />
            </Link>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 md:ml-2">
        <PlayerCounter />

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
