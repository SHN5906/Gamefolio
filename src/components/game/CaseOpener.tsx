"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import type { GameCard, Grade, Pack } from "@/types/game";
import { rollPackOutcome } from "@/data/packs";
import {
  useTCGdexCard,
  tcgdexImageUrl,
  useTCGdexCards,
} from "@/hooks/useTCGdexCard";

const GRADE_LABEL: Record<Grade, string> = {
  raw: "RAW",
  "psa-5": "PSA 5",
  "psa-8": "PSA 8",
  "psa-9": "PSA 9",
  "psa-10": "PSA 10",
};

const GRADE_COLOR: Record<Grade, string> = {
  raw: "rgba(180,180,180,0.85)",
  "psa-5": "rgba(120,180,255,0.9)",
  "psa-8": "rgba(140,90,255,0.95)",
  "psa-9": "rgba(255,180,80,1)",
  "psa-10": "rgba(255,80,80,1)",
};

// Ref stable pour onComplete (évite que les re-renders ne relancent l'effet)
function useEvent<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);
  useEffect(() => {
    ref.current = fn;
  });
  return useRef(((...args: Parameters<T>) => ref.current(...args)) as T)
    .current;
}

interface CaseOpenerProps {
  pack: Pack;
  // L'animation choisit la carte ET le grade dès le déclenchement,
  // puis remonte les 3 valeurs en fin d'animation pour que la page
  // débite le solde et crédite l'inventaire.
  onComplete: (card: GameCard, grade: Grade, price: number) => void;
  triggerKey: number;
}

const RAIL_LENGTH = 60;
const WINNER_INDEX = 52;
const CARD_W = 120;
const CARD_GAP = 12;

const RARITY_COLOR: Record<string, string> = {
  common: "rgba(180,180,180,0.55)",
  uncommon: "rgba(120,180,120,0.6)",
  rare: "rgba(80,150,255,0.7)",
  holo: "rgba(140,90,255,0.75)",
  ex: "rgba(255,100,100,0.75)",
  gx: "rgba(255,80,180,0.8)",
  v: "rgba(255,80,180,0.8)",
  vmax: "rgba(255,80,180,0.85)",
  "tag-team": "rgba(120,200,255,0.85)",
  shining: "rgba(255,220,80,0.95)",
  "gold-star": "rgba(255,200,0,1)",
  crystal: "rgba(140,255,255,1)",
  "secret-rare": "rgba(255,100,255,1)",
  "rainbow-rare": "rgba(255,180,255,1)",
};

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

function rarityColor(r: string) {
  return RARITY_COLOR[r] ?? "rgba(255,255,255,0.5)";
}

function energyGradient(e: string) {
  return ENERGY_GRADIENT[e] ?? ENERGY_GRADIENT.colorless;
}

