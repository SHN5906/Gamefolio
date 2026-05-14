// Pool curé de "highlight drops" — cartes utilisées par LiveDropsRail
// et LiveWinsTicker pour simuler des wins de joueurs en direct.
//
// Tous les IDs correspondent à des cartes TCGdex réelles, donc l'image
// est récupérée dynamiquement via useTCGdexCard. Aucun asset bundlé.
//
// Phase 2 : remplacer ce mock par un subscribe Supabase realtime sur
// `pack_openings` filtré par valeur > $50.

export interface LiveDrop {
  /** ID TCGdex (cf. https://api.tcgdex.net/v2/fr/cards/{id}) */
  cardId: string;
  /** Nom court FR — utilisé en fallback avant le fetch */
  cardName: string;
  /** Type énergie pour la couleur du chip */
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
  /** Username fictif */
  user: string;
  /** Grade PSA simulé */
  grade: "Raw" | "PSA 5" | "PSA 8" | "PSA 9" | "PSA 10";
  /** Valeur USD finale du drop */
  value: number;
  /** Marque les drops "trophy" (gros wins ou cartes mythiques) */
  isHot?: boolean;
}

export const LIVE_DROPS: LiveDrop[] = [
  // ── Trophy wins (PSA 10, 4 figures+) ──
  {
    cardId: "base1-4",
    cardName: "Dracaufeu",
    energy: "fire",
    user: "Drake_Trainer",
    grade: "PSA 10",
    value: 4832,
    isHot: true,
  },
  {
    cardId: "ecard3-146",
    cardName: "Dracaufeu Cristal",
    energy: "fire",
    user: "BrumeArt",
    grade: "PSA 9",
    value: 3100,
    isHot: true,
  },
  {
    cardId: "neo1-9",
    cardName: "Lugia",
    energy: "colorless",
    user: "JadePlume",
    grade: "PSA 10",
    value: 2480,
    isHot: true,
  },
  {
    cardId: "neo4-107",
    cardName: "Dracaufeu Brillant",
    energy: "fire",
    user: "PyroSan",
    grade: "PSA 9",
    value: 1820,
    isHot: true,
  },
  {
    cardId: "ex8-101",
    cardName: "Mew ☆",
    energy: "psychic",
    user: "OakReborn",
    grade: "PSA 10",
    value: 1450,
    isHot: true,
  },
  {
    cardId: "ex15-100",
    cardName: "Dracaufeu ☆ δ",
    energy: "fire",
    user: "NinjaTCG",
    grade: "PSA 9",
    value: 1240,
    isHot: true,
  },
  // ── Mid wins (PSA 8-9, 3 figures) ──
  {
    cardId: "ex13-104",
    cardName: "Pikachu ☆",
    energy: "lightning",
    user: "Eclair42",
    grade: "PSA 9",
    value: 720,
  },
  {
    cardId: "ex10-17",
    cardName: "Mentali ☆",
    energy: "psychic",
    user: "Lulu",
    grade: "PSA 9",
    value: 540,
  },
  {
    cardId: "ex8-107",
    cardName: "Rayquaza ☆",
    energy: "dragon",
    user: "L33TJ4",
    grade: "PSA 8",
    value: 420,
  },
  {
    cardId: "neo4-65",
    cardName: "Léviator Brillant",
    energy: "water",
    user: "Tomtom_92",
    grade: "PSA 9",
    value: 320,
  },
  {
    cardId: "neo3-7",
    cardName: "Ho-Oh",
    energy: "fire",
    user: "Sacha_X",
    grade: "PSA 9",
    value: 250,
  },
  {
    cardId: "base1-10",
    cardName: "Mewtwo",
    energy: "psychic",
    user: "KaedeFR",
    grade: "PSA 8",
    value: 180,
  },
  // ── Low-tier wins (sub-100, plus crédible) ──
  {
    cardId: "base1-2",
    cardName: "Tortank",
    energy: "water",
    user: "GemHunter",
    grade: "PSA 8",
    value: 95,
  },
  {
    cardId: "base1-15",
    cardName: "Florizarre",
    energy: "grass",
    user: "NeoFighter",
    grade: "PSA 8",
    value: 75,
  },
  {
    cardId: "neo1-5",
    cardName: "Aligatueur",
    energy: "water",
    user: "BluePhoenix",
    grade: "PSA 9",
    value: 110,
  },
  {
    cardId: "neo2-13",
    cardName: "Noctali",
    energy: "dark",
    user: "ShadowZ",
    grade: "PSA 9",
    value: 145,
  },
];

/** Couleur du type énergie — partagée entre composants. */
export const ENERGY_COLOR: Record<LiveDrop["energy"], string> = {
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

/** Couleur du grade PSA — partagée entre composants. */
export const GRADE_COLOR: Record<LiveDrop["grade"], string> = {
  Raw: "#A0A0A0",
  "PSA 5": "#78B4FF",
  "PSA 8": "#A36AFF",
  "PSA 9": "#FFB450",
  "PSA 10": "#FF5050",
};
