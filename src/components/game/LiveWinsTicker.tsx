"use client";

// Bandeau scrollant en boucle des derniers wins. Signature visuelle des
// sites casino TCG (Hellcase, CSGOEmpire, Roobet) — instantanément
// "ça vit, des gens gagnent maintenant".
//
// Pure CSS animation (pas de JS interval) → 0 cost runtime, paused au hover.
// Données mockées pour l'instant ; à brancher sur Supabase realtime en Phase 2
// (channel `pack_openings_recent` filtrant les wins > $50).

import { useMemo } from "react";

interface Win {
  user: string;
  initial: string;
  card: string;
  grade: string;
  value: number;
  energy:
    | "fire"
    | "water"
    | "grass"
    | "lightning"
    | "psychic"
    | "dark"
    | "dragon"
    | "colorless"
    | "metal"
    | "fairy";
}

const WINS: Win[] = [
  {
    user: "Sacha_X",
    initial: "S",
    card: "Lugia Neo",
    grade: "PSA 9",
    value: 1240,
    energy: "colorless",
  },
  {
    user: "OakReborn",
    initial: "O",
    card: "Mewtwo Star",
    grade: "PSA 10",
    value: 3100,
    energy: "psychic",
  },
  {
    user: "L33TJ4",
    initial: "L",
    card: "Rayquaza VMAX",
    grade: "PSA 8",
    value: 420,
    energy: "dragon",
  },
  {
    user: "Drake_Trainer",
    initial: "D",
    card: "Dracaufeu Cristal",
    grade: "PSA 10",
    value: 4832,
    energy: "fire",
  },
  {
    user: "GemHunter",
    initial: "G",
    card: "Mew Star δ",
    grade: "PSA 9",
    value: 590,
    energy: "psychic",
  },
  {
    user: "Eclair42",
    initial: "E",
    card: "Pikachu Star",
    grade: "PSA 10",
    value: 720,
    energy: "lightning",
  },
  {
    user: "NinjaTCG",
    initial: "N",
    card: "Umbreon Star",
    grade: "PSA 9",
    value: 1450,
    energy: "dark",
  },
  {
    user: "BrumeArt",
    initial: "B",
    card: "Crystal Charizard",
    grade: "PSA 8",
    value: 1800,
    energy: "fire",
  },
  {
    user: "Lulu",
    initial: "L",
    card: "Reshiram & Charizard",
    grade: "PSA 10",
    value: 540,
    energy: "fire",
  },
  {
    user: "Tomtom_92",
    initial: "T",
    card: "Charizard VMAX",
    grade: "PSA 9",
    value: 320,
    energy: "fire",
  },
  {
    user: "JadePlume",
    initial: "J",
    card: "Lugia Cristal",
    grade: "PSA 10",
    value: 2100,
    energy: "colorless",
  },
  {
    user: "KaedeFR",
    initial: "K",
    card: "Espeon",
    grade: "PSA 9",
    value: 95,
    energy: "psychic",
  },
];

const ENERGY_COLOR: Record<Win["energy"], string> = {
  fire: "#FF6B47",
  water: "#38BDF8",
  grass: "#22C55E",
  lightning: "#FACC15",
  psychic: "#A855F7",
  dark: "#64748B",
  dragon: "#818CF8",
  colorless: "#94A3B8",
  metal: "#94A3B8",
  fairy: "#EC4899",
};

interface Props {
  /** Hauteur de la bande, en px. */
  height?: number;
  /** Variante avec label "LIVE WINS" sticky à gauche. Désactive pour un look plus minimal. */
  showLabel?: boolean;
}

export function LiveWinsTicker({ height = 56, showLabel = true }: Props) {
  // Duplique le tableau pour permettre une boucle CSS sans saut visible.
  const doubled = useMemo(() => [...WINS, ...WINS], []);

  return (
    <div
      className="relative w-full overflow-hidden border-y"
      style={{
        height,
        background: "rgba(5,7,16,0.72)",
        borderColor: "rgba(0,255,140,0.18)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="region"
      aria-label="Derniers gains live"
    >
      {showLabel && (
        <div
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-2 pl-4 pr-6"
          style={{
            background: "linear-gradient(90deg, #0A0E14 70%, transparent)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full pulse-live flex-shrink-0"
            style={{ background: "#00FF88", boxShadow: "0 0 10px #00FF88" }}
          />
          <span
            className="text-[10px] font-extrabold uppercase tracking-[2px] whitespace-nowrap"
            style={{ color: "#00FF88", fontFamily: "var(--font-display)" }}
          >
            Live wins
          </span>
        </div>
      )}

      <div
        className="flex items-center gap-7 h-full animate-ticker"
        style={{ paddingLeft: showLabel ? 140 : 24 }}
      >
        {doubled.map((w, i) => (
          <WinChip key={i} win={w} />
        ))}
      </div>

      {/* Vignette droite — fade-out du contenu sous le bord */}
      <div
        className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
        style={{
          background: "linear-gradient(-90deg, #0A0E14 30%, transparent)",
        }}
      />
    </div>
  );
}

function WinChip({ win }: { win: Win }) {
  const color = ENERGY_COLOR[win.energy];
  return (
    <div className="flex items-center gap-2.5 flex-shrink-0">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          border: `1px solid ${color}66`,
        }}
      >
        {win.initial}
      </div>
      <div className="flex flex-col leading-none gap-1">
        <span className="text-[11.5px] font-medium whitespace-nowrap">
          <span style={{ color: "#9CA1B0" }}>{win.user}</span>
          <span style={{ color: "#5C6373" }}> · </span>
          <span style={{ color: "#E5E7EB" }}>{win.card}</span>
          <span
            className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[1px] rounded-[3px]"
            style={{
              background: `${color}22`,
              color,
              border: `1px solid ${color}55`,
            }}
          >
            {win.grade}
          </span>
        </span>
        <span
          className="text-[12px] font-extrabold tabular-nums whitespace-nowrap"
          style={{ color: "#00FF88", fontFamily: "var(--font-mono)" }}
        >
          +${win.value.toLocaleString("fr-FR")}
        </span>
      </div>
    </div>
  );
}