export function CaseOpener({ pack, onComplete, triggerKey }: CaseOpenerProps) {
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [rail, setRail] = useState<GameCard[]>([]);
  const [winner, setWinner] = useState<{
    card: GameCard;
    grade: Grade;
    price: number;
  } | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const onCompleteEvent = useEvent(onComplete);

  // ── PRÉFETCH : déclenche le fetch de toutes les cartes uniques du pool
  // Comme React Query dedupe par queryKey, les composants enfants utiliseront le cache.
  const uniqueIds = useMemo(
    () => Array.from(new Set(pack.cardPool.map((c) => c.id))),
    [pack.cardPool],
  );
  useTCGdexCards(uniqueIds);

  // ── Config d'animation stable : capturée UNE SEULE FOIS au trigger
  // Empêche les re-renders parents de modifier la cible mid-animation
  const animConfigRef = useRef<{ targetX: number; jitter: number }>({
    targetX: 0,
    jitter: 0,
  });

  useEffect(() => {
    if (triggerKey === 0) return;

    setPhase("spinning");
    setWinner(null);

    // Tirage à 2 étages : carte puis grade. Fait UNE SEULE FOIS au début ;
    // l'animation ne fait que mimer la convergence vers ce résultat.
    const outcome = rollPackOutcome(pack);

    const generated: GameCard[] = [];
    for (let i = 0; i < RAIL_LENGTH; i++) {
      if (i === WINNER_INDEX) {
        generated.push(outcome.card);
      } else {
        const randomCard =
          pack.cardPool[Math.floor(Math.random() * pack.cardPool.length)];
        generated.push(randomCard);
      }
    }
    setRail(generated);

    // Capture la config d'animation MAINTENANT, pas dans le render
    const containerWidth =
      typeof window !== "undefined" ? Math.min(window.innerWidth, 1100) : 1100;
    const cardFullW = CARD_W + CARD_GAP;
    const targetX = WINNER_INDEX * cardFullW - containerWidth / 2 + CARD_W / 2;
    // Jitter réduit à ±15px pour rester clairement sur la carte gagnante
    const jitter = (Math.random() - 0.5) * 30;
    animConfigRef.current = { targetX, jitter };

    const timer = setTimeout(() => {
      setWinner(outcome);
      setPhase("revealed");
      onCompleteEvent(outcome.card, outcome.grade, outcome.price);
    }, 5200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  const { targetX, jitter } = animConfigRef.current;

  return (
    <div className="relative w-full">
      {/* RAIL CS:GO */}
      <div
        className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border"
        style={{
          height: 200,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.5), var(--color-bg-elevated), rgba(0,0,0,0.5))",
          borderColor: "var(--color-border-strong)",
          boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Indicateur central */}
        <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-20 pointer-events-none">
          <div
            className="absolute left-1/2 -translate-x-1/2 -top-1"
            style={{ filter: "drop-shadow(0 0 8px rgba(255,204,0,0.8))" }}
          >
            <ChevronDown
              size={28}
              strokeWidth={3}
              style={{ color: "var(--color-pokemon-yellow)" }}
            />
          </div>
          <div
            className="w-[2px] h-full mx-auto"
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--color-pokemon-yellow) 20%, var(--color-pokemon-yellow) 80%, transparent)",
              boxShadow: "0 0 12px rgba(255,204,0,0.6)",
            }}
          />
        </div>

        {/* Vignettings */}
        <div
          className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, var(--color-bg-elevated), transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(-90deg, var(--color-bg-elevated), transparent)",
          }}
        />

        {/* RAIL */}
        <motion.div
          ref={railRef}
          className="flex items-center h-full"
          style={{ gap: CARD_GAP, paddingLeft: 12 }}
          initial={{ x: 0 }}
          animate={phase === "spinning" ? { x: -(targetX + jitter) } : { x: 0 }}
          transition={
            phase === "spinning"
              ? { duration: 5, ease: [0.15, 0.55, 0.15, 1] }
              : { duration: 0 }
          }
        >
          {rail.map((card, i) => (
            <RailCard key={`${card.id}-${i}`} card={card} />
          ))}
        </motion.div>

        {phase === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-[14px] font-medium"
              style={{ color: "var(--color-text-muted)" }}
            >
              En attente d&apos;ouverture…
            </p>
          </div>
        )}
      </div>

      {/* RÉSULTAT */}
      <AnimatePresence>
        {phase === "revealed" && winner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex flex-col items-center"
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.5px] mb-3 flex items-center gap-1.5"
              style={{ color: "var(--color-pokemon-yellow)" }}
            >
              <Sparkles size={11} />
              Tu as gagné
            </p>
            <WinnerReveal
              winner={winner.card}
              grade={winner.grade}
              price={winner.price}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sous-composants ─────────────────────────────────────────────────────

/**
 * Fallback graphique riche quand la carte n'a pas d'image TCGdex.
 * Affiche le nom + valeur + un gradient stylé selon l'énergie/rareté.
 */
