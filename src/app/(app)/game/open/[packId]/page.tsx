"use client";

import { useCallback, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCw, Archive, AlertCircle } from "lucide-react";
import { CaseOpener } from "@/components/game/CaseOpener";
import { CooldownBanner } from "@/components/game/CooldownBanner";
import { getPackById } from "@/data/packs";
import { useBalance, useOpenPack } from "@/hooks/useGame";
import { useTCGdexCard, tcgdexImageUrl } from "@/hooks/useTCGdexCard";
import type { GameCard, Grade } from "@/types/game";

interface PageProps {
  params: Promise<{ packId: string }>;
}

export default function OpenPackPage({ params }: PageProps) {
  const { packId } = use(params);
  const router = useRouter();
  const pack = getPackById(packId);

  const { balance } = useBalance();
  const openPack = useOpenPack();

  const [triggerKey, setTriggerKey] = useState(0);
  const [opening, setOpening] = useState(false);
  const [lastWon, setLastWon] = useState<{
    card: GameCard;
    grade: Grade;
    price: number;
  } | null>(null);

  if (!pack) {
    return (
      <div className="min-h-full flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle
            size={32}
            style={{ color: "var(--color-negative)" }}
            className="mx-auto mb-3"
          />
          <p
            className="text-[14px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Caisse introuvable.
          </p>
          <Link
            href="/game"
            className="mt-4 inline-block text-[12px] font-medium"
            style={{ color: "var(--color-brand)" }}
          >
            ← Retour au jeu
          </Link>
        </div>
      </div>
    );
  }

  const cost = pack.price;
  // Note dev : on retire le gate `!cooldown.active` pour ne pas bloquer la
  // démo. À réactiver en prod (jeu responsable — pause forcée si solde=0).
  const canAfford = balance >= pack.price;

  const handleOpen = () => {
    if (!canAfford || opening) return;
    setOpening(true);
    setLastWon(null);
    setTriggerKey((k) => k + 1);
  };

  // useCallback stable — sinon CaseOpener re-déclenche l'animation à chaque render
  const handleComplete = useCallback(
    (card: GameCard, grade: Grade, price: number) => {
      openPack(pack.id, card, grade, price, cost, false);
      setLastWon({ card, grade, price });
      setOpening(false);
    },
    [openPack, pack.id, cost],
  );

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1280 }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/game")}
          className="flex items-center gap-2 text-[12px] font-medium mb-5 transition-colors hover:text-[var(--color-text-primary)]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <ArrowLeft size={13} />
          Retour aux caisses
        </button>

        <CooldownBanner />

        {/* Pack header */}
        <div
          className="relative rounded-[var(--radius-lg)] border overflow-hidden mb-6 p-6 sm:p-8"
          style={{
            background: `linear-gradient(135deg, ${pack.gradient.from}, ${pack.gradient.via ?? pack.gradient.from}, ${pack.gradient.to})`,
            borderColor: "var(--color-border-strong)",
            boxShadow: `0 8px 40px ${pack.glowColor}`,
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.4) 0, transparent 50%)",
            }}
          />
          <div className="relative flex items-center gap-5 z-10">
            <div
              className="text-[64px] sm:text-[80px] flex-shrink-0"
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.5))" }}
            >
              {pack.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-[22px] sm:text-[28px] font-extrabold tracking-tight leading-none"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "#fff",
                  letterSpacing: "-0.02em",
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                {pack.nameFr}
              </h1>
              <p
                className="text-[13px] mt-2"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {pack.description}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[1.2px]"
                  style={{
                    background: "rgba(0,0,0,0.45)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {pack.cardPool.length} cartes possibles
                </span>
                <span
                  className="text-[16px] font-extrabold tabular-nums"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "#fff",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  }}
                >
                  ${pack.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Case Opener */}
        <CaseOpener
          pack={pack}
          onComplete={handleComplete}
          triggerKey={triggerKey}
        />

        {/* Action bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border"
            style={{
              background: "var(--color-bg-glass)",
              borderColor: "var(--color-border)",
            }}
          >
            <div className="flex flex-col">
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.2px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Solde actuel
              </p>
              <p
                className="text-[15px] font-bold tabular-nums"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-positive)",
                }}
              >
                ${balance.toFixed(2)}
              </p>
            </div>
            <div
              className="w-px h-8"
              style={{ background: "var(--color-border)" }}
            />
            <div className="flex flex-col">
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.2px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Coût
              </p>
              <p
                className="text-[15px] font-bold tabular-nums"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-primary)",
                }}
              >
                −${pack.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastWon && (
              <Link
                href="/game/collection"
                className="flex items-center justify-center gap-2 h-12 px-4 rounded-[var(--radius-sm)] border text-[13px] font-semibold transition-all hover:bg-[var(--color-bg-glass-hi)]"
                style={{
                  borderColor: "var(--color-border-strong)",
                  background: "var(--color-bg-glass)",
                  color: "var(--color-text-primary)",
                }}
              >
                <Archive size={14} />
                Voir collection
              </Link>
            )}
            <button
              onClick={handleOpen}
              disabled={!canAfford || opening}
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-[var(--radius-sm)] font-extrabold text-[14px] text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
              style={{
                fontFamily: "var(--font-display)",
                background: opening
                  ? "var(--color-bg-glass-hi)"
                  : "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
                boxShadow: opening
                  ? "none"
                  : "0 0 24px var(--color-brand-glow)",
                letterSpacing: "0.01em",
              }}
            >
              {opening ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  Ouverture…
                </>
              ) : !canAfford ? (
                "Solde insuffisant"
              ) : (
                <>
                  {lastWon ? "Rejouer" : "Ouvrir"} – ${pack.price.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Probabilités */}
        <DropTable pack={pack} />
      </div>
    </div>
  );
}

