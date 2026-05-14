"use client";

// Barre de tabs horizontale plein écran, signature Hellcase.
// Affichée sous le topbar sur toutes les pages /game/*. Remplace
// fonctionnellement les QuickActions de l'ancien /game home — qui sont
// maintenant le mode primaire de navigation entre les modes de jeu.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Target, Swords, Trophy, Wand2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: "NEW" | "LIVE" | string;
  /** Vrai si la route active est exactement cette URL (sinon `startsWith`). */
  exact?: boolean;
}

const TABS: Tab[] = [
  { href: "/game", icon: Package, label: "Caisses", exact: true },
  { href: "/game/wheel", icon: Target, label: "Roue", badge: "NEW" },
  { href: "/game/battle", icon: Swords, label: "Battles" },
  { href: "/game/jackpot", icon: Trophy, label: "Jackpot", badge: "LIVE" },
  { href: "/game/regrade", icon: Wand2, label: "Re-grade", badge: "NEW" },
];

function isActive(pathname: string, tab: Tab): boolean {
  if (tab.exact) {
    // Match exact pour /game (sinon /game/battle activerait aussi /game)
    return (
      pathname === tab.href ||
      pathname === "/game/open" ||
      pathname.startsWith("/game/open/") ||
      pathname === "/game/collection" ||
      pathname === "/game/missions" ||
      pathname === "/game/shop" ||
      pathname === "/game/profile"
    );
  }
  return pathname.startsWith(tab.href);
}

export function GameModeTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-20 flex items-stretch w-full border-b overflow-x-auto"
      style={{
        background: "rgba(5,7,16,0.95)",
        borderColor: "var(--color-border)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
      aria-label="Modes de jeu"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab);
        const Icon = tab.icon;
        const isLive = tab.badge === "LIVE";
        const isNew = tab.badge === "NEW";
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="relative flex-1 min-w-[120px] flex items-center justify-center gap-2 h-12 sm:h-14 px-4 transition-colors group"
            style={{
              color: active
                ? "var(--color-text-primary)"
                : "var(--color-text-muted)",
              background: active ? "rgba(42,125,255,0.08)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "rgba(255,255,255,0.025)";
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
            <Icon size={14} strokeWidth={active ? 2.4 : 1.8} />
            <span
              className="text-[12.5px] font-bold uppercase tracking-[1px] whitespace-nowrap"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tab.label}
            </span>
            {tab.badge && (
              <span
                className="text-[8.5px] font-extrabold px-1.5 py-0.5 rounded-[3px] uppercase tracking-[1.2px] ml-1"
                style={{
                  background: isLive
                    ? "rgba(255,51,68,0.18)"
                    : isNew
                      ? "rgba(255,215,64,0.16)"
                      : "rgba(0,212,255,0.16)",
                  color: isLive ? "#FF3344" : isNew ? "#FFD740" : "#00D4FF",
                  border: `1px solid ${isLive ? "rgba(255,51,68,0.4)" : isNew ? "rgba(255,215,64,0.4)" : "rgba(0,212,255,0.4)"}`,
                }}
              >
                {isLive && (
                  <span
                    className="inline-block w-1 h-1 rounded-full pulse-live mr-1 align-middle"
                    style={{ background: "#FF3344" }}
                  />
                )}
                {tab.badge}
              </span>
            )}
            {/* Underline animé — sliding entre tabs via layoutId partagé.
                Framer interpole le bounding box du span entre l'ancien
                onglet actif et le nouveau → glissement fluide façon
                Hellcase / Apple TV tabs. Bonne raison technique de garder
                framer-motion (déjà utilisé par CaseOpener). */}
            {active && (
              <motion.span
                layoutId="game-tabs-underline"
                className="absolute bottom-0 left-2 right-2 h-[2px] rounded-t-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, var(--color-brand) 20%, var(--color-cyan) 80%, transparent)",
                  boxShadow: "0 0 8px var(--color-brand-glow)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 32,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