function CardFallback({
  card,
  displayName,
  size,
}: {
  card: GameCard;
  displayName: string;
  size: "small" | "large";
}) {
  const isLegendary = [
    "shining",
    "gold-star",
    "crystal",
    "secret-rare",
    "rainbow-rare",
  ].includes(card.rarity);
  const nameSize = size === "small" ? "text-[11px]" : "text-[15px]";
  const valueSize = size === "small" ? "text-[10px]" : "text-[13px]";
  const padding = size === "small" ? "p-2" : "p-4";

  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-between ${padding} text-center`}
      style={{
        background: isLegendary
          ? "linear-gradient(155deg, #FFD700, #FFA500 45%, #FFEB3B)"
          : energyGradient(card.energy),
      }}
    >
      {/* Pattern décoratif */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.3) 0, transparent 50%)",
        }}
      />
      {/* Shimmer holo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
        }}
      />

      <span
        className={`relative ${valueSize} font-semibold uppercase tracking-[1px] z-10`}
        style={{
          color: "rgba(255,255,255,0.8)",
          fontFamily: "var(--font-display)",
        }}
      >
        {isLegendary ? "✨ LÉGENDAIRE" : card.rarity.toUpperCase()}
      </span>

      <span
        className={`relative ${nameSize} font-extrabold z-10 leading-tight px-1`}
        style={{
          fontFamily: "var(--font-display)",
          color: "#fff",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          letterSpacing: "-0.01em",
        }}
      >
        {displayName}
      </span>

      <span
        className={`relative ${valueSize} font-bold tabular-nums z-10`}
        style={{
          fontFamily: "var(--font-mono)",
          color: "#fff",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
        }}
      >
        ${card.value.toFixed(2)}
      </span>
    </div>
  );
}

function RailCard({ card }: { card: GameCard }) {
  const { data: tcgCard, isLoading } = useTCGdexCard(card.id);
  const imageUrl = tcgdexImageUrl(tcgCard, "high") ?? card.imageUrl;
  const displayName = tcgCard?.name ?? card.nameFr;

  return (
    <div
      className="flex-shrink-0 relative rounded-[10px] overflow-hidden border-2"
      style={{
        width: CARD_W,
        height: 168,
        borderColor: rarityColor(card.rarity),
        boxShadow: `0 0 18px ${rarityColor(card.rarity).replace(/[\d.]+\)$/, "0.5)")}`,
        background: "var(--color-bg-elevated)",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      ) : isLoading ? (
        // Loading shimmer
        <div className="absolute inset-0 shimmer" />
      ) : (
        <CardFallback card={card} displayName={displayName} size="small" />
      )}
      {/* Bordure inférieure rareté */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: rarityColor(card.rarity) }}
      />
    </div>
  );
}

function WinnerReveal({
  winner,
  grade,
  price,
}: {
  winner: GameCard;
  grade: Grade;
  price: number;
}) {
  const { data: tcgCard, isLoading } = useTCGdexCard(winner.id);
  const imageUrl = tcgdexImageUrl(tcgCard, "high") ?? winner.imageUrl;
  const displayName = tcgCard?.name ?? winner.nameFr;
  const setName = tcgCard?.set?.name ?? winner.setFr;
  const localId = tcgCard?.localId ?? winner.number;
  const gradeColor = GRADE_COLOR[grade];

  return (
    <>
      <motion.div
        className="relative"
        animate={{ rotate: [0, -2, 2, -1, 0] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className="absolute inset-0 rounded-[var(--radius-lg)] -z-10"
          style={{
            background: rarityColor(winner.rarity),
            filter: "blur(40px)",
            transform: "scale(1.4)",
            opacity: 0.7,
          }}
        />
        <div
          className="relative rounded-[var(--radius-md)] overflow-hidden border-2"
          style={{
            width: 220,
            height: 308,
            borderColor: rarityColor(winner.rarity),
            boxShadow: `0 0 60px ${rarityColor(winner.rarity)}`,
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={displayName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : isLoading ? (
            <div className="absolute inset-0 shimmer" />
          ) : (
            <CardFallback
              card={winner}
              displayName={displayName}
              size="large"
            />
          )}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay"
            style={{
              background:
                "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)",
              backgroundSize: "200% 200%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </div>
      </motion.div>

      <div className="mt-4 text-center">
        <p
          className="text-[20px] font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          {displayName}
        </p>
        <p
          className="text-[12px] mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {setName} · #{localId}
        </p>
        {/* Badge de grade — détermine la valeur réelle de l'item */}
        <span
          className="inline-block mt-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[1.5px]"
          style={{
            background: "rgba(0,0,0,0.5)",
            color: gradeColor,
            border: `1.5px solid ${gradeColor}`,
            boxShadow: `0 0 12px ${gradeColor}`,
            fontFamily: "var(--font-display)",
          }}
        >
          {GRADE_LABEL[grade]}
        </span>
        <p
          className="text-[24px] font-extrabold mt-2 tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-positive)",
            textShadow: "0 0 16px var(--color-positive-glow)",
          }}
        >
          +${price.toFixed(2)}
        </p>
      </div>
    </>
  );
}
