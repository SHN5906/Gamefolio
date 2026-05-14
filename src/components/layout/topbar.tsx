"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Archive,
  Gift,
  Package,
  ShoppingCart,
  Swords,
  Target,
  Trophy,
  User,
  Wand2,
} from "lucide-react";
import { BalancePill } from "@/components/game/BalancePill";
import { DailyBar } from "@/components/game/DailyBar";
import { PlayerCounter } from "@/components/game/PlayerCounter";
import { useProfile } from "@/hooks/useGame";
import { FREE_DAILY_LIMIT } from "@/data/packs";
import { LogoMark } from "@/components/ui/Logo";

// Nav primaire — les 5 modes de jeu, anciennement dans GameModeTabs.
// Fusionnés dans la Topbar (refactor du 14/05) pour éliminer le risque
// qu'un stacking context / cache build perdu fasse disparaître la barre
// de tabs séparée. Single source of truth = la topbar.
const PRIMARY_NAV: {
  href: string;
  icon: typeof Package;
  label: string;
  badge?: "NEW" | "LIVE";
  exact?: boolean;
}[] = [
  { href: "/game", icon: Package, label: "Caisses", exact: true },
  { href: "/game/wheel", icon: Target, label: "Roue", badge: "NEW" },
  { href: "/game/battle", icon: Swords, label: "Battles" },
  { href: "/game/jackpot", icon: Trophy, label: "Jackpot", badge: "LIVE" },
  { href: "/game/regrade", icon: Wand2, label: "Re-grade", badge: "NEW" },
];

function isPrimaryActive(
  pathname: string,
  tab: (typeof PRIMARY_NAV)[number],
): boolean {
  if (tab.exact) {
    return (
      pathname === tab.href ||
      pathname === "/game/open" ||
      pathname.startsWith("/game/open/")
    );
  }
  return pathname.startsWith(tab.href);
}

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

      {/* Greeting (compact) — caché < lg pour laisser la place à la nav primaire */}
      <div className="hidden xl:flex items-baseline gap-2 ml-1">
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

      {/* Nav primaire — les 5 modes de jeu, anciennement GameModeTabs */}
      <nav
        className="hidden md:flex items-center gap-0.5 ml-2"
        aria-label="Modes de jeu"
      >
        {PRIMARY_NAV.map((tab) => {
          const active = isPrimaryActive(pathname, tab);
          const Icon = tab.icon;
          const isLive = tab.badge === "LIVE";
          const isNew = tab.badge === "NEW";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="relative flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-sm)] transition-colors"
              style={{
                color: active
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                background: active ? "rgba(42,125,255,0.12)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.color = "var(--color-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--color-text-muted)";
                }
              }}
            >
              <Icon size={13} strokeWidth={active ? 2.4 : 1.8} />
              <span
                className="text-[11.5px] font-bold uppercase tracking-[0.8px] whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {tab.label}
              </span>
              {tab.badge && (
                <span
                  className="text-[8px] font-extrabold px-1 py-0.5 rounded-[3px] uppercase tracking-[1px]"
                  style={{
                    background: isLive
                      ? "rgba(255,51,68,0.18)"
                      : "rgba(255,215,64,0.16)",
                    color: isLive ? "#FF3344" : "#FFD740",
                    border: `1px solid ${isLive ? "rgba(255,51,68,0.4)" : "rgba(255,215,64,0.4)"}`,
                  }}
                >
                  {isLive && (
                    <span
                      className="inline-block w-1 h-1 rounded-full pulse-live mr-0.5 align-middle"
                      style={{ background: "#FF3344" }}
                    />
                  )}
                  {tab.badge}
                </span>
              )}
              {active && (
                <motion.span
                  layoutId="topbar-primary-underline"
                  className="absolute -bottom-3 left-2 right-2 h-[2px] rounded-t-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, var(--color-brand) 20%, var(--color-cyan) 80%, transparent)",
                    boxShadow: "0 0 8px var(--color-brand-glow)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

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
