"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Wand2,
  AlertCircle,
} from "lucide-react";
import {
  useBalance,
  useInventoryGraded,
  useRegradeItem,
} from "@/hooks/useGame";
import { getPackById } from "@/data/packs";
import {
  REGRADE_COST_USD,
  type Grade,
  type InventoryItem,
  type RegradeResult,
} from "@/types/game";

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

export default function RegradePage() {
  const { balance } = useBalance();
  const { items } = useInventoryGraded();
  const regrade = useRegradeItem();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<RegradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => items.find((it) => it.id === selectedId) ?? null,
    [items, selectedId],
  );

  const canAfford = balance >= REGRADE_COST_USD;

  function handleRegrade() {
    if (!selected) return;
    setError(null);
    // On utilise le pack 'pack-kanto-base' comme distribution par défaut.
    // À terme : table regrade_distribution côté BDD (cf. ARCHITECTURE.md §3.2).
    const pack =
      getPackById("pack-kanto-base") ?? getPackById(selected.card.id);
    if (!pack) {
      setError("Distribution de grade indisponible");
      return;
    }
    const res = regrade(selected.id, pack);
    if (!res.success) {
      setError(res.reason ?? "unknown");
      return;
    }
    setLastResult(res.result ?? null);
    setSelectedId(null);
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
        <div className="flex items-end justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wand2
                size={14}
                style={{ color: "var(--color-pokemon-yellow)" }}
              />
              <p
                className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                style={{ color: "var(--color-text-muted)" }}
              >
                Re-gradation · Tente ta chance pour upgrader une carte
              </p>
            </div>
            <h1
              className="text-[28px] sm:text-[32px] font-extrabold tracking-tight leading-none"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-text-primary)",
              }}
            >
              Re-grade — ${REGRADE_COST_USD}
            </h1>
            <p
              className="mt-3 text-[13px] max-w-[600px]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Détruit ta carte actuelle et tire un nouveau grade au hasard. Tu
              peux gagner un PSA 10 ou tomber sur du Raw. La carte (Pokémon,
              set, numéro) reste la même : seul l&apos;état change.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p
              className="text-[10px] font-semibold uppercase tracking-[1.4px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Solde
            </p>
            <p
              className="text-[20px] font-bold tabular-nums"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-positive)",
              }}
            >
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {lastResult && (
          <LastResultCard
            result={lastResult}
            onDismiss={() => setLastResult(null)}
          />
        )}

        {error && (
          <div
            className="mb-5 px-4 py-3 rounded-[var(--radius-md)] border flex items-center gap-2 text-[12px]"
            style={{
              borderColor: "var(--color-negative)",
              background: "var(--color-bg-glass)",
              color: "var(--color-negative)",
            }}
          >
            <AlertCircle size={14} />
            {humanError(error)}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it) => (
              <ItemTile
                key={it.id}
                item={it}
                selected={selectedId === it.id}
                onSelect={() => setSelectedId(it.id)}
              />
            ))}
          </div>
        )}

        {/* Sticky action bar */}
        {selected && (
          <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-8 sm:left-auto sm:bottom-6 z-40">
            <div
              className="rounded-[var(--radius-lg)] border overflow-hidden"
              style={{
                background: "var(--color-bg-elevated)",
                borderColor: "var(--color-border-strong)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              }}
            >
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[1.4px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Carte sélectionnée
                  </p>
                  <p
                    className="text-[14px] font-bold truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {selected.card.nameFr}
                    <span
                      className="ml-2 text-[10px] font-extrabold uppercase tracking-[1.2px]"
                      style={{ color: GRADE_COLOR[selected.grade] }}
                    >
                      {GRADE_LABEL[selected.grade]}
                    </span>
                  </p>
                  <p
                    className="text-[12px] tabular-nums"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "var(--color-positive)",
                    }}
                  >
                    ${selected.price.toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={handleRegrade}
                  disabled={!canAfford}
                  className="h-11 px-5 rounded-[var(--radius-sm)] text-[13px] font-extrabold text-white flex items-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-pokemon-yellow), #FF9500)",
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 0 24px rgba(255,180,80,0.5)",
                  }}
                >
                  <Sparkles size={14} />
                  Re-grader — ${REGRADE_COST_USD}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ItemTile({
  item,
  selected,
  onSelect,
}: {
  item: InventoryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const color = GRADE_COLOR[item.grade];
  return (
    <button
      onClick={onSelect}
      className="text-left rounded-[var(--radius-md)] border p-4 transition-all hover:scale-[1.01]"
      style={{
        background: selected
          ? "var(--color-bg-glass-hi)"
          : "var(--color-bg-glass)",
        borderColor: selected ? color : "var(--color-border)",
        boxShadow: selected ? `0 0 16px ${color}66` : "none",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p
          className="text-[14px] font-bold leading-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {item.card.nameFr}
        </p>
        <span
          className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-[1.2px]"
          style={{
            background: "rgba(0,0,0,0.35)",
            color,
            border: `1px solid ${color}`,
          }}
        >
          {GRADE_LABEL[item.grade]}
        </span>
      </div>
      <p
        className="text-[11px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {item.card.setFr} · #{item.card.number}
      </p>
      <p
        className="text-[14px] font-extrabold mt-2 tabular-nums"
        style={{
          fontFamily: "var(--font-mono)",
          color: "var(--color-positive)",
        }}
      >
        ${item.price.toFixed(2)}
      </p>
    </button>
  );
}

function LastResultCard({
  result,
  onDismiss,
}: {
  result: RegradeResult;
  onDismiss: () => void;
}) {
  const up = result.delta >= 0;
  const color = up ? "var(--color-positive)" : "var(--color-negative)";
  return (
    <div
      className="mb-5 p-5 rounded-[var(--radius-md)] border flex items-center gap-4"
      style={{
        background: "var(--color-bg-glass)",
        borderColor: color,
        boxShadow: `0 0 24px ${up ? "var(--color-positive-glow)" : "rgba(255,80,80,0.3)"}`,
      }}
    >
      {up ? (
        <TrendingUp size={28} style={{ color }} />
      ) : (
        <TrendingDown size={28} style={{ color }} />
      )}
      <div className="flex-1 min-w-0">
        <p
          className="text-[12px] font-semibold uppercase tracking-[1.4px]"
          style={{ color }}
        >
          {up ? "Bingo ! Grade upgradé" : "Grade downgradé"}
        </p>
        <p
          className="text-[14px] font-bold"
          style={{ color: "var(--color-text-primary)" }}
        >
          {result.card.nameFr} :{" "}
          <span style={{ color: GRADE_COLOR[result.oldGrade] }}>
            {GRADE_LABEL[result.oldGrade]}
          </span>
          {" → "}
          <span style={{ color: GRADE_COLOR[result.newGrade] }}>
            {GRADE_LABEL[result.newGrade]}
          </span>
        </p>
        <p
          className="text-[12px] tabular-nums"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ${result.oldPrice.toFixed(2)} → ${result.newPrice.toFixed(2)}{" "}
          <span style={{ color }}>
            ({up ? "+" : ""}${result.delta.toFixed(2)})
          </span>
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-[11px] font-medium px-3 py-1.5 rounded-[var(--radius-sm)] border"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text-muted)",
        }}
      >
        OK
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <p
        className="text-[14px]"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Aucune carte en inventaire. Ouvre une caisse d&apos;abord.
      </p>
      <Link
        href="/game"
        className="inline-block mt-3 text-[12px] font-medium"
        style={{ color: "var(--color-brand)" }}
      >
        Aller aux caisses →
      </Link>
    </div>
  );
}

function humanError(code: string): string {
  switch (code) {
    case "item-not-found":
      return "Cette carte n'est plus dans ton inventaire.";
    case "item-locked":
      return "Cette carte est verrouillée par une autre action en cours.";
    case "insufficient-balance":
      return `Solde insuffisant (besoin de $${REGRADE_COST_USD}).`;
    default:
      return code;
  }
}
