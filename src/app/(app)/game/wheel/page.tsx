"use client";

import { useMemo, useState } from "react";
import { Target, Trophy, X, AlertCircle } from "lucide-react";
import { useInventoryGraded } from "@/hooks/useGame";
import { PACKS, priceForGrade } from "@/data/packs";
import {
  finalAngle,
  spinWheel,
  validateSpin,
  winningArcDegrees,
  type ValidationResult,
} from "@/lib/data/wheel";
import type {
  GameCard,
  Grade,
  InventoryItem,
  WheelSpinResult,
} from "@/types/game";
import { WHEEL_HOUSE_EDGE } from "@/types/game";

const GRADE_LABEL: Record<Grade, string> = {
  raw: "RAW",
  "psa-5": "PSA 5",
  "psa-8": "PSA 8",
  "psa-9": "PSA 9",
  "psa-10": "PSA 10",
};

const GRADE_COLOR: Record<Grade, string> = {
  raw: "#A0A0A0",
  "psa-5": "#78B4FF",
  "psa-8": "#A36AFF",
  "psa-9": "#FFB450",
  "psa-10": "#FF5050",
};

// Catalogue plat de toutes les cartes uniques (pour la sélection de cible).
function useTargetCatalog(): GameCard[] {
  return useMemo(() => {
    const map = new Map<string, GameCard>();
    for (const p of PACKS) {
      for (const c of p.cardPool) if (!map.has(c.id)) map.set(c.id, c);
    }
    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  }, []);
}