// ── Drop Table ──────────────────────────────────────────────────────────

// Couleur d'accent par tier d'animation — référence Hellcase (orange =
// covert, rose = classified, violet = restricted, bleu = mil-spec).
const TIER_ACCENT: Record<GameCard["animTier"], string> = {
  legendary: "#FF6B47",
  epic: "#EC4899",
  rare: "#A855F7",
  base: "#3B82F6",
};

function DropTable({ pack }: { pack: ReturnType<typeof getPackById> }) {
  const [open, setOpen] = useState(false);
  if (!pack) return null;

  const sorted = [...pack.cardPool].sort((a, b) => b.value - a.value);

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[1.2px] mb-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span style={{ color: "var(--color-text-primary)" }}>
          📦 La caisse contient
        </span>
        <span className="text-[10px]">({pack.cardPool.length} cartes)</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2.5">
          {sorted.map((c, i) => (
            <DropCard key={c.id + i} card={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function DropCard({ card }: { card: GameCard }) {
  const { data: tcgCard } = useTCGdexCard(card.id);
  const displayName = card.nameFr || tcgCard?.name || card.name;
  const setName = card.setFr || tcgCard?.set?.name || card.set;
  const imageUrl = tcgdexImageUrl(tcgCard, "low") ?? card.imageUrl;
  const accent = TIER_ACCENT[card.animTier];

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-[var(--radius-sm)] border transition-transform hover:scale-[1.02] hover:z-10"
      style={{
        background: "rgba(15,18,30,0.6)",
        borderColor: "rgba(255,255,255,0.06)",
        borderTop: `2px solid ${accent}`,
        boxShadow: `inset 0 1px 0 ${accent}40`,
      }}
      title={`${displayName} — ${setName} — ${card.dropRate.toFixed(2)}%`}
    >
      {/* Top bar : gains % + info icon — pattern Hellcase */}
      <div className="flex items-center justify-between px-2 pt-1.5 pb-1">
        <span
          className="text-[10px] font-medium tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          <span style={{ color: "var(--color-text-secondary)" }}>Gains</span>{" "}
          <span style={{ color: "var(--color-text-primary)" }}>
            {card.dropRate.toFixed(3)}%
          </span>
        </span>
        <span
          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.08)",
            color: "var(--color-text-muted)",
          }}
          aria-hidden="true"
        >
          i
        </span>
      </div>

      {/* Card art — image TCGdex centrée sur fond watermark énergie */}
      <div
        className="relative flex items-center justify-center px-3 pb-2 pt-1"
        style={{
          background: `radial-gradient(ellipse at center, ${accent}18, transparent 70%)`,
          aspectRatio: "1 / 1",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={displayName}
            className="max-h-full max-w-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[10px] text-center p-2 rounded-[3px]"
            style={{
              color: "var(--color-text-muted)",
              background: `linear-gradient(135deg, ${accent}30, transparent)`,
            }}
          >
            {displayName}
          </div>
        )}
      </div>

      {/* Bottom : set name (small) + card name (bigger) — pattern Hellcase */}
      <div className="px-2.5 pb-2 pt-1">
        <p
          className="text-[10px] font-medium truncate"
          style={{ color: "var(--color-text-muted)" }}
        >
          {setName}
        </p>
        <p
          className="text-[12px] font-bold truncate"
          style={{ color: "var(--color-text-primary)" }}
        >
          {displayName}
        </p>
        <p
          className="text-[10.5px] font-extrabold tabular-nums mt-0.5"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-positive)",
          }}
        >
          ${card.value.toFixed(2)}
        </p>
      </div>
    </div>
  );
}
