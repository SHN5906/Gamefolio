"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Lock, Sparkles, Flame } from "lucide-react";
import type { Pack, GameCard } from "@/types/game";
import { useTCGdexCard, tcgdexImageUrl } from "@/hooks/useTCGdexCard";

interface PackCardProps {
  pack: Pack;
  affordable: boolean;
}

const TIER_LABEL: Record<Pack["tier"], string> = {
  starter: "Starter",
  common: "Commune",
  intermediate: "Standard",
  premium: "Premium",
  ultra: "Ultra",
};

export function PackCard({ pack, affordable }: PackCardProps) {
  const locked = !affordable;
  const ribbon =
    pack.badge ?? (pack.isNew ? "NEW" : pack.isFeatured ? "TOP" : null);

  // Top 3 cartes les plus chères en éventail
  const showcase: GameCard[] = useMemo(
    () => [...pack.cardPool].sort((a, b) => b.value - a.value).slice(0, 3),
    [pack.cardPool],
  );

  return (
    <Link
      href={`/game/open/${pack.id}`}
      className="group relative block rounded-[var(--radius-lg)] overflow-hidden border transition-all duration-300 hover:scale-[1.02] cursor-pointer"
      style={{
        borderColor: "var(--color-border-strong)",
        background: "var(--color-bg-elevated)",
        boxShadow: locked
          ? "var(--shadow-sm)"
          : `0 4px 24px ${pack.glowColor}, var(--shadow-md)`,
      }}
    >
      {/* Pack artwork (background) */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        style={{
          background: `linear-gradient(155deg, ${pack.gradient.from} 0%, ${pack.gradient.via ?? pack.gradient.from} 50%, ${pack.gradient.to} 100%)`,
        }}
      >
        {/* Holo shimmer */}
        <div
          className="absolute inset-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Showcase : 3 cartes en éventail */}
        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
          <div className="relative w-full h-full flex items-center justify-center">
            {showcase[1] && (
              <ShowcaseCard
                card={showcase[1]}
                rotate={-14}
                translateX={-32}
                translateY={6}
                z={1}
              />
            )}
            {showcase[2] && (
              <ShowcaseCard
                card={showcase[2]}
                rotate={14}
                translateX={32}
                translateY={6}
                z={2}
              />
            )}
            {showcase[0] && (
              <ShowcaseCard
                card={showcase[0]}
                rotate={0}
                translateX={0}
                translateY={-4}
                z={3}
                hero
              />
            )}
          </div>
        </div>

        {/* Emoji sticker en bas-droite */}
        <div
          className="absolute bottom-2 right-2 text-[28px] z-10 pointer-events-none"
          style={{ filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.5))` }}
        >
          {pack.emoji}
        </div>

        {/* Top: tier + badge */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
          <span
            className="px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-[1.2px]"
            style={{
              background: "rgba(0,0,0,0.55)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {TIER_LABEL[pack.tier]}
          </span>
          {ribbon && (
            <span
              className="px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[1.4px] flex items-center gap-1"
              style={{
                background:
                  ribbon === "JACKPOT" || ribbon === "MEGA"
                    ? "linear-gradient(135deg, #FFD700, #FFA500)"
                    : ribbon === "NICHE" || ribbon === "COLLECTOR"
                      ? "linear-gradient(135deg, #A855F7, #EC4899)"
                      : "rgba(0,0,0,0.6)",
                color:
                  ribbon === "JACKPOT" || ribbon === "MEGA" ? "#000" : "#fff",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow:
                  ribbon === "JACKPOT"
                    ? "0 0 12px rgba(255,215,0,0.6)"
                    : "none",
              }}
            >
              {ribbon === "TOP" && <Flame size={9} />}
              {ribbon === "NEW" && <Sparkles size={9} />}
              {ribbon}
            </span>
          )}
        </div>

        {/* Lock overlay — opacity réduite (0.6→0.3, sans blur) pour que
            les cartes du showcase restent visibles. L'icône cadenas suffit
            à signaler que la caisse est verrouillée. */}
        {locked && (
          <div
            className="absolute inset-0 flex items-center justify-center z-20"
            style={{
              background: "rgba(0,0,0,0.32)",
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center border"
              style={{
                background: "rgba(0,0,0,0.72)",
                borderColor: "rgba(255,255,255,0.18)",
                boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
              }}
            >
              <Lock size={20} style={{ color: "rgba(255,255,255,0.92)" }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className="text-[13px] font-bold truncate"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            {pack.nameFr}
          </p>
          <p
            className="text-[10px] truncate mt-0.5"
            style={{ color: "var(--color-text-muted)" }}
          >
            {pack.description}
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p
            className="text-[14px] font-bold tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: locked
                ? "var(--color-text-muted)"
                : "var(--color-text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            ${pack.price.toFixed(2)}
          </p>
          <p
            className="text-[9px]"
            style={{
              color: locked
                ? "var(--color-negative)"
                : "var(--color-text-muted)",
            }}
          >
            {locked ? "Solde insuf." : pack.cardPool.length + " cartes"}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── ShowcaseCard ─────────────────────────────────────────────────────────

interface ShowcaseCardProps {
  card: GameCard;
  rotate: number;
  translateX: number;
  translateY: number;
  z: number;
  hero?: boolean;
}

// Gradient riche par énergie — utilisé quand TCGdex ne renvoie pas
// l'image (cartes EX/Gold Star/Crystal obscures). Mieux qu'un rectangle
// noir transparent qui faisait croire que rien ne chargeait.
const ENERGY_GRADIENT: Record<string, string> = {
  fire: "linear-gradient(155deg, #7C2D12, #C2410C 45%, #FCD34D)",
  water: "linear-gradient(155deg, #0C4A6E, #0369A1 45%, #7DD3FC)",
  grass: "linear-gradient(155deg, #14532D, #15803D 45%, #86EFAC)",
  lightning: "linear-gradient(155deg, #713F12, #CA8A04 45%, #FEF08A)",
  psychic: "linear-gradient(155deg, #1E1B4B, #4338CA 45%, #C084FC)",
  fighting: "linear-gradient(155deg, #431407, #9A3412 45%, #FCA5A5)",
  dark: "linear-gradient(155deg, #0F172A, #1E293B 45%, #7C3AED)",
  colorless: "linear-gradient(155deg, #374151, #6B7280 45%, #D1D5DB)",
  metal: "linear-gradient(155deg, #1F2937, #4B5563 45%, #94A3B8)",
  fairy: "linear-gradient(155deg, #831843, #DB2777 45%, #F8A5C2)",
  dragon: "linear-gradient(155deg, #312E81, #6366F1 45%, #6B5BA8)",
};

export function ShowcaseCard({
  card,
  rotate,
  translateX,
  translateY,
  z,
  hero,
}: ShowcaseCardProps) {
  // Image et nom depuis TCGdex (source unique de vérité). Pour les cartes
  // rares absentes de l'API (EX/Gold Star/Crystal), on retombe sur un
  // gradient typé énergie + nom — visuellement riche, pas un placeholder
  // gris qui fait croire que la pack est cassé.
  const { data: tcgCard } = useTCGdexCard(card.id);
  const imageUrl = tcgdexImageUrl(tcgCard, "low") ?? card.imageUrl;
  // On préfère le nom curé du pack (ex: "Pikachu Illustrateur") à celui
  // remonté par TCGdex (qui renverrait "Pikachu" pour le même art).
  const displayName = card.nameFr || tcgCard?.name || card.name;
  const energy = card.energy.toLowerCase();
  const fallbackBg = ENERGY_GRADIENT[energy] ?? ENERGY_GRADIENT.colorless;

  return (
    <div
      className="absolute"
      style={{
        transform: `translate(${translateX}%, ${translateY}%) rotate(${rotate}deg)`,
        zIndex: z,
        width: hero ? "52%" : "46%",
        aspectRatio: "5/7",
        filter: hero
          ? "drop-shadow(0 14px 28px rgba(0,0,0,0.6))"
          : "drop-shadow(0 8px 16px rgba(0,0,0,0.45))",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayName}
          className="w-full h-full object-cover rounded-[6px]"
          style={{
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
      ) : (
        <div
          className="relative w-full h-full rounded-[6px] overflow-hidden flex items-end p-2"
          style={{
            background: fallbackBg,
            border: "1px solid rgba(255,255,255,0.28)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          {/* Sheen subtle pour donner l'impression d'un foil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) 50%, transparent 70%)",
              mixBlendMode: "overlay",
            }}
          />
          <span
            className="relative text-[10px] font-bold leading-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "rgba(255,255,255,0.95)",
              textShadow: "0 1px 3px rgba(0,0,0,0.7)",
              wordBreak: "break-word",
            }}
          >
            {displayName}
          </span>
        </div>
      )}
    </div>
  );
}