export default function WheelPage() {
  const { items } = useInventoryGraded();
  const catalog = useTargetCatalog();

  const [stakeIds, setStakeIds] = useState<Set<string>>(new Set());
  const [targetCardId, setTargetCardId] = useState<string>("");
  const [targetGrade, setTargetGrade] = useState<Grade>("psa-9");

  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stakeItems: InventoryItem[] = items.filter((it) => stakeIds.has(it.id));
  const stakeValue = parseFloat(
    stakeItems.reduce((s, it) => s + it.price, 0).toFixed(2),
  );
  const targetCard = catalog.find((c) => c.id === targetCardId) ?? null;
  const targetPrice = targetCard ? priceForGrade(targetCard, targetGrade) : 0;

  const validation: ValidationResult = targetCard
    ? validateSpin(stakeValue, targetPrice, stakeItems)
    : { ok: false, reason: "stake-empty", probability: 0 };
  const probability = validation.probability;
  const probabilityPct = (probability * 100).toFixed(1);
  const arcDeg = winningArcDegrees(probability);

  function toggleStake(id: string) {
    if (spinning) return;
    setStakeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setResult(null);
  }

  function handleSpin() {
    if (!validation.ok || !targetCard || spinning) return;
    setError(null);
    setSpinning(true);
    setResult(null);

    // Calcul du résultat AVANT animation : l'animation converge vers le résultat
    const res = spinWheel(
      { stake: stakeItems, targetCardId: targetCard.id, targetGrade },
      targetCard,
    );

    const final = finalAngle(res.won, res.probability, 3);
    setAngle((prev) => prev + final);

    // Durée d'animation matchée avec la transition CSS
    setTimeout(() => {
      setResult(res);
      setSpinning(false);
      setStakeIds(new Set()); // toutes les cartes mises sont consommées
    }, 5500);
  }

  return (
    <div
      className="min-h-full page-enter"
      style={{ position: "relative", zIndex: 1 }}
    >
      <div
        className="px-4 sm:px-6 md:px-8 pt-6 pb-16 mx-auto"
        style={{ maxWidth: 1280 }}
      >
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} style={{ color: "var(--color-brand)" }} />
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Roue d&apos;upgrade · House edge{" "}
              {Math.round((1 - WHEEL_HOUSE_EDGE) * 100)}%
            </p>
          </div>
          <h1
            className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-text-primary)",
            }}
          >
            Upgrade Wheel
          </h1>
          <p
            className="mt-3 text-[13px] max-w-[640px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Mise une ou plusieurs cartes de ton inventaire pour tenter de gagner
            une carte plus chère. Plus ta mise est proche de la valeur cible,
            plus ta chance est grande.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Colonne gauche : sélection mise + cible */}
          <div className="space-y-6">
            {/* Mise */}
            <section
              className="rounded-[var(--radius-md)] border p-5"
              style={{
                background: "var(--color-bg-glass)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2
                className="text-[12px] font-semibold uppercase tracking-[1.4px] mb-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                Cartes mises · Valeur totale ${stakeValue.toFixed(2)}
              </h2>
              {items.length === 0 ? (
                <p
                  className="text-[13px]"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Aucune carte en inventaire. Ouvre une caisse d&apos;abord.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {items.map((it) => (
                    <StakeChip
                      key={it.id}
                      item={it}
                      selected={stakeIds.has(it.id)}
                      onClick={() => toggleStake(it.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Cible */}
            <section
              className="rounded-[var(--radius-md)] border p-5"
              style={{
                background: "var(--color-bg-glass)",
                borderColor: "var(--color-border)",
              }}
            >
              <h2
                className="text-[12px] font-semibold uppercase tracking-[1.4px] mb-3"
                style={{ color: "var(--color-text-muted)" }}
              >
                Carte cible
              </h2>
              <div className="flex gap-2 mb-3">
                <select
                  value={targetCardId}
                  onChange={(e) => {
                    setTargetCardId(e.target.value);
                    setResult(null);
                  }}
                  className="flex-1 h-10 px-3 rounded-[var(--radius-sm)] border text-[13px]"
                  style={{
                    background: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  <option value="">— Choisir une carte —</option>
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameFr} · {c.setFr} — ${c.value.toFixed(0)} raw
                    </option>
                  ))}
                </select>
                <select
                  value={targetGrade}
                  onChange={(e) => {
                    setTargetGrade(e.target.value as Grade);
                    setResult(null);
                  }}
                  className="h-10 px-3 rounded-[var(--radius-sm)] border text-[13px]"
                  style={{
                    background: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {(
                    ["raw", "psa-5", "psa-8", "psa-9", "psa-10"] as Grade[]
                  ).map((g) => (
                    <option key={g} value={g}>
                      {GRADE_LABEL[g]}
                    </option>
                  ))}
                </select>
              </div>
              {targetCard && (
                <div
                  className="text-[12px] tabular-nums"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Valeur cible :{" "}
                  <span
                    style={{
                      color: "var(--color-positive)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    ${targetPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </section>
          </div>

          {/* Colonne droite : roue */}
          <div className="space-y-4">
            <WheelDisplay angle={angle} arcDeg={arcDeg} spinning={spinning} />

            <div
              className="rounded-[var(--radius-md)] border p-4"
              style={{
                background: "var(--color-bg-glass)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex justify-between text-[12px] mb-2">
                <span style={{ color: "var(--color-text-muted)" }}>
                  Probabilité
                </span>
                <span
                  className="font-extrabold tabular-nums"
                  style={{
                    color: "var(--color-positive)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {probabilityPct}%
                </span>
              </div>
              {validation.ok ? null : <ValidationHint v={validation} />}
            </div>

            <button
              onClick={handleSpin}
              disabled={!validation.ok || spinning}
              className="w-full h-12 rounded-[var(--radius-sm)] font-extrabold text-[14px] text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              style={{
                fontFamily: "var(--font-display)",
                background:
                  "linear-gradient(135deg, var(--color-brand), var(--color-cyan))",
                boxShadow: "0 0 24px var(--color-brand-glow)",
              }}
            >
              {spinning ? "Spin en cours…" : `Spin (${probabilityPct}%)`}
            </button>

            {result && (
              <ResultBanner result={result} probability={probability} />
            )}
            {error && (
              <div
                className="px-3 py-2 rounded-[var(--radius-sm)] border flex items-center gap-2 text-[12px]"
                style={{
                  borderColor: "var(--color-negative)",
                  color: "var(--color-negative)",
                }}
              >
                <AlertCircle size={13} />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StakeChip({
  item,
  selected,
  onClick,
}: {
  item: InventoryItem;
  selected: boolean;
  onClick: () => void;
}) {
  const color = GRADE_COLOR[item.grade];
  return (
    <button
      onClick={onClick}
      className="text-left rounded-[var(--radius-sm)] border px-3 py-2 transition-colors"
      style={{
        background: selected
          ? "var(--color-bg-glass-hi)"
          : "var(--color-bg-elevated)",
        borderColor: selected ? color : "var(--color-border)",
        boxShadow: selected ? `0 0 12px ${color}80` : "none",
      }}
    >
      <p
        className="text-[11px] font-bold truncate"
        style={{ color: "var(--color-text-primary)" }}
      >
        {item.card.nameFr}
      </p>
      <div className="flex items-center justify-between mt-1">
        <span
          className="text-[9px] font-extrabold uppercase tracking-[1.2px]"
          style={{ color }}
        >
          {GRADE_LABEL[item.grade]}
        </span>
        <span
          className="text-[11px] tabular-nums"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-positive)",
          }}
        >
          ${item.price.toFixed(2)}
        </span>
      </div>
    </button>
  );
}

function ValidationHint({
  v,
}: {
  v: Extract<ValidationResult, { ok: false }>;
}) {
  const text = (() => {
    switch (v.reason) {
      case "stake-empty":
        return "Sélectionne au moins une carte à miser.";
      case "stake-ge-target":
        return "Ta mise est égale ou supérieure à la cible — choisis une cible plus chère.";
      case "ratio-too-low":
        return "Mise trop faible (< 10% de la cible). Augmente ta mise.";
      case "ratio-too-high":
        return "Mise trop élevée (> 90% de la cible). Baisse ta mise.";
      case "stake-locked":
        return "Une des cartes mises est verrouillée par une autre action.";
      default:
        return "";
    }
  })();
  if (!text) return null;
  return (
    <p
      className="text-[11px] mt-1"
      style={{ color: "var(--color-text-muted)" }}
    >
      {text}
    </p>
  );
}

function ResultBanner({
  result,
  probability,
}: {
  result: WheelSpinResult;
  probability: number;
}) {
  if (result.won && result.rewardCard) {
    return (
      <div
        className="px-4 py-3 rounded-[var(--radius-md)] border flex items-center gap-3"
        style={{
          borderColor: "var(--color-positive)",
          background: "var(--color-bg-glass)",
          boxShadow: "0 0 24px var(--color-positive-glow)",
        }}
      >
        <Trophy size={20} style={{ color: "var(--color-positive)" }} />
        <div className="flex-1 min-w-0">
          <p
            className="text-[12px] font-semibold uppercase tracking-[1.4px]"
            style={{ color: "var(--color-positive)" }}
          >
            Gagné ({(probability * 100).toFixed(1)}%)
          </p>
          <p
            className="text-[13px] font-bold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {result.rewardCard.card.nameFr}
            <span
              className="ml-2 text-[10px] font-extrabold uppercase tracking-[1.2px]"
              style={{ color: GRADE_COLOR[result.rewardCard.grade] }}
            >
              {GRADE_LABEL[result.rewardCard.grade]}
            </span>
          </p>
          <p
            className="text-[12px] tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-positive)",
            }}
          >
            +${result.rewardCard.price.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div
      className="px-4 py-3 rounded-[var(--radius-md)] border flex items-center gap-3"
      style={{
        borderColor: "var(--color-negative)",
        background: "var(--color-bg-glass)",
      }}
    >
      <X size={20} style={{ color: "var(--color-negative)" }} />
      <div className="flex-1 min-w-0">
        <p
          className="text-[12px] font-semibold uppercase tracking-[1.4px]"
          style={{ color: "var(--color-negative)" }}
        >
          Perdu ({(probability * 100).toFixed(1)}%)
        </p>
        <p
          className="text-[12px]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          La mise a été consommée. Rejoue avec une mise différente ou une cible
          moins chère.
        </p>
      </div>
    </div>
  );
}

function WheelDisplay({
  angle,
  arcDeg,
  spinning,
}: {
  angle: number;
  arcDeg: number;
  spinning: boolean;
}) {
  // Roue SVG : un cercle plein rouge avec un arc vert proportionnel à la chance
  const size = 320;
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;

  // Coordonnées de l'arc vert (commence à 12h, va dans le sens horaire)
  const startAngle = -90;
  const endAngle = -90 + arcDeg;
  const arcPath = describeArc(cx, cy, r, startAngle, endAngle);

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Pointer fixe en haut */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-2 z-10"
        style={{ filter: "drop-shadow(0 0 8px rgba(255,204,0,0.8))" }}
      >
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderTop: "14px solid var(--color-pokemon-yellow)",
          }}
        />
      </div>

      <svg
        width={size}
        height={size}
        style={{
          transform: `rotate(${angle}deg)`,
          transition: spinning
            ? "transform 5s cubic-bezier(0.15, 0.55, 0.15, 1)"
            : "none",
        }}
      >
        {/* Fond rouge (zone de perte) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="rgba(255,80,80,0.25)"
          stroke="rgba(255,80,80,0.6)"
          strokeWidth={2}
        />
        {/* Arc vert (zone de gain) */}
        {arcDeg > 0 && (
          <path
            d={arcPath}
            fill="rgba(0,214,143,0.5)"
            stroke="rgba(0,214,143,0.95)"
            strokeWidth={2.5}
          />
        )}
        {/* Centre */}
        <circle
          cx={cx}
          cy={cy}
          r={28}
          fill="var(--color-bg-elevated)"
          stroke="var(--color-border-strong)"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  if (endAngle - startAngle >= 360) {
    // Cercle complet — décrit en 2 demi-arcs pour rester compatible SVG
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${largeArc} 1 ${start.x} ${start.y} Z`;
}
